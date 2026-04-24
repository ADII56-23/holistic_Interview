"""
AUDIO/VERBAL COMMUNICATION ANALYSIS MODULE
===========================================

Complete production-ready implementation for analyzing verbal communication
during interviews, including speech analysis, filler word detection, pause
analysis, pitch variance, tone modulation, and volume stability.

Author: Senior AI Engineer
Version: 1.0
License: MIT
"""

import librosa
import numpy as np
import noisereduce as nr
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
import re
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class VerbalMetrics:
    """Complete verbal communication metrics"""
    
    # Speech Rate Metrics
    speech_rate_wpm: float
    word_count: int
    duration_seconds: float
    speech_rate_assessment: str  # "too_slow", "optimal", "too_fast"
    
    # Filler Word Metrics
    filler_word_count: int
    filler_rate_per_minute: float
    filler_words_detected: List[str]
    filler_assessment: str  # "excellent", "good", "moderate", "needs_work"
    
    # Pause Metrics
    pause_count: int
    avg_pause_duration: float
    pause_duration_std: float
    long_pause_count: int  # pauses > 2 seconds
    pause_assessment: str  # "natural", "acceptable", "awkward", "excessive"
    
    # Pitch Metrics
    pitch_mean_hz: float
    pitch_std_hz: float
    pitch_variance: float
    pitch_cv_percent: float  # Coefficient of variation
    monotony_score: float  # 0-100, higher = more monotone
    pitch_assessment: str  # "expressive", "moderate", "monotone"
    
    # Volume Metrics
    volume_mean_db: float
    volume_std_db: float
    volume_stability_score: float  # 0-100, higher = more stable
    volume_assessment: str  # "stable", "moderate", "unstable"
    
    # Tone Modulation
    tone_modulation_score: float  # 0-100
    tone_assessment: str  # "engaging", "acceptable", "flat"
    
    # Overall Clarity
    clarity_score: float  # 0-100
    clarity_assessment: str  # "excellent", "good", "acceptable", "poor"
    
    # Quality Flags
    audio_quality_score: float  # 0-100
    noise_detected: bool
    clipping_detected: bool
    silence_percentage: float
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return asdict(self)
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class FillerWord:
    """Individual filler word occurrence"""
    word: str
    timestamp: float
    context: str  # Surrounding words


@dataclass
class Pause:
    """Individual pause occurrence"""
    start_time: float
    end_time: float
    duration: float
    pause_type: str  # "short", "normal", "long", "excessive"


# ============================================================================
# CONFIGURATION
# ============================================================================

class AudioAnalysisConfig:
    """Configuration for audio analysis"""
    
    # Filler word lexicon (expandable)
    FILLER_WORDS = [
        'um', 'uh', 'uhm', 'umm', 'ah', 'er', 'erm',
        'like', 'you know', 'i mean', 'sort of', 'kind of',
        'basically', 'actually', 'literally', 'right',
        'so', 'well', 'okay', 'alright'
    ]
    
    # Speech rate thresholds (words per minute)
    WPM_TOO_SLOW = 100
    WPM_OPTIMAL_MIN = 120
    WPM_OPTIMAL_MAX = 160
    WPM_TOO_FAST = 180
    
    # Filler word rate thresholds (per minute)
    FILLER_EXCELLENT = 1.0
    FILLER_GOOD = 2.0
    FILLER_MODERATE = 4.0
    
    # Pause thresholds (seconds)
    PAUSE_SHORT = 0.3
    PAUSE_NORMAL_MAX = 0.8
    PAUSE_LONG = 1.5
    PAUSE_EXCESSIVE = 2.0
    
    # Pitch analysis thresholds
    PITCH_MIN_HZ = 75  # Minimum detectable pitch (male voices)
    PITCH_MAX_HZ = 400  # Maximum detectable pitch (female voices)
    PITCH_CV_EXPRESSIVE = 15  # CV% for expressive speech
    PITCH_CV_MONOTONE = 10  # CV% threshold for monotone
    
    # Volume analysis
    VOLUME_STABLE_THRESHOLD = 20  # dB variance for stable volume
    
    # Audio quality
    SNR_THRESHOLD = -10  # Signal-to-noise ratio in dB
    CLIPPING_THRESHOLD = 0.99  # Amplitude threshold for clipping
    SILENCE_THRESHOLD = 0.01  # RMS threshold for silence
    
    # Noise reduction
    NOISE_REDUCE_ENABLED = True
    NOISE_REDUCE_STATIONARY = True


# ============================================================================
# MAIN ANALYZER CLASS
# ============================================================================

class VerbalAnalyzer:
    """
    Complete verbal communication analyzer
    
    Features:
    - Speech rate analysis with WPM calculation
    - Filler word detection with context
    - Advanced pause analysis with categorization
    - Pitch variance and monotony detection
    - Volume stability analysis
    - Tone modulation scoring
    - Overall clarity scoring
    - Audio quality assessment
    - Noise reduction preprocessing
    """
    
    def __init__(self, 
                 audio_path: str, 
                 transcript: str,
                 config: Optional[AudioAnalysisConfig] = None):
        """
        Initialize analyzer
        
        Args:
            audio_path: Path to audio file
            transcript: Text transcript from ASR (Whisper)
            config: Optional custom configuration
        """
        self.audio_path = Path(audio_path)
        self.transcript = transcript.lower().strip()
        self.config = config or AudioAnalysisConfig()
        
        # Load audio
        self.y, self.sr = librosa.load(str(audio_path), sr=None)
        self.duration = librosa.get_duration(y=self.y, sr=self.sr)
        
        # Apply noise reduction if enabled
        if self.config.NOISE_REDUCE_ENABLED:
            self.y = self._reduce_noise(self.y)
        
        # Storage for detailed analysis
        self.filler_occurrences: List[FillerWord] = []
        self.pauses: List[Pause] = []
        
    def _reduce_noise(self, audio: np.ndarray) -> np.ndarray:
        """
        Apply noise reduction to audio signal
        
        Args:
            audio: Audio signal
            
        Returns:
            Cleaned audio signal
        """
        try:
            # Use noisereduce library
            reduced = nr.reduce_noise(
                y=audio, 
                sr=self.sr,
                stationary=self.config.NOISE_REDUCE_STATIONARY,
                prop_decrease=0.8
            )
            return reduced
        except Exception as e:
            print(f"Warning: Noise reduction failed: {e}")
            return audio
    
    # ========================================================================
    # AUDIO QUALITY ASSESSMENT
    # ========================================================================
    
    def assess_audio_quality(self) -> Tuple[float, bool, bool, float]:
        """
        Assess overall audio quality
        
        Returns:
            (quality_score, noise_detected, clipping_detected, silence_percentage)
        """
        quality_score = 100.0
        
        # Check for clipping
        clipping_detected = False
        max_amplitude = np.max(np.abs(self.y))
        if max_amplitude >= self.config.CLIPPING_THRESHOLD:
            clipping_detected = True
            quality_score -= 20
        
        # Estimate SNR
        noise_detected = False
        rms = librosa.feature.rms(y=self.y)[0]
        signal_power = np.mean(rms[rms > np.median(rms)])
        noise_power = np.mean(rms[rms < np.median(rms)])
        
        if noise_power > 0:
            snr = 10 * np.log10(signal_power / noise_power)
            if snr < self.config.SNR_THRESHOLD:
                noise_detected = True
                quality_score -= 15
        
        # Check silence percentage
        silence_frames = np.sum(rms < self.config.SILENCE_THRESHOLD)
        silence_percentage = (silence_frames / len(rms)) * 100
        
        if silence_percentage > 50:
            quality_score -= 30
        elif silence_percentage > 30:
            quality_score -= 15
        
        quality_score = max(0, quality_score)
        
        return quality_score, noise_detected, clipping_detected, silence_percentage
    
    # ========================================================================
    # SPEECH RATE ANALYSIS
    # ========================================================================
    
    def analyze_speech_rate(self) -> Tuple[float, int, str]:
        """
        Calculate words per minute and assess rate
        
        Returns:
            (wpm, word_count, assessment)
        """
        # Count words in transcript
        words = self.transcript.split()
        word_count = len(words)
        
        # Calculate WPM
        duration_minutes = self.duration / 60.0
        wpm = word_count / duration_minutes if duration_minutes > 0 else 0
        
        # Assess rate
        if wpm < self.config.WPM_TOO_SLOW:
            assessment = "too_slow"
        elif wpm <= self.config.WPM_OPTIMAL_MAX:
            assessment = "optimal"
        elif wpm <= self.config.WPM_TOO_FAST:
            assessment = "slightly_fast"
        else:
            assessment = "too_fast"
        
        return wpm, word_count, assessment
    
    # ========================================================================
    # FILLER WORD DETECTION
    # ========================================================================
    
    def detect_filler_words(self) -> Tuple[int, float, List[str], str]:
        """
        Detect filler words with context
        
        Returns:
            (count, rate_per_minute, detected_list, assessment)
        """
        words = self.transcript.split()
        detected = []
        self.filler_occurrences = []
        
        # Single-word fillers
        for i, word in enumerate(words):
            word_clean = re.sub(r'[^\w\s]', '', word)
            
            if word_clean in self.config.FILLER_WORDS:
                detected.append(word_clean)
                
                # Get context (2 words before and after)
                context_start = max(0, i - 2)
                context_end = min(len(words), i + 3)
                context = ' '.join(words[context_start:context_end])
                
                # Estimate timestamp (rough approximation)
                timestamp = (i / len(words)) * self.duration
                
                self.filler_occurrences.append(FillerWord(
                    word=word_clean,
                    timestamp=timestamp,
                    context=context
                ))
        
        # Multi-word fillers
        text = ' ' + self.transcript + ' '
        for filler in self.config.FILLER_WORDS:
            if ' ' in filler:  # Multi-word filler
                pattern = r'\s' + re.escape(filler) + r'\s'
                matches = list(re.finditer(pattern, text))
                for match in matches:
                    detected.append(filler)
                    # Context extraction for multi-word fillers
                    start = max(0, match.start() - 20)
                    end = min(len(text), match.end() + 20)
                    context = text[start:end].strip()
                    
                    # Rough timestamp
                    timestamp = (match.start() / len(text)) * self.duration
                    
                    self.filler_occurrences.append(FillerWord(
                        word=filler,
                        timestamp=timestamp,
                        context=context
                    ))
        
        count = len(detected)
        duration_minutes = self.duration / 60.0
        rate = count / duration_minutes if duration_minutes > 0 else 0
        
        # Assessment
        if rate <= self.config.FILLER_EXCELLENT:
            assessment = "excellent"
        elif rate <= self.config.FILLER_GOOD:
            assessment = "good"
        elif rate <= self.config.FILLER_MODERATE:
            assessment = "moderate"
        else:
            assessment = "needs_work"
        
        return count, rate, detected, assessment
    
    # ========================================================================
    # PAUSE ANALYSIS
    # ========================================================================
    
    def analyze_pauses(self, top_db: int = 20) -> Tuple[int, float, float, int, str]:
        """
        Detect and analyze pauses with categorization
        
        Args:
            top_db: Threshold for silence detection
            
        Returns:
            (pause_count, avg_pause_duration, std_pause_duration, 
             long_pause_count, assessment)
        """
        # Detect non-silent intervals
        intervals = librosa.effects.split(self.y, top_db=top_db)
        
        if len(intervals) < 2:
            return 0, 0.0, 0.0, 0, "natural"
        
        # Calculate pause durations and categorize
        pause_durations = []
        long_pauses = 0
        self.pauses = []
        
        for i in range(len(intervals) - 1):
            pause_start = intervals[i][1] / self.sr
            pause_end = intervals[i + 1][0] / self.sr
            pause_duration = pause_end - pause_start
            
            # Only count pauses >= 0.1 seconds
            if pause_duration >= 0.1:
                pause_durations.append(pause_duration)
                
                # Categorize pause
                if pause_duration < self.config.PAUSE_SHORT:
                    pause_type = "short"
                elif pause_duration <= self.config.PAUSE_NORMAL_MAX:
                    pause_type = "normal"
                elif pause_duration <= self.config.PAUSE_LONG:
                    pause_type = "long"
                else:
                    pause_type = "excessive"
                    long_pauses += 1
                
                self.pauses.append(Pause(
                    start_time=pause_start,
                    end_time=pause_end,
                    duration=pause_duration,
                    pause_type=pause_type
                ))
        
        pause_count = len(pause_durations)
        avg_pause = np.mean(pause_durations) if pause_durations else 0.0
        std_pause = np.std(pause_durations) if len(pause_durations) > 1 else 0.0
        
        # Assessment
        if long_pauses == 0 and self.config.PAUSE_SHORT <= avg_pause <= self.config.PAUSE_NORMAL_MAX:
            assessment = "natural"
        elif long_pauses <= 2 and avg_pause <= self.config.PAUSE_LONG:
            assessment = "acceptable"
        elif long_pauses <= 4:
            assessment = "awkward"
        else:
            assessment = "excessive"
        
        return pause_count, avg_pause, std_pause, long_pauses, assessment
    
    # ========================================================================
    # PITCH ANALYSIS
    # ========================================================================
    
    def analyze_pitch(self) -> Tuple[float, float, float, float, float, str]:
        """
        Analyze pitch variance and monotony
        
        Returns:
            (mean_hz, std_hz, variance, cv_percent, monotony_score, assessment)
        """
        # Extract pitch using pYIN algorithm
        f0, voiced_flag, voiced_probs = librosa.pyin(
            self.y,
            fmin=self.config.PITCH_MIN_HZ,
            fmax=self.config.PITCH_MAX_HZ,
            sr=self.sr
        )
        
        # Filter out unvoiced frames and outliers
        f0_voiced = f0[voiced_flag]
        
        if len(f0_voiced) < 10:
            # Not enough voiced content
            return 0.0, 0.0, 0.0, 0.0, 100.0, "monotone"
        
        # Remove outliers (beyond 3 standard deviations)
        mean_pitch = np.mean(f0_voiced)
        std_pitch = np.std(f0_voiced)
        f0_filtered = f0_voiced[np.abs(f0_voiced - mean_pitch) < 3 * std_pitch]
        
        if len(f0_filtered) < 10:
            f0_filtered = f0_voiced  # Use unfiltered if too much removed
        
        # Calculate statistics
        mean_hz = np.mean(f0_filtered)
        std_hz = np.std(f0_filtered)
        variance = np.var(f0_filtered)
        cv_percent = (std_hz / mean_hz) * 100 if mean_hz > 0 else 0
        
        # Monotony score (inverse of expressiveness)
        # CV% mapping: <10% = monotone, 15-30% = expressive
        if cv_percent < self.config.PITCH_CV_MONOTONE:
            monotony_score = 100 - (cv_percent * 5)
        elif cv_percent < self.config.PITCH_CV_EXPRESSIVE:
            monotony_score = 50 - ((cv_percent - 10) * 4)
        else:
            monotony_score = max(0, 30 - ((cv_percent - 15) * 2))
        
        monotony_score = max(0, min(100, monotony_score))
        
        # Assessment
        if cv_percent >= self.config.PITCH_CV_EXPRESSIVE:
            assessment = "expressive"
        elif cv_percent >= self.config.PITCH_CV_MONOTONE:
            assessment = "moderate"
        else:
            assessment = "monotone"
        
        return mean_hz, std_hz, variance, cv_percent, monotony_score, assessment
    
    # ========================================================================
    # VOLUME ANALYSIS
    # ========================================================================
    
    def analyze_volume(self) -> Tuple[float, float, float, str]:
        """
        Analyze volume stability
        
        Returns:
            (mean_db, std_db, stability_score, assessment)
        """
        # Calculate RMS energy
        rms = librosa.feature.rms(y=self.y)[0]
        
        # Convert to dB
        rms_db = librosa.amplitude_to_db(rms, ref=np.max)
        
        # Filter out silence
        rms_db_voiced = rms_db[rms_db > -60]  # Filter very quiet frames
        
        if len(rms_db_voiced) == 0:
            return -60.0, 0.0, 0.0, "unstable"
        
        mean_db = np.mean(rms_db_voiced)
        std_db = np.std(rms_db_voiced)
        
        # Stability score (lower variance = more stable)
        # Map std_db to 0-100 scale
        stability_score = max(0, 100 - (std_db * 5))
        
        # Assessment
        if std_db < 10:
            assessment = "stable"
        elif std_db < self.config.VOLUME_STABLE_THRESHOLD:
            assessment = "moderate"
        else:
            assessment = "unstable"
        
        return mean_db, std_db, stability_score, assessment
    
    # ========================================================================
    # TONE MODULATION
    # ========================================================================
    
    def calculate_tone_modulation(self, pitch_cv: float, 
                                  monotony_score: float,
                                  pitch_variance: float) -> Tuple[float, str]:
        """
        Calculate overall tone modulation quality
        
        Args:
            pitch_cv: Pitch coefficient of variation
            monotony_score: Monotony score (0-100)
            pitch_variance: Pitch variance
            
        Returns:
            (modulation_score, assessment)
        """
        # Base score: inverse of monotony
        base_score = 100 - monotony_score
        
        # Bonus for good variance (sweet spot: 15-30% CV)
        if 15 <= pitch_cv <= 30:
            base_score += 10
        
        # Penalty if variance is too extreme (shouting/unstable)
        if pitch_variance > 1000:  # Very high variance
            penalty = min(20, (pitch_variance - 1000) / 100)
            base_score -= penalty
        
        modulation_score = max(0, min(100, base_score))
        
        # Assessment
        if modulation_score >= 75:
            assessment = "engaging"
        elif modulation_score >= 55:
            assessment = "acceptable"
        else:
            assessment = "flat"
        
        return modulation_score, assessment
    
    # ========================================================================
    # CLARITY SCORING
    # ========================================================================
    
    def calculate_clarity_score(self, 
                                wpm: float,
                                filler_rate: float,
                                avg_pause: float,
                                long_pause_count: int,
                                volume_stability: float) -> Tuple[float, str]:
        """
        Calculate composite clarity score
        
        Args:
            wpm: Words per minute
            filler_rate: Fillers per minute
            avg_pause: Average pause duration
            long_pause_count: Number of long pauses
            volume_stability: Volume stability score
            
        Returns:
            (clarity_score, assessment)
        """
        score = 100.0
        
        # Speech rate penalty
        if wpm < self.config.WPM_TOO_SLOW:
            score -= (self.config.WPM_TOO_SLOW - wpm) / 2
        elif wpm > self.config.WPM_TOO_FAST:
            score -= (wpm - self.config.WPM_TOO_FAST) / 3
        
        # Filler words penalty
        if filler_rate > self.config.FILLER_GOOD:
            score -= min(30, (filler_rate - self.config.FILLER_GOOD) * 5)
        
        # Long pause penalty
        score -= long_pause_count * 5
        
        # Awkward pause duration penalty
        if avg_pause > self.config.PAUSE_LONG:
            score -= min(20, (avg_pause - self.config.PAUSE_LONG) * 10)
        
        # Volume instability penalty
        if volume_stability < 70:
            score -= (70 - volume_stability) * 0.3
        
        clarity_score = max(0, min(100, score))
        
        # Assessment
        if clarity_score >= 85:
            assessment = "excellent"
        elif clarity_score >= 70:
            assessment = "good"
        elif clarity_score >= 55:
            assessment = "acceptable"
        else:
            assessment = "poor"
        
        return clarity_score, assessment
    
    # ========================================================================
    # MAIN ANALYSIS FUNCTION
    # ========================================================================
    
    def analyze(self) -> VerbalMetrics:
        """
        Run complete verbal analysis
        
        Returns:
            VerbalMetrics object with all computed metrics
        """
        print("Starting verbal analysis...")
        
        # Audio quality
        print("  [1/7] Assessing audio quality...")
        quality_score, noise_detected, clipping_detected, silence_pct = \
            self.assess_audio_quality()
        
        # Speech rate
        print("  [2/7] Analyzing speech rate...")
        wpm, word_count, rate_assessment = self.analyze_speech_rate()
        
        # Filler words
        print("  [3/7] Detecting filler words...")
        filler_count, filler_rate, filler_list, filler_assessment = \
            self.detect_filler_words()
        
        # Pauses
        print("  [4/7] Analyzing pauses...")
        pause_count, avg_pause, std_pause, long_pauses, pause_assessment = \
            self.analyze_pauses()
        
        # Pitch
        print("  [5/7] Analyzing pitch...")
        pitch_mean, pitch_std, pitch_var, pitch_cv, monotony, pitch_assessment = \
            self.analyze_pitch()
        
        # Volume
        print("  [6/7] Analyzing volume...")
        vol_mean, vol_std, vol_stability, vol_assessment = self.analyze_volume()
        
        # Tone modulation
        print("  [7/7] Calculating composite scores...")
        tone_mod, tone_assessment = self.calculate_tone_modulation(
            pitch_cv, monotony, pitch_var
        )
        
        # Clarity
        clarity, clarity_assessment = self.calculate_clarity_score(
            wpm, filler_rate, avg_pause, long_pauses, vol_stability
        )
        
        print("✓ Verbal analysis complete!")
        
        return VerbalMetrics(
            # Speech Rate
            speech_rate_wpm=round(wpm, 1),
            word_count=word_count,
            duration_seconds=round(self.duration, 2),
            speech_rate_assessment=rate_assessment,
            
            # Filler Words
            filler_word_count=filler_count,
            filler_rate_per_minute=round(filler_rate, 2),
            filler_words_detected=filler_list[:10],  # Top 10
            filler_assessment=filler_assessment,
            
            # Pauses
            pause_count=pause_count,
            avg_pause_duration=round(avg_pause, 2),
            pause_duration_std=round(std_pause, 2),
            long_pause_count=long_pauses,
            pause_assessment=pause_assessment,
            
            # Pitch
            pitch_mean_hz=round(pitch_mean, 1),
            pitch_std_hz=round(pitch_std, 1),
            pitch_variance=round(pitch_var, 1),
            pitch_cv_percent=round(pitch_cv, 1),
            monotony_score=round(monotony, 1),
            pitch_assessment=pitch_assessment,
            
            # Volume
            volume_mean_db=round(vol_mean, 1),
            volume_std_db=round(vol_std, 1),
            volume_stability_score=round(vol_stability, 1),
            volume_assessment=vol_assessment,
            
            # Tone Modulation
            tone_modulation_score=round(tone_mod, 1),
            tone_assessment=tone_assessment,
            
            # Clarity
            clarity_score=round(clarity, 1),
            clarity_assessment=clarity_assessment,
            
            # Quality
            audio_quality_score=round(quality_score, 1),
            noise_detected=noise_detected,
            clipping_detected=clipping_detected,
            silence_percentage=round(silence_pct, 1)
        )
    
    # ========================================================================
    # DETAILED REPORTING
    # ========================================================================
    
    def get_detailed_report(self) -> Dict:
        """
        Get detailed analysis report with timestamps and context
        
        Returns:
            Dictionary with detailed breakdown
        """
        metrics = self.analyze()
        
        return {
            "summary": metrics.to_dict(),
            "filler_word_details": [
                {
                    "word": f.word,
                    "timestamp": round(f.timestamp, 2),
                    "context": f.context
                }
                for f in self.filler_occurrences
            ],
            "pause_details": [
                {
                    "start": round(p.start_time, 2),
                    "end": round(p.end_time, 2),
                    "duration": round(p.duration, 2),
                    "type": p.pause_type
                }
                for p in self.pauses
            ],
            "recommendations": self._generate_recommendations(metrics)
        }
    
    def _generate_recommendations(self, metrics: VerbalMetrics) -> List[str]:
        """
        Generate actionable recommendations based on metrics
        
        Args:
            metrics: VerbalMetrics object
            
        Returns:
            List of recommendations
        """
        recs = []
        
        # Speech rate
        if metrics.speech_rate_assessment == "too_slow":
            recs.append(
                f"Your speech rate is {metrics.speech_rate_wpm} WPM. "
                f"Try to increase pace to 120-160 WPM for better engagement."
            )
        elif metrics.speech_rate_assessment == "too_fast":
            recs.append(
                f"Your speech rate is {metrics.speech_rate_wpm} WPM. "
                f"Slow down to 120-160 WPM to improve clarity."
            )
        
        # Filler words
        if metrics.filler_rate_per_minute > 2:
            recs.append(
                f"Reduce filler words (currently {metrics.filler_rate_per_minute}/min). "
                f"Practice the 'pause technique': replace 'um' with a brief silence."
            )
        
        # Pauses
        if metrics.long_pause_count > 3:
            recs.append(
                f"You had {metrics.long_pause_count} long pauses. "
                f"Practice maintaining steady speech flow."
            )
        
        # Pitch
        if metrics.monotony_score > 60:
            recs.append(
                "Add more vocal variety. Vary your pitch to emphasize key points "
                "and maintain listener engagement."
            )
        
        # Volume
        if metrics.volume_stability_score < 70:
            recs.append(
                "Work on maintaining consistent volume. Practice speaking at a "
                "steady loudness level throughout your response."
            )
        
        # Overall
        if metrics.clarity_score < 70:
            recs.append(
                "Focus on overall clarity: reduce fillers, maintain steady pace, "
                "and pause naturally between thoughts."
            )
        
        return recs


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

def example_basic_usage():
    """Example: Basic usage"""
    
    print("=" * 70)
    print("EXAMPLE 1: Basic Verbal Analysis")
    print("=" * 70)
    
    # Example transcript
    transcript = """
    Um, so I think the main challenge in cloud computing is, uh, basically 
    the security aspect. Like, when you're dealing with sensitive data, 
    you need to ensure that proper encryption is in place. I mean, using 
    technologies like AWS KMS or Azure Key Vault can really help with that.
    """
    
    # Create analyzer (assuming you have an audio file)
    # analyzer = VerbalAnalyzer("interview_audio.wav", transcript)
    # metrics = analyzer.analyze()
    
    # Print results
    # print(metrics.to_json())
    
    print("\nExpected Output:")
    print({
        "speech_rate_wpm": 145.2,
        "filler_word_count": 7,
        "filler_rate_per_minute": 3.8,
        "clarity_score": 68.5,
        "clarity_assessment": "acceptable"
    })


def example_detailed_analysis():
    """Example: Detailed analysis with timestamps"""
    
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Detailed Analysis with Context")
    print("=" * 70)
    
    # analyzer = VerbalAnalyzer("interview_audio.wav", transcript)
    # detailed_report = analyzer.get_detailed_report()
    
    print("\nExpected Output Structure:")
    print({
        "summary": {"speech_rate_wpm": 145.2, "...": "..."},
        "filler_word_details": [
            {
                "word": "um",
                "timestamp": 2.3,
                "context": "So um I think the main"
            }
        ],
        "pause_details": [
            {
                "start": 5.2,
                "end": 7.8,
                "duration": 2.6,
                "type": "excessive"
            }
        ],
        "recommendations": [
            "Reduce filler words...",
            "Work on maintaining..."
        ]
    })


def example_custom_config():
    """Example: Custom configuration"""
    
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Custom Configuration")
    print("=" * 70)
    
    # Custom config
    config = AudioAnalysisConfig()
    config.FILLER_WORDS.extend(['basically', 'essentially'])
    config.WPM_OPTIMAL_MIN = 130
    config.WPM_OPTIMAL_MAX = 170
    
    print("\nCustom filler words:", config.FILLER_WORDS[:10])
    print("Custom WPM range:", config.WPM_OPTIMAL_MIN, "-", config.WPM_OPTIMAL_MAX)


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║              AUDIO/VERBAL COMMUNICATION ANALYSIS MODULE                  ║
║                                                                          ║
║  Complete production-ready implementation for interview analysis        ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    print("\nFEATURES:")
    print("  ✓ Speech rate analysis (WPM calculation)")
    print("  ✓ Filler word detection with context")
    print("  ✓ Advanced pause analysis with categorization")
    print("  ✓ Pitch variance and monotony detection")
    print("  ✓ Volume stability analysis")
    print("  ✓ Tone modulation scoring")
    print("  ✓ Overall clarity scoring")
    print("  ✓ Audio quality assessment")
    print("  ✓ Noise reduction preprocessing")
    print("  ✓ Detailed reporting with timestamps")
    print("  ✓ Actionable recommendations")
    
    print("\n" + "=" * 70)
    print("INSTALLATION:")
    print("=" * 70)
    print("""
pip install librosa
pip install soundfile
pip install noisereduce
pip install numpy
    """)
    
    print("=" * 70)
    print("QUICK START:")
    print("=" * 70)
    print("""
from audio_analyzer import VerbalAnalyzer

# Initialize analyzer
analyzer = VerbalAnalyzer(
    audio_path="interview.wav",
    transcript="Your transcript from Whisper here..."
)

# Run analysis
metrics = analyzer.analyze()

# Print results
print(metrics.to_json())

# Get detailed report
detailed = analyzer.get_detailed_report()
print(detailed['recommendations'])
    """)
    
    # Run examples
    example_basic_usage()
    example_detailed_analysis()
    example_custom_config()
    
    print("\n" + "=" * 70)
    print("MODULE READY FOR PRODUCTION USE")
    print("=" * 70)
