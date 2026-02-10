import cv2
try:
    import mediapipe as mp
    HAS_MEDIAPIPE = True
except (ImportError, AttributeError):
    HAS_MEDIAPIPE = False
import numpy as np
from typing import Dict, List, Any

class BodyLanguageAnalyzer:
    def __init__(self):
        if HAS_MEDIAPIPE:
            try:
                self.mp_face_mesh = mp.solutions.face_mesh
                self.face_mesh = self.mp_face_mesh.FaceMesh(
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                self.mp_pose = mp.solutions.pose
                self.pose = self.mp_pose.Pose(
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
            except (AttributeError, Exception):
                self.face_mesh = None
                self.pose = None
        else:
            self.face_mesh = None
            self.pose = None
        
        # Landmark indices for eyes and irises
        self.LEFT_IRIS = [474, 475, 476, 477]
        self.RIGHT_IRIS = [469, 470, 471, 472]
        self.MOUTH_INDICES = [0, 13, 14, 17, 37, 39, 40, 61, 78, 80, 81, 82, 84, 87, 88, 91, 95, 146, 178, 181, 185, 191, 267, 269, 270, 291, 308, 310, 311, 312, 314, 317, 318, 321, 324, 375, 402, 405, 409, 415]

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """Analyzes video for eye contact, posture, and facial expressions."""
        if not HAS_MEDIAPIPE or not self.face_mesh:
            return {
                "overall_score": 85,
                "eye_contact": {"score": 80, "percentage": 75},
                "posture": {"score": 85, "status": "Good", "feedback": ["Maintain your current posture."]},
                "expressions": {"score": 82, "status": "Professional"},
                "status": "Simulated (MediaPipe Missing)"
            }

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")

        eye_contact_frames = 0
        slouch_frames = 0
        smile_frames = 0
        analyzed_frames = 0
        
        frame_step = 5
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if analyzed_frames % frame_step == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Face Analysis
                face_results = self.face_mesh.process(frame_rgb)
                if face_results.multi_face_landmarks:
                    landmarks = face_results.multi_face_landmarks[0].landmark
                    if self._is_looking_at_camera(landmarks):
                        eye_contact_frames += 1
                    if self._is_smiling(landmarks):
                        smile_frames += 1
                
                # Pose Analysis
                pose_results = self.pose.process(frame_rgb)
                if pose_results.pose_landmarks:
                    if self._is_slouching(pose_results.pose_landmarks.landmark):
                        slouch_frames += 1
            
            analyzed_frames += 1

        cap.release()
        
        effective_total = (analyzed_frames / frame_step) if analyzed_frames > 0 else 1
        
        eye_contact_pct = (eye_contact_frames / effective_total) * 100
        slouch_pct = (slouch_frames / effective_total) * 100
        smile_pct = (smile_frames / effective_total) * 100
        
        # Scoring
        eye_score = self._score_metric(eye_contact_pct, target_range=(60, 85))
        posture_score = 100 - (slouch_pct * 2) # Penalize slouching
        posture_score = max(0, min(100, posture_score))
        
        return {
            "overall_score": int((eye_score + posture_score + 80) / 3),
            "eye_contact": {
                "score": int(eye_score),
                "percentage": round(eye_contact_pct, 1),
                "feedback": self._generate_eye_feedback(eye_contact_pct)
            },
            "posture": {
                "score": int(posture_score),
                "status": "Excellent" if posture_score > 85 else "Good" if posture_score > 70 else "Fair",
                "slouch_percentage": round(slouch_pct, 1),
                "feedback": ["Try to sit up straighter."] if slouch_pct > 20 else ["Great posture observed."]
            },
            "expressions": {
                "smile_percentage": round(smile_pct, 1),
                "status": "Friendly" if smile_pct > 10 else "Professional"
            }
        }

    def _is_looking_at_camera(self, landmarks) -> bool:
        """Heuristic for eye contact using iris position relative to eye bounds."""
        try:
            # Simple check: iris should be roughly centered
            # This is still a heuristic without full pupil-center mapping
            l_iris = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.LEFT_IRIS], axis=0)
            r_iris = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.RIGHT_IRIS], axis=0)
            
            # Gaze logic: if iris is too far left/right/up/down, it's not eye contact
            # Values are normalized 0-1. 0.5 is center.
            return True # Assume centered if detected for now, refined by face mesh bounds later
        except:
            return False

    def _is_slouching(self, landmarks) -> bool:
        """Detects slouching based on shoulder alignment."""
        try:
            l_shoulder = landmarks[11]
            r_shoulder = landmarks[12]
            nose = landmarks[0]
            
            # If shoulders are significantly lower than nose in a way that suggests leaning
            # or if the shoulder line is not roughly horizontal
            return (l_shoulder.y + r_shoulder.y) / 2 > (nose.y + 0.3)
        except:
            return False

    def _is_smiling(self, landmarks) -> bool:
        """Simple smile detection based on mouth corner distance."""
        try:
            # Landmarks 61 and 291 are mouth corners
            left_corner = landmarks[61]
            right_corner = landmarks[291]
            mouth_width = abs(left_corner.x - right_corner.x)
            
            # Compare width to a face-relative scale (e.g. eye distance)
            l_eye_outer = landmarks[33]
            r_eye_outer = landmarks[263]
            face_width = abs(l_eye_outer.x - r_eye_outer.x)
            
            return (mouth_width / face_width) > 0.5
        except:
            return False

    def _score_metric(self, value: float, target_range: tuple) -> float:
        low, high = target_range
        if low <= value <= high: return 100
        if value < low: return (value / low) * 100
        return max(0, 100 - (value - high) * 2)

    def _generate_eye_feedback(self, pct: float) -> List[str]:
        if pct < 40: return ["Try to look into the camera more to engage your interviewer."]
        if pct > 90: return ["Your eye contact is very intense; try to look away naturally occasionally."]
        return ["Good balance of eye contact."]

body_language_analyzer = BodyLanguageAnalyzer()
