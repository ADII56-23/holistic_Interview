from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import librosa
import numpy as np
import soundfile as sf
import io
import time

app = Flask(__name__)

# 🔥 ALLOW EVERYTHING (DEV MODE)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/analyze_speech", methods=["POST", "OPTIONS"])
def analyze_speech():
    print("🎙 Audio received from frontend")  # DEBUG

    recognizer = sr.Recognizer()

    if "audio" not in request.files:
        return jsonify({"error": "No audio file received"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))
    audio_data = audio_data.astype(np.float32)

    audio_sr = sr.AudioData(audio_data.tobytes(), sample_rate, 2)

    start = time.time()
    text = recognizer.recognize_google(audio_sr)
    end = time.time()

    pitch_values = librosa.yin(audio_data, fmin=50, fmax=500, sr=sample_rate)
    pitch = float(np.nanmean(pitch_values))

    energy = float(np.mean(librosa.feature.rms(y=audio_data)))
    duration = len(audio_data) / sample_rate
    clarity = round(len(text.split()) / duration, 2)

    confidence = int(
        0.4 * min(energy * 1000, 100) +
        0.3 * min(pitch / 2, 100) +
        0.3 * min(clarity * 10, 100)
    )

    return jsonify({
        "recognition_time": round(end - start, 2),
        "pitch": round(pitch, 2),
        "energy": round(energy, 4),
        "clarity": clarity,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
