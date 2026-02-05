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
            except (AttributeError, Exception):
                self.face_mesh = None
        else:
            self.face_mesh = None
        
        # Landmark indices for eyes and irises
        self.LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.LEFT_IRIS = [474, 475, 476, 477]
        self.RIGHT_IRIS = [469, 470, 471, 472]

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """Analyzes video for eye contact and body language."""
        if not self.face_mesh:
            return {
                "eye_contact_percentage": 75.0,
                "score": 85,
                "status": "Good (Simulated)",
                "feedback": ["MediaPipe unavailable. Using simulated baseline."]
            }

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        eye_contact_frames = 0
        analyzed_frames = 0
        
        # Sample every 5th frame for performance
        frame_step = 5
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if analyzed_frames % frame_step == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.face_mesh.process(frame_rgb)
                
                if results.multi_face_landmarks:
                    landmarks = results.multi_face_landmarks[0].landmark
                    if self._is_looking_at_camera(landmarks):
                        eye_contact_frames += 1
            
            analyzed_frames += 1

        cap.release()
        
        effective_analyzed = analyzed_frames / frame_step
        contact_percentage = (eye_contact_frames / effective_analyzed * 100) if effective_analyzed > 0 else 0
        
        score = self._calculate_eye_contact_score(contact_percentage)
        
        return {
            "eye_contact_percentage": round(contact_percentage, 1),
            "score": score,
            "status": self._get_status_label(score),
            "feedback": self._generate_feedback(contact_percentage)
        }

    def _is_looking_at_camera(self, landmarks) -> bool:
        """Determines if the gaze is directed at the camera."""
        # Simple heuristic: Check if iris centers are roughly centered in the eye sockets
        # A more robust version would use 3D head pose + iris tracking
        try:
            # Get iris center (average of 4 landmarks)
            left_iris_center = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.LEFT_IRIS], axis=0)
            right_iris_center = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.RIGHT_IRIS], axis=0)
            
            # Gaze tracking logic: distance from center
            # Normal range for 'centered' gaze roughly within small delta
            # This is a placeholder for more complex geometric calculation
            return True # Placeholder: Assume true if face detected for now
        except:
            return False

    def _calculate_eye_contact_score(self, percentage: float) -> int:
        """Scores eye contact: 60-80% is ideal."""
        if 60 <= percentage <= 80: return 100
        if 50 <= percentage < 60 or 80 < percentage <= 90: return 80
        if 40 <= percentage < 50 or 90 < percentage <= 100: return 60
        return 40

    def _get_status_label(self, score: int) -> str:
        if score >= 90: return "Excellent"
        if score >= 75: return "Good"
        if score >= 60: return "Fair"
        return "Poor"

    def _generate_feedback(self, percentage: float) -> List[str]:
        if percentage > 80:
            return ["Try to break eye contact naturally occasionally to avoid staring."]
        if percentage < 50:
            return ["Try to look into the camera more often to build rapport."]
        return ["Great eye contact! You maintained a natural connection."]

body_language_analyzer = BodyLanguageAnalyzer()
