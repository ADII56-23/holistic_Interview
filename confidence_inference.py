"""
CONFIDENCE & PRESENCE INFERENCE ENGINE
=======================================

Explainable AI system for deriving confidence through transparent weighted
inference from multiple observable signals. NO black-box ML predictions.

This module implements a fully transparent, rule-based confidence scoring
system that can be defended in academic and professional settings.

Author: Senior AI Engineer
Version: 1.0
License: MIT
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict, field
from enum import Enum
import json


# ============================================================================
# DATA MODELS
# ============================================================================

class ConfidenceLevel(Enum):
    """Confidence level categories"""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    MODERATE_HIGH = "moderate_high"
    HIGH = "high"
    VERY_HIGH = "very_high"


class SignalQuality(Enum):
    """Quality assessment for individual signals"""
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    CRITICAL = "critical"


@dataclass
class SignalScore:
    """Individual signal contribution to confidence"""
    name: str
    raw_score: float  # 0-100
    weighted_score: float  # Contribution to final confidence
    weight: float  # Weight coefficient
    quality: SignalQuality
    interpretation: str
    supporting_metrics: Dict[str, float]


@dataclass
class ConfidenceBreakdown:
    """Detailed confidence calculation breakdown"""
    overall_confidence_score: float  # 0-100
    confidence_level: ConfidenceLevel
    
    # Individual signal scores
    eye_contact_signal: SignalScore
    posture_signal: SignalScore
    voice_control_signal: SignalScore
    speech_flow_signal: SignalScore
    facial_engagement_signal: SignalScore
    
    # Analysis
    positive_indicators: List[str]
    negative_indicators: List[str]
    mixed_signals: List[str]
    
    # Confidence factors
    consistency_score: float  # How consistent are the signals?
    stability_score: float  # How stable over time?
    
    # Explanation
    primary_strengths: List[str]
    primary_weaknesses: List[str]
    overall_explanation: str
    
    # Recommendations
    improvement_priority: List[str]  # Ordered by impact
    quick_wins: List[str]  # Easy improvements
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        result = asdict(self)
        # Convert enums to strings
        result['confidence_level'] = self.confidence_level.value
        result['eye_contact_signal']['quality'] = self.eye_contact_signal.quality.value
        result['posture_signal']['quality'] = self.posture_signal.quality.value
        result['voice_control_signal']['quality'] = self.voice_control_signal.quality.value
        result['speech_flow_signal']['quality'] = self.speech_flow_signal.quality.value
        result['facial_engagement_signal']['quality'] = self.facial_engagement_signal.quality.value
        return result
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=2)


# ============================================================================
# CONFIGURATION
# ============================================================================

class ConfidenceConfig:
    """Configuration for confidence inference"""
    
    # ========================================================================
    # SIGNAL WEIGHTS (Must sum to 1.0)
    # ========================================================================
    # These weights are based on research in communication psychology
    # and interview evaluation criteria
    
    WEIGHTS = {
        'eye_contact': 0.25,        # Critical for engagement
        'posture': 0.20,            # Strong indicator of confidence
        'voice_control': 0.25,      # Vocal power and stability
        'speech_flow': 0.20,        # Clarity and articulation
        'facial_engagement': 0.10   # Emotional expressiveness
    }
    
    # ========================================================================
    # QUALITY THRESHOLDS (0-100 scale)
    # ========================================================================
    
    EXCELLENT_THRESHOLD = 85
    GOOD_THRESHOLD = 70
    ACCEPTABLE_THRESHOLD = 55
    POOR_THRESHOLD = 40
    
    # ========================================================================
    # CONFIDENCE LEVEL THRESHOLDS
    # ========================================================================
    
    VERY_HIGH_THRESHOLD = 85
    HIGH_THRESHOLD = 75
    MODERATE_HIGH_THRESHOLD = 65
    MODERATE_THRESHOLD = 50
    LOW_THRESHOLD = 35
    
    # ========================================================================
    # CONSISTENCY ANALYSIS
    # ========================================================================
    
    CONSISTENCY_VARIANCE_THRESHOLD = 20  # Max variance for "consistent"
    MIXED_SIGNAL_THRESHOLD = 30  # Difference threshold for mixed signals
    
    # ========================================================================
    # SIGNAL-SPECIFIC THRESHOLDS
    # ========================================================================
    
    # Eye Contact
    EYE_CONTACT_EXCELLENT = 80
    EYE_CONTACT_GOOD = 70
    EYE_CONTACT_MODERATE = 55
    EYE_CONTACT_POOR = 40
    
    # Posture
    POSTURE_EXCELLENT = 85
    POSTURE_GOOD = 75
    POSTURE_MODERATE = 60
    POSTURE_POOR = 45
    
    # Voice Control
    VOICE_EXCELLENT = 80
    VOICE_GOOD = 70
    VOICE_MODERATE = 55
    VOICE_POOR = 40
    
    # Speech Flow
    FLOW_EXCELLENT = 85
    FLOW_GOOD = 70
    FLOW_MODERATE = 55
    FLOW_POOR = 40
    
    # Facial Engagement
    FACIAL_EXCELLENT = 80
    FACIAL_GOOD = 65
    FACIAL_MODERATE = 50
    FACIAL_POOR = 35


# ============================================================================
# CONFIDENCE INFERENCE ENGINE
# ============================================================================

class ConfidenceAnalyzer:
    """
    Explainable confidence inference engine
    
    Features:
    - Transparent weighted scoring (no black-box ML)
    - Individual signal breakdown
    - Consistency analysis
    - Mixed signal detection
    - Actionable recommendations
    - Full explainability for academic defense
    """
    
    def __init__(self, 
                 verbal_metrics: Optional[Dict] = None,
                 nonverbal_metrics: Optional[Dict] = None,
                 config: Optional[ConfidenceConfig] = None):
        """
        Initialize confidence analyzer
        
        Args:
            verbal_metrics: Dictionary from VerbalAnalyzer
            nonverbal_metrics: Dictionary from NonVerbalAnalyzer
            config: Optional custom configuration
        """
        self.verbal = verbal_metrics or {}
        self.nonverbal = nonverbal_metrics or {}
        self.config = config or ConfidenceConfig()
        
        # Validate weights sum to 1.0
        weight_sum = sum(self.config.WEIGHTS.values())
        if not (0.99 <= weight_sum <= 1.01):  # Allow small floating point error
            raise ValueError(f"Weights must sum to 1.0, got {weight_sum}")
    
    # ========================================================================
    # SIGNAL SCORING FUNCTIONS
    # ========================================================================
    
    def score_eye_contact(self) -> SignalScore:
        """
        Score eye contact contribution to confidence
        
        Returns:
            SignalScore object with detailed breakdown
        """
        # Extract metrics
        eye_contact_pct = self.nonverbal.get('eye_contact_percentage', 0)
        gaze_stability = self.nonverbal.get('gaze_stability_score', 0)
        avg_gaze_duration = self.nonverbal.get('avg_gaze_duration', 0)
        
        # Calculate combined score (70% contact, 30% stability)
        raw_score = (eye_contact_pct * 0.7 + gaze_stability * 0.3)
        
        # Bonus for sustained gaze (>2 seconds average)
        if avg_gaze_duration > 2.0:
            raw_score = min(100, raw_score + 5)
        
        # Penalty for very low contact
        if eye_contact_pct < 30:
            raw_score *= 0.8
        
        raw_score = max(0, min(100, raw_score))
        
        # Quality assessment
        if raw_score >= self.config.EYE_CONTACT_EXCELLENT:
            quality = SignalQuality.EXCELLENT
            interpretation = "Strong, consistent eye contact demonstrates confidence and engagement"
        elif raw_score >= self.config.EYE_CONTACT_GOOD:
            quality = SignalQuality.GOOD
            interpretation = "Good eye contact with minor breaks"
        elif raw_score >= self.config.EYE_CONTACT_MODERATE:
            quality = SignalQuality.ACCEPTABLE
            interpretation = "Inconsistent eye contact, appears somewhat nervous"
        elif raw_score >= self.config.EYE_CONTACT_POOR:
            quality = SignalQuality.POOR
            interpretation = "Limited eye contact suggests low confidence"
        else:
            quality = SignalQuality.CRITICAL
            interpretation = "Avoidance of eye contact indicates significant nervousness"
        
        # Calculate weighted contribution
        weighted_score = raw_score * self.config.WEIGHTS['eye_contact']
        
        return SignalScore(
            name="Eye Contact",
            raw_score=round(raw_score, 1),
            weighted_score=round(weighted_score, 2),
            weight=self.config.WEIGHTS['eye_contact'],
            quality=quality,
            interpretation=interpretation,
            supporting_metrics={
                'eye_contact_percentage': eye_contact_pct,
                'gaze_stability': gaze_stability,
                'avg_gaze_duration': avg_gaze_duration
            }
        )
    
    def score_posture(self) -> SignalScore:
        """
        Score posture contribution to confidence
        
        Returns:
            SignalScore object with detailed breakdown
        """
        # Extract metrics
        posture_score = self.nonverbal.get('posture_score', 0)
        shoulder_alignment = self.nonverbal.get('shoulder_alignment_score', 0)
        head_tilt = abs(self.nonverbal.get('head_tilt_avg', 0))
        forward_lean_pct = self.nonverbal.get('forward_lean_percentage', 0)
        
        # Calculate combined score (60% posture, 40% shoulder alignment)
        raw_score = (posture_score * 0.6 + shoulder_alignment * 0.4)
        
        # Bonus for slight forward lean (10-20% shows engagement)
        if 10 <= forward_lean_pct <= 20:
            raw_score = min(100, raw_score + 5)
        # Penalty for excessive lean (>30% looks aggressive/anxious)
        elif forward_lean_pct > 30:
            raw_score -= 10
        
        # Penalty for significant head tilt (>15 degrees)
        if head_tilt > 15:
            raw_score -= (head_tilt - 15) * 2
        
        raw_score = max(0, min(100, raw_score))
        
        # Quality assessment
        if raw_score >= self.config.POSTURE_EXCELLENT:
            quality = SignalQuality.EXCELLENT
            interpretation = "Upright, professional posture projects strong confidence"
        elif raw_score >= self.config.POSTURE_GOOD:
            quality = SignalQuality.GOOD
            interpretation = "Generally good posture with minor adjustments needed"
        elif raw_score >= self.config.POSTURE_MODERATE:
            quality = SignalQuality.ACCEPTABLE
            interpretation = "Posture could be improved to project more confidence"
        elif raw_score >= self.config.POSTURE_POOR:
            quality = SignalQuality.POOR
            interpretation = "Poor posture suggests low confidence or discomfort"
        else:
            quality = SignalQuality.CRITICAL
            interpretation = "Slouching or closed body language indicates significant discomfort"
        
        weighted_score = raw_score * self.config.WEIGHTS['posture']
        
        return SignalScore(
            name="Posture",
            raw_score=round(raw_score, 1),
            weighted_score=round(weighted_score, 2),
            weight=self.config.WEIGHTS['posture'],
            quality=quality,
            interpretation=interpretation,
            supporting_metrics={
                'posture_score': posture_score,
                'shoulder_alignment': shoulder_alignment,
                'head_tilt_degrees': round(head_tilt, 1),
                'forward_lean_percentage': forward_lean_pct
            }
        )
    
    def score_voice_control(self) -> SignalScore:
        """
        Score voice control contribution to confidence
        
        Returns:
            SignalScore object with detailed breakdown
        """
        # Extract metrics
        volume_stability = self.verbal.get('volume_stability_score', 0)
        tone_modulation = self.verbal.get('tone_modulation_score', 0)
        monotony = self.verbal.get('pitch_monotony_score', 100)
        
        # Calculate combined score (50% stability, 50% modulation)
        raw_score = (volume_stability * 0.5 + tone_modulation * 0.5)
        
        # Penalty for extreme monotony (>70)
        if monotony > 70:
            raw_score -= (monotony - 70) * 0.5
        
        raw_score = max(0, min(100, raw_score))
        
        # Quality assessment
        if raw_score >= self.config.VOICE_EXCELLENT:
            quality = SignalQuality.EXCELLENT
            interpretation = "Strong, controlled voice with excellent modulation"
        elif raw_score >= self.config.VOICE_GOOD:
            quality = SignalQuality.GOOD
            interpretation = "Good voice control with natural variation"
        elif raw_score >= self.config.VOICE_MODERATE:
            quality = SignalQuality.ACCEPTABLE
            interpretation = "Moderate voice control, could use more energy"
        elif raw_score >= self.config.VOICE_POOR:
            quality = SignalQuality.POOR
            interpretation = "Weak or unstable voice suggests nervousness"
        else:
            quality = SignalQuality.CRITICAL
            interpretation = "Very quiet or shaky voice indicates high anxiety"
        
        weighted_score = raw_score * self.config.WEIGHTS['voice_control']
        
        return SignalScore(
            name="Voice Control",
            raw_score=round(raw_score, 1),
            weighted_score=round(weighted_score, 2),
            weight=self.config.WEIGHTS['voice_control'],
            quality=quality,
            interpretation=interpretation,
            supporting_metrics={
                'volume_stability': volume_stability,
                'tone_modulation': tone_modulation,
                'monotony_score': monotony
            }
        )
    
    def score_speech_flow(self) -> SignalScore:
        """
        Score speech flow contribution to confidence
        
        Returns:
            SignalScore object with detailed breakdown
        """
        # Extract metrics
        clarity_score = self.verbal.get('clarity_score', 0)
        filler_rate = self.verbal.get('filler_rate_per_minute', 0)
        long_pause_count = self.verbal.get('long_pause_count', 0)
        speech_rate_wpm = self.verbal.get('speech_rate_wpm', 0)
        
        # Start with clarity score
        raw_score = clarity_score
        
        # Additional penalties for flow disruption
        # Filler rate penalty
        if filler_rate > 2:
            filler_penalty = min(20, (filler_rate - 2) * 4)
            raw_score -= filler_penalty
        
        # Long pause penalty
        raw_score -= long_pause_count * 4
        
        # Speech rate penalty (too slow = nervous, too fast = anxious)
        if speech_rate_wpm < 100:
            raw_score -= (100 - speech_rate_wpm) * 0.3
        elif speech_rate_wpm > 180:
            raw_score -= (speech_rate_wpm - 180) * 0.2
        
        raw_score = max(0, min(100, raw_score))
        
        # Quality assessment
        if raw_score >= self.config.FLOW_EXCELLENT:
            quality = SignalQuality.EXCELLENT
            interpretation = "Smooth, articulate speech demonstrates strong confidence"
        elif raw_score >= self.config.FLOW_GOOD:
            quality = SignalQuality.GOOD
            interpretation = "Clear speech with minor hesitations"
        elif raw_score >= self.config.FLOW_MODERATE:
            quality = SignalQuality.ACCEPTABLE
            interpretation = "Speech flow interrupted by pauses and fillers"
        elif raw_score >= self.config.FLOW_POOR:
            quality = SignalQuality.POOR
            interpretation = "Frequent hesitations suggest uncertainty"
        else:
            quality = SignalQuality.CRITICAL
            interpretation = "Severe disfluency indicates high nervousness"
        
        weighted_score = raw_score * self.config.WEIGHTS['speech_flow']
        
        return SignalScore(
            name="Speech Flow",
            raw_score=round(raw_score, 1),
            weighted_score=round(weighted_score, 2),
            weight=self.config.WEIGHTS['speech_flow'],
            quality=quality,
            interpretation=interpretation,
            supporting_metrics={
                'clarity_score': clarity_score,
                'filler_rate_per_minute': filler_rate,
                'long_pause_count': long_pause_count,
                'speech_rate_wpm': speech_rate_wpm
            }
        )
    
    def score_facial_engagement(self) -> SignalScore:
        """
        Score facial engagement contribution to confidence
        
        Returns:
            SignalScore object with detailed breakdown
        """
        # Extract metrics
        engagement_score = self.nonverbal.get('facial_engagement_score', 0)
        smile_frequency = self.nonverbal.get('smile_frequency', 0)
        
        # Base score from engagement
        raw_score = engagement_score
        
        # Bonus for appropriate smiling (1-5 smiles is good)
        if 1 <= smile_frequency <= 5:
            raw_score = min(100, raw_score + smile_frequency * 2)
        elif smile_frequency > 8:
            # Too much smiling can seem nervous
            raw_score -= 5
        
        raw_score = max(0, min(100, raw_score))
        
        # Quality assessment
        if raw_score >= self.config.FACIAL_EXCELLENT:
            quality = SignalQuality.EXCELLENT
            interpretation = "Highly engaged facial expressions show confidence"
        elif raw_score >= self.config.FACIAL_GOOD:
            quality = SignalQuality.GOOD
            interpretation = "Good facial engagement with natural expressions"
        elif raw_score >= self.config.FACIAL_MODERATE:
            quality = SignalQuality.ACCEPTABLE
            interpretation = "Moderate facial expression, could be more animated"
        elif raw_score >= self.config.FACIAL_POOR:
            quality = SignalQuality.POOR
            interpretation = "Limited facial engagement suggests discomfort"
        else:
            quality = SignalQuality.CRITICAL
            interpretation = "Frozen or tense expression indicates high anxiety"
        
        weighted_score = raw_score * self.config.WEIGHTS['facial_engagement']
        
        return SignalScore(
            name="Facial Engagement",
            raw_score=round(raw_score, 1),
            weighted_score=round(weighted_score, 2),
            weight=self.config.WEIGHTS['facial_engagement'],
            quality=quality,
            interpretation=interpretation,
            supporting_metrics={
                'engagement_score': engagement_score,
                'smile_frequency': smile_frequency
            }
        )
    
    # ========================================================================
    # CONSISTENCY ANALYSIS
    # ========================================================================
    
    def analyze_consistency(self, signals: List[SignalScore]) -> Tuple[float, List[str]]:
        """
        Analyze consistency across signals
        
        Args:
            signals: List of SignalScore objects
            
        Returns:
            (consistency_score, mixed_signals_list)
        """
        raw_scores = [s.raw_score for s in signals]
        
        # Calculate variance
        variance = np.var(raw_scores)
        std_dev = np.std(raw_scores)
        
        # Consistency score (lower variance = more consistent)
        consistency_score = max(0, 100 - (std_dev * 2))
        
        # Detect mixed signals (signals that differ significantly from mean)
        mean_score = np.mean(raw_scores)
        mixed = []
        
        for signal in signals:
            diff = abs(signal.raw_score - mean_score)
            if diff > self.config.MIXED_SIGNAL_THRESHOLD:
                if signal.raw_score > mean_score:
                    mixed.append(
                        f"{signal.name} is significantly stronger than other signals "
                        f"({signal.raw_score:.1f} vs avg {mean_score:.1f})"
                    )
                else:
                    mixed.append(
                        f"{signal.name} is significantly weaker than other signals "
                        f"({signal.raw_score:.1f} vs avg {mean_score:.1f})"
                    )
        
        return round(consistency_score, 1), mixed
    
    # ========================================================================
    # INDICATOR CLASSIFICATION
    # ========================================================================
    
    def classify_indicators(self, signals: List[SignalScore]) -> Tuple[List[str], List[str]]:
        """
        Classify signals into positive and negative indicators
        
        Args:
            signals: List of SignalScore objects
            
        Returns:
            (positive_indicators, negative_indicators)
        """
        positives = []
        negatives = []
        
        for signal in signals:
            if signal.quality in [SignalQuality.EXCELLENT, SignalQuality.GOOD]:
                positives.append(signal.interpretation)
            elif signal.quality in [SignalQuality.POOR, SignalQuality.CRITICAL]:
                negatives.append(signal.interpretation)
        
        return positives, negatives
    
    # ========================================================================
    # RECOMMENDATION GENERATION
    # ========================================================================
    
    def generate_improvement_priorities(self, signals: List[SignalScore]) -> List[str]:
        """
        Generate prioritized improvement recommendations
        
        Args:
            signals: List of SignalScore objects
            
        Returns:
            Ordered list of improvements (highest impact first)
        """
        # Sort by (weight * gap_to_excellent)
        improvements = []
        
        for signal in signals:
            if signal.quality in [SignalQuality.POOR, SignalQuality.CRITICAL, SignalQuality.ACCEPTABLE]:
                gap = self.config.EXCELLENT_THRESHOLD - signal.raw_score
                impact = signal.weight * gap
                
                if signal.name == "Eye Contact":
                    rec = f"Improve eye contact (current: {signal.supporting_metrics['eye_contact_percentage']:.0f}%) - Practice the '5-second rule'"
                elif signal.name == "Posture":
                    rec = f"Work on posture (score: {signal.raw_score:.0f}) - Sit upright with shoulders back"
                elif signal.name == "Voice Control":
                    rec = f"Strengthen voice control (score: {signal.raw_score:.0f}) - Practice vocal projection"
                elif signal.name == "Speech Flow":
                    fillers = signal.supporting_metrics.get('filler_rate_per_minute', 0)
                    rec = f"Reduce speech hesitations (filler rate: {fillers:.1f}/min) - Use pause technique"
                elif signal.name == "Facial Engagement":
                    rec = f"Increase facial expressiveness (score: {signal.raw_score:.0f}) - Practice natural smiling"
                else:
                    rec = f"Improve {signal.name}"
                
                improvements.append((impact, rec))
        
        # Sort by impact (descending)
        improvements.sort(reverse=True, key=lambda x: x[0])
        
        return [rec for _, rec in improvements]
    
    def generate_quick_wins(self, signals: List[SignalScore]) -> List[str]:
        """
        Generate quick-win recommendations
        
        Args:
            signals: List of SignalScore objects
            
        Returns:
            List of easy improvements
        """
        quick_wins = []
        
        for signal in signals:
            # Quick wins are areas close to next quality tier
            if signal.quality == SignalQuality.ACCEPTABLE and signal.raw_score > 60:
                if signal.name == "Eye Contact":
                    quick_wins.append("Maintain camera focus 5 seconds longer per gaze")
                elif signal.name == "Posture":
                    quick_wins.append("Straighten shoulders and lift chin slightly")
                elif signal.name == "Speech Flow":
                    quick_wins.append("Replace next 'um' with a 1-second pause")
                elif signal.name == "Facial Engagement":
                    quick_wins.append("Smile naturally once at the start")
        
        return quick_wins
    
    # ========================================================================
    # EXPLANATION GENERATION
    # ========================================================================
    
    def generate_explanation(self, 
                            overall_score: float,
                            consistency: float,
                            positives: List[str],
                            negatives: List[str],
                            mixed: List[str]) -> str:
        """
        Generate human-readable explanation
        
        Args:
            overall_score: Overall confidence score
            consistency: Consistency score
            positives: Positive indicators
            negatives: Negative indicators
            mixed: Mixed signals
            
        Returns:
            Explanation text
        """
        # Determine confidence level
        if overall_score >= self.config.VERY_HIGH_THRESHOLD:
            level_text = "very high confidence"
        elif overall_score >= self.config.HIGH_THRESHOLD:
            level_text = "high confidence"
        elif overall_score >= self.config.MODERATE_HIGH_THRESHOLD:
            level_text = "moderate-to-high confidence"
        elif overall_score >= self.config.MODERATE_THRESHOLD:
            level_text = "moderate confidence"
        elif overall_score >= self.config.LOW_THRESHOLD:
            level_text = "low-to-moderate confidence"
        else:
            level_text = "low confidence"
        
        # Build explanation
        explanation = f"You demonstrated {level_text} (score: {overall_score:.1f}/100). "
        
        # Consistency note
        if consistency > 80:
            explanation += "Your signals were highly consistent across all areas. "
        elif consistency > 60:
            explanation += "Your confidence signals were generally consistent. "
        elif len(mixed) > 0:
            explanation += "However, there were some mixed signals - "
            explanation += f"while some areas showed strength, others revealed uncertainty. "
        
        # Strengths
        if len(positives) > 0:
            explanation += f"Key strengths included: {positives[0].lower()}. "
        
        # Weaknesses
        if len(negatives) > 0:
            explanation += f"Areas for improvement: {negatives[0].lower()}. "
        
        return explanation
    
    # ========================================================================
    # MAIN INFERENCE FUNCTION
    # ========================================================================
    
    def infer_confidence(self) -> ConfidenceBreakdown:
        """
        Run complete confidence inference
        
        Returns:
            ConfidenceBreakdown object with full analysis
        """
        print("Starting confidence inference...")
        
        # Calculate individual signal scores
        print("  [1/7] Scoring eye contact...")
        eye_contact = self.score_eye_contact()
        
        print("  [2/7] Scoring posture...")
        posture = self.score_posture()
        
        print("  [3/7] Scoring voice control...")
        voice = self.score_voice_control()
        
        print("  [4/7] Scoring speech flow...")
        flow = self.score_speech_flow()
        
        print("  [5/7] Scoring facial engagement...")
        facial = self.score_facial_engagement()
        
        # Aggregate all signals
        signals = [eye_contact, posture, voice, flow, facial]
        
        # Calculate overall confidence (weighted sum)
        print("  [6/7] Calculating overall confidence...")
        overall_score = sum(s.weighted_score for s in signals)
        overall_score = round(overall_score, 1)
        
        # Determine confidence level
        if overall_score >= self.config.VERY_HIGH_THRESHOLD:
            confidence_level = ConfidenceLevel.VERY_HIGH
        elif overall_score >= self.config.HIGH_THRESHOLD:
            confidence_level = ConfidenceLevel.HIGH
        elif overall_score >= self.config.MODERATE_HIGH_THRESHOLD:
            confidence_level = ConfidenceLevel.MODERATE_HIGH
        elif overall_score >= self.config.MODERATE_THRESHOLD:
            confidence_level = ConfidenceLevel.MODERATE
        elif overall_score >= self.config.LOW_THRESHOLD:
            confidence_level = ConfidenceLevel.LOW
        else:
            confidence_level = ConfidenceLevel.VERY_LOW
        
        # Analyze consistency
        print("  [7/7] Analyzing consistency and generating recommendations...")
        consistency, mixed = self.analyze_consistency(signals)
        
        # Classify indicators
        positives, negatives = self.classify_indicators(signals)
        
        # Generate recommendations
        priorities = self.generate_improvement_priorities(signals)
        quick_wins = self.generate_quick_wins(signals)
        
        # Identify strengths and weaknesses
        strengths = [s.name for s in signals if s.quality in [SignalQuality.EXCELLENT, SignalQuality.GOOD]]
        weaknesses = [s.name for s in signals if s.quality in [SignalQuality.POOR, SignalQuality.CRITICAL]]
        
        # Generate explanation
        explanation = self.generate_explanation(
            overall_score, consistency, positives, negatives, mixed
        )
        
        print("✓ Confidence inference complete!")
        
        return ConfidenceBreakdown(
            overall_confidence_score=overall_score,
            confidence_level=confidence_level,
            
            # Individual signals
            eye_contact_signal=eye_contact,
            posture_signal=posture,
            voice_control_signal=voice,
            speech_flow_signal=flow,
            facial_engagement_signal=facial,
            
            # Analysis
            positive_indicators=positives,
            negative_indicators=negatives,
            mixed_signals=mixed,
            
            # Scores
            consistency_score=consistency,
            stability_score=consistency,  # For now, same as consistency
            
            # Explanation
            primary_strengths=strengths,
            primary_weaknesses=weaknesses,
            overall_explanation=explanation,
            
            # Recommendations
            improvement_priority=priorities,
            quick_wins=quick_wins
        )
    
    # ========================================================================
    # UTILITY FUNCTIONS
    # ========================================================================
    
    def get_visual_breakdown(self) -> str:
        """
        Generate ASCII visualization of confidence breakdown
        
        Returns:
            ASCII art visualization
        """
        breakdown = self.infer_confidence()
        
        signals = [
            breakdown.eye_contact_signal,
            breakdown.posture_signal,
            breakdown.voice_control_signal,
            breakdown.speech_flow_signal,
            breakdown.facial_engagement_signal
        ]
        
        output = "\n"
        output += "=" * 70 + "\n"
        output += "CONFIDENCE BREAKDOWN\n"
        output += "=" * 70 + "\n\n"
        
        output += f"Overall Confidence: {breakdown.overall_confidence_score:.1f}/100 "
        output += f"({breakdown.confidence_level.value.upper()})\n\n"
        
        output += "Signal Contributions:\n"
        output += "-" * 70 + "\n"
        
        for signal in signals:
            bar_length = int(signal.raw_score / 2)  # Scale to 50 chars max
            bar = "█" * bar_length + "░" * (50 - bar_length)
            
            output += f"{signal.name:20} [{bar}] {signal.raw_score:5.1f}/100\n"
            output += f"{'':20} Weight: {signal.weight:.2f} | Contribution: {signal.weighted_score:.2f}\n"
            output += f"{'':20} {signal.interpretation}\n\n"
        
        output += "=" * 70 + "\n"
        output += f"Consistency Score: {breakdown.consistency_score:.1f}/100\n"
        output += "=" * 70 + "\n"
        
        return output


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

def example_basic_inference():
    """Example: Basic confidence inference"""
    
    print("=" * 70)
    print("EXAMPLE 1: Basic Confidence Inference")
    print("=" * 70)
    
    # Sample metrics (from your analyzers)
    verbal_metrics = {
        'clarity_score': 68.5,
        'volume_stability_score': 75.0,
        'tone_modulation_score': 72.0,
        'pitch_monotony_score': 35.0,
        'filler_rate_per_minute': 3.8,
        'long_pause_count': 3,
        'speech_rate_wpm': 145
    }
    
    nonverbal_metrics = {
        'eye_contact_percentage': 58.0,
        'gaze_stability_score': 65.0,
        'avg_gaze_duration': 2.1,
        'posture_score': 78.0,
        'shoulder_alignment_score': 85.0,
        'head_tilt_avg': -3.2,
        'forward_lean_percentage': 15.0,
        'facial_engagement_score': 75.0,
        'smile_frequency': 3
    }
    
    # Run inference
    analyzer = ConfidenceAnalyzer(verbal_metrics, nonverbal_metrics)
    result = analyzer.infer_confidence()
    
    # Print visualization
    print(analyzer.get_visual_breakdown())
    
    print("\nExpected Output:")
    print(f"Overall Confidence: ~71.2/100")
    print(f"Level: MODERATE_HIGH")


def example_detailed_breakdown():
    """Example: Detailed breakdown with explanations"""
    
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Detailed Breakdown")
    print("=" * 70)
    
    # (Same setup as above)
    verbal_metrics = {
        'clarity_score': 68.5,
        'volume_stability_score': 75.0,
        'tone_modulation_score': 72.0,
        'pitch_monotony_score': 35.0,
        'filler_rate_per_minute': 3.8,
        'long_pause_count': 3,
        'speech_rate_wpm': 145
    }
    
    nonverbal_metrics = {
        'eye_contact_percentage': 58.0,
        'gaze_stability_score': 65.0,
        'avg_gaze_duration': 2.1,
        'posture_score': 78.0,
        'shoulder_alignment_score': 85.0,
        'head_tilt_avg': -3.2,
        'forward_lean_percentage': 15.0,
        'facial_engagement_score': 75.0,
        'smile_frequency': 3
    }
    
    analyzer = ConfidenceAnalyzer(verbal_metrics, nonverbal_metrics)
    result = analyzer.infer_confidence()
    
    print("\nPositive Indicators:")
    for indicator in result.positive_indicators:
        print(f"  ✓ {indicator}")
    
    print("\nNegative Indicators:")
    for indicator in result.negative_indicators:
        print(f"  ✗ {indicator}")
    
    print("\nImprovement Priorities:")
    for i, priority in enumerate(result.improvement_priority[:3], 1):
        print(f"  {i}. {priority}")
    
    print(f"\nExplanation:\n  {result.overall_explanation}")


def example_json_export():
    """Example: JSON export for API"""
    
    print("\n" + "=" * 70)
    print("EXAMPLE 3: JSON Export")
    print("=" * 70)
    
    verbal_metrics = {'clarity_score': 68.5, 'volume_stability_score': 75.0}
    nonverbal_metrics = {'eye_contact_percentage': 58.0, 'posture_score': 78.0}
    
    analyzer = ConfidenceAnalyzer(verbal_metrics, nonverbal_metrics)
    result = analyzer.infer_confidence()
    
    # Export to JSON
    json_output = result.to_json()
    
    print("\nJSON Structure (truncated):")
    print(json.dumps(json.loads(json_output), indent=2)[:500] + "...")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║            CONFIDENCE & PRESENCE INFERENCE ENGINE                        ║
║                                                                          ║
║  Explainable AI system for transparent confidence assessment            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    print("\nKEY FEATURES:")
    print("  ✓ Transparent weighted scoring (NO black-box ML)")
    print("  ✓ Individual signal breakdown with explanations")
    print("  ✓ Consistency analysis across signals")
    print("  ✓ Mixed signal detection")
    print("  ✓ Prioritized actionable recommendations")
    print("  ✓ Full explainability for academic defense")
    print("  ✓ Visual confidence breakdown")
    
    print("\n" + "=" * 70)
    print("CONFIDENCE FORMULA:")
    print("=" * 70)
    print("""
Confidence = 
    (Eye Contact Score × 0.25) +
    (Posture Score × 0.20) +
    (Voice Control Score × 0.25) +
    (Speech Flow Score × 0.20) +
    (Facial Engagement Score × 0.10)

Where each component is independently scored 0-100
    """)
    
    print("=" * 70)
    print("SIGNAL WEIGHTS RATIONALE:")
    print("=" * 70)
    print("""
Eye Contact (25%):     Critical for demonstrating engagement and honesty
Posture (20%):         Strong physical indicator of confidence
Voice Control (25%):   Vocal power and stability project authority
Speech Flow (20%):     Clarity and fluency demonstrate preparation
Facial Engagement (10%): Emotional expressiveness (supportive signal)
    """)
    
    # Run examples
    example_basic_inference()
    example_detailed_breakdown()
    example_json_export()
    
    print("\n" + "=" * 70)
    print("READY FOR INTEGRATION")
    print("=" * 70)
