import re
import numpy as np
import librosa
import whisper
import os
import subprocess
from typing import Dict, Any
from moviepy import VideoFileClip
import imageio_ffmpeg

import shutil

# -------------------------------
# CRITICAL FIX FOR WINDOWS
# Add the bundled FFmpeg to system PATH so Whisper can find it
# AND ensure we have a binary named 'ffmpeg.exe'
# -------------------------------
try:
    ffmpeg_exe_path = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe_path)
    
    # Check if we need to create an alias/copy named 'ffmpeg.exe'
    target_ffmpeg = os.path.join(ffmpeg_dir, "ffmpeg.exe")
    if not os.path.exists(target_ffmpeg):
        print(f"Creating ffmpeg.exe alias from {ffmpeg_exe_path}")
        shutil.copy(ffmpeg_exe_path, target_ffmpeg)
        
    os.environ["PATH"] += os.pathsep + ffmpeg_dir
    print(f"✅ Auto-configured FFmpeg for Whisper: {ffmpeg_dir}")
except Exception as e:
    print(f"⚠️ FFmpeg path setup warning: {e}")

# -------------------------------
# CONFIGURATION
# -------------------------------

FILLER_WORDS = {
    "um", "uh", "umm", "uhh",
    "like", "you know",
    "actually", "basically"
}

PAUSE_THRESHOLD_SEC = 0.6


# -------------------------------
# UTILITY FUNCTIONS
# -------------------------------

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text


def count_words(text: str) -> int:
    return len(text.split())


# -------------------------------
# CORE ANALYZER CLASS
# -------------------------------

class SpeechAnalyzer:
    def __init__(self, model_name: str = "base"):
        # Load ASR model once
        try:
            self.asr_model = whisper.load_model(model_name)
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            self.asr_model = None

    def extract_audio(self, video_path: str, output_audio_path: str) -> str:
        """Extracts audio directly using the bundled FFmpeg binary."""
        if os.path.exists(output_audio_path):
            os.remove(output_audio_path)
            
        try:
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            
            # Convert to 16kHz mono WAV (ideal for Whisper/Librosa)
            command = [
                ffmpeg_exe, "-y",
                "-i", video_path,
                "-vn",
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                output_audio_path
            ]
            
            # Run ffmpeg (capture output to debugging purposes if needed)
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            return output_audio_path
            
        except subprocess.CalledProcessError as e:
            error_log = e.stderr.decode() if e.stderr else "Unknown error"
            print(f"FFmpeg Extraction Failed: {error_log}")
            raise RuntimeError(f"FFmpeg error: {error_log}")
        except Exception as e:
            print(f"General Extraction Error: {e}")
            raise RuntimeError(f"Audio extraction error: {e}")

    def run_full_analysis(self, video_path: str) -> Dict[str, Any]:
        """Runs the entire pipeline from extraction to analysis."""
        # Use wav for max compatibility
        audio_path = video_path.replace(".webm", ".wav").replace(".mp4", ".wav")
        try:
            self.extract_audio(video_path, audio_path)
            
            # Load audio for librosa
            y, sr = librosa.load(audio_path, sr=None)
            duration_sec = librosa.get_duration(y=y, sr=sr)

            # 1. Transcribe
            if not self.asr_model:
                return {"transcript": "(Model unavailable)", "speech_score": 0}
            
            result = self.asr_model.transcribe(audio_path)
            transcript = result["text"]

            # 2. Speech Rate
            text = clean_text(transcript)
            words = count_words(text)
            minutes = duration_sec / 60
            wpm = round(words / minutes, 2) if minutes > 0 else 0.0

            # 3. Filler Rate
            filler_count = sum(text.count(f) for f in FILLER_WORDS)
            filler_rate = round((filler_count / words) * 100, 2) if words > 0 else 0.0

            # 4. Pause Analysis
            speech_segments = librosa.effects.split(y, top_db=25)
            pauses = []
            prev_end = 0
            for start, end in speech_segments:
                pause_duration = (start - prev_end) / sr
                if pause_duration > PAUSE_THRESHOLD_SEC:
                    pauses.append(pause_duration)
                prev_end = end
            avg_pause = np.mean(pauses) if pauses else 0.0
            pause_count = len(pauses)

            # 5. Pitch Variance
            pitches, _ = librosa.piptrack(y=y, sr=sr)
            pitch_values = pitches[pitches > 0]
            pitch_var = round(np.std(pitch_values), 2) if len(pitch_values) > 0 else 0.0

            # 6. Volume Stability
            rms_energy = librosa.feature.rms(y=y)[0]
            volume_var = round(np.std(rms_energy), 4)

            # 7. Scores (Heuristic)
            fluency_score = max(0, 100 - filler_rate * 5 - pause_count * 3)
            pitch_score = min(100, (pitch_var / 50) * 100)
            volume_score = max(0, 100 - volume_var * 500)

            speech_score = round(
                0.4 * fluency_score +
                0.3 * pitch_score +
                0.3 * volume_score,
                2
            )

            return {
                "transcript": transcript,
                "speech_rate_wpm": wpm,
                "filler_rate_pct": filler_rate,
                "average_pause_sec": round(avg_pause, 2),
                "pause_count": pause_count,
                "pitch_variance": pitch_var,
                "volume_stability": volume_var,
                "speech_score": speech_score,
                "status": "success"
            }

        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)

speech_analyzer = SpeechAnalyzer()
