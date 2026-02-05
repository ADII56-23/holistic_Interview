import speech_recognition as sr
import librosa
import numpy as np
import time

def analyze_speech():
    r = sr.Recognizer()

    print("\n🎤 Initializing microphone...")
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source, duration=0.5)

        print("🎤 STATUS: Listening (speak now)...")
        try:
            audio = r.listen(source, timeout=5, phrase_time_limit=7)
            print("✅ STATUS: Audio captured")
        except sr.WaitTimeoutError:
            print("❌ STATUS: No speech detected")
            return

    try:
        print("🧠 STATUS: Recognizing speech...")
        start_time = time.time()

        text = r.recognize_google(audio)
        end_time = time.time()

        print("📝 STATUS: Recognition successful")
        print("🗣 YOU SAID:", text)

        # Convert raw audio to numpy
        raw_audio = np.frombuffer(audio.get_raw_data(), np.int16)
        audio_data = raw_audio.astype(np.float32) / 32768.0
        sample_rate = audio.sample_rate

        # Pitch extraction
        pitch_values = librosa.yin(
            audio_data,
            fmin=50,
            fmax=500,
            sr=sample_rate
        )
        pitch = float(np.nanmean(pitch_values))

        # Energy (volume)
        energy = float(np.mean(librosa.feature.rms(y=audio_data)))

        # Speech clarity (words per second)
        duration = len(audio_data) / sample_rate
        words = len(text.split())
        clarity_score = round(words / duration, 2)

        print("\n📊 SPEECH ANALYSIS RESULTS")
        print("----------------------------")
        print(f"🕒 Recognition Time : {round(end_time - start_time, 2)} sec")
        print(f"🎵 Pitch            : {round(pitch, 2)} Hz")
        print(f"🔊 Energy           : {round(energy, 4)}")
        print(f"🧠 Clarity Score    : {clarity_score} words/sec")

        # Simple confidence score
        confidence_score = int(
            0.4 * min(energy * 1000, 100) +
            0.3 * min(pitch / 2, 100) +
            0.3 * min(clarity_score * 10, 100)
        )

        print(f"\n🔥 SPEECH CONFIDENCE SCORE: {confidence_score}/100")

    except sr.UnknownValueError:
        print("❌ ERROR: Speech not clear")
    except sr.RequestError as e:
        print("❌ ERROR: Speech service unavailable:", e)
    except Exception as e:
        print("❌ ERROR:", e)


# ---------------- MAIN ----------------
if __name__ == "__main__":
    print("🎯 Interview AI - Speech Module")
    print("Press Ctrl + C to stop\n")

    try:
        analyze_speech()
    except KeyboardInterrupt:
        print("\n🛑 Program stopped by user")
