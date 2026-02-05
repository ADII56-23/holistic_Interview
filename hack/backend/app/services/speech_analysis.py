import os
import subprocess
import whisper
import numpy as np
from typing import Dict, List, Any

class SpeechAnalyzer:
    def __init__(self, model_name: str = "base"):
        self.model = whisper.load_model(model_name)
        self.filler_words = ["um", "uh", "er", "ah", "hmm", "like", "basically", "actually", "literally"]

    def extract_audio(self, video_path: str, output_audio_path: str) -> str:
        """Extracts audio from video using FFmpeg."""
        if os.path.exists(output_audio_path):
            os.remove(output_audio_path)
            
        command = [
            "ffmpeg", "-i", video_path,
            "-vn", "-acodec", "libmp3lame", "-ar", "16000", "-ac", "1",
            output_audio_path
        ]
        
        try:
            subprocess.run(command, check=True, capture_output=True)
            return output_audio_path
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg error: {e.stderr.decode()}")

    def transcribe(self, audio_path: str) -> Dict[str, Any]:
        """Transcribes audio using Whisper with word-level timestamps."""
        result = self.model.transcribe(audio_path, word_timestamps=True)
        return result

    def analyze_fillers(self, transcript: Dict[str, Any]) -> Dict[str, Any]:
        """Detects filler words and calculates metrics."""
        words = []
        for segment in transcript.get("segments", []):
            for word_info in segment.get("words", []):
                words.append(word_info)

        filler_hits = []
        total_words = len(words)
        
        for w in words:
            clean_word = w["word"].strip().lower().replace(".", "").replace(",", "")
            if clean_word in self.filler_words:
                filler_hits.append(w)

        filler_count = len(filler_hits)
        filler_rate = (filler_count / total_words * 100) if total_words > 0 else 0

        return {
            "filler_count": filler_count,
            "total_words": total_words,
            "filler_rate": round(filler_rate, 2),
            "filler_instances": filler_hits
        }

    def analyze_pace(self, transcript: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates speaking pace in Words Per Minute (WPM)."""
        duration = transcript.get("duration", 0)
        total_words = len([w for s in transcript.get("segments", []) for w in s.get("words", [])])
        
        if duration == 0:
            return {"wpm": 0, "status": "unknown"}
            
        wpm = (total_words / duration) * 60
        
        status = "normal"
        if wpm > 160: status = "fast"
        elif wpm < 110: status = "slow"
        
        return {
            "wpm": round(wpm, 1),
            "duration_seconds": round(duration, 1),
            "status": status
        }

    def run_full_analysis(self, video_path: str) -> Dict[str, Any]:
        """Runs the entire pipeline from extraction to analysis."""
        audio_path = video_path.replace(".webm", ".mp3").replace(".mp4", ".mp3")
        try:
            self.extract_audio(video_path, audio_path)
            transcript = self.transcribe(audio_path)
            
            fillers = self.analyze_fillers(transcript)
            pace = self.analyze_pace(transcript)
            
            return {
                "transcript": transcript["text"],
                "fillers": fillers,
                "pace": pace,
                "raw_transcript": transcript
            }
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)

speech_analyzer = SpeechAnalyzer()
