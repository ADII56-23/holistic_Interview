import cv2
import mediapipe as mp
import numpy as np

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

def analyze_posture(results):
    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        left = landmarks[mp_holistic.PoseLandmark.LEFT_SHOULDER.value].y
        right = landmarks[mp_holistic.PoseLandmark.RIGHT_SHOULDER.value].y
        posture_score = 100 - abs(left - right) * 1000

        nose = landmarks[mp_holistic.PoseLandmark.NOSE.value]
        head_tilt = abs(nose.x - 0.5) * 200

        return {
            'posture_score': max(0, min(100, posture_score)),
            'eye_contact_score': max(0, min(100, 100 - head_tilt)),
            'leaning_forward': nose.y < 0.4
        }

    return None

if __name__ == "__main__":
    cap = cv2.VideoCapture(0)
    with mp_holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = holistic.process(image)

            image.flags.writeable = True
            frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_holistic.POSE_CONNECTIONS
                )

            metrics = analyze_posture(results)
            if metrics:
                cv2.putText(frame, f"Posture: {int(metrics['posture_score'])}",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
                cv2.putText(frame, f"Eye Contact: {int(metrics['eye_contact_score'])}",
                            (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,0,0), 2)

            cv2.imshow('Holistic Interview Intelligence - Pose', frame)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()
