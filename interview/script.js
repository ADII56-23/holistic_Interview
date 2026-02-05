let mediaRecorder;
let liveInterval;
let chunks = [];

const camera = document.getElementById("camera");
const eyeSpan = document.getElementById("eye");
const postureSpan = document.getElementById("posture");
const endBtn = document.getElementById("endBtn");

/* START CAMERA + MIC */
async function startInterview() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  camera.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);

  // ✅ SAFETY CHECK (important)
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.start();

  // LIVE METRICS (simulated vision model)
  liveInterval = setInterval(() => {
    eyeSpan.textContent = random(50, 90);
    postureSpan.textContent = random(70, 95);
  }, 1000);
}

/* END ANSWER */
endBtn.onclick = () => {
  clearInterval(liveInterval);

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  camera.srcObject.getTracks().forEach(t => t.stop());

  document.getElementById("interviewScreen").style.display = "none";
  document.getElementById("processingScreen").style.display = "flex";

  mediaRecorder.onstop = () => {
    setTimeout(showResults, 1500);
  };
};

/* SHOW RESULTS */
async function showResults() {
  document.getElementById("processingScreen").style.display = "none";
  document.getElementById("resultsScreen").style.display = "block";

  // VIDEO RESULTS (replace with real ML later)
  document.getElementById("finalEye").textContent = 60;
  document.getElementById("finalPosture").textContent = 90;

  // 🔥 CREATE AUDIO BLOB
  const audioBlob = new Blob(chunks, { type: "audio/wav" });
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze_speech", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Backend returned error");
    }

    const data = await response.json();

    // 🔥 DEBUG (CHECK THIS IN CONSOLE)
    console.log("🎙 Speech Analysis Response:", data);

    if (data.error) {
      alert("Speech analysis failed on backend");
      return;
    }

    // ✅ UPDATE UI WITH REAL VALUES
    document.getElementById("time").innerText = data.recognition_time;
    document.getElementById("pitch").innerText = data.pitch;
    document.getElementById("energy").innerText = data.energy;
    document.getElementById("clarity").innerText = data.clarity;
    document.getElementById("confidence").innerText = data.confidence;

  } catch (error) {
    console.error("❌ Speech Analysis Error:", error);
    alert("Could not connect to speech analysis backend");
  }
}

/* UTILITY */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* START */
startInterview();
