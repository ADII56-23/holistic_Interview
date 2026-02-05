import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Clock, UploadCloud, AlertCircle } from 'lucide-react';

const InterviewRecorder: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);



  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera or microphone. Please allow permissions.");
    }
  };

  useEffect(() => {
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (!stream) return;

    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      // Blob creation is handled by the useEffect dependent on 'recording' state
      console.log("Recorder stopped");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000) as unknown as number;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Correct blob creation after stop
  useEffect(() => {
    if (!recording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setUploadedBlob(blob);
      console.log("Recording finished, blob size:", blob.size);
    }
  }, [recording, recordedChunks]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleUpload = async () => {
    if (!uploadedBlob) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      alert(`Uploaded video size: ${(uploadedBlob.size / 1024 / 1024).toFixed(2)} MB`);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-dark-800 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
        {/* Video Preview */}
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90 z-20">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 font-medium">{error}</p>
                <button onClick={initCamera} className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute top-6 left-6 flex gap-4">
            <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs font-bold tracking-wider uppercase">
                {recording ? 'REC' : 'Standby'}
              </span>
            </div>
            {recording && (
              <div className="px-4 py-2 bg-red-600/90 backdrop-blur-md rounded-full flex items-center gap-2 shadow-lg">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-xs font-bold tabular-nums text-white">
                  {formatTime(timer)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 flex items-center justify-between bg-dark-800">
          <div className="flex items-center gap-4">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={!!error}
                className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary-600/25 flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-red-600/25 flex items-center gap-3 active:scale-95"
              >
                <Square className="w-5 h-5 fill-current" />
                Stop Recording
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {uploadedBlob && !recording && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all flex items-center gap-2"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-primary-600" />
                    Save Recording
                  </>
                )}
              </button>
            )}
            <button className="p-4 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
              <Mic className="w-6 h-6" />
            </button>
            <button className="p-4 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">
          Recorded data is processed locally. <br />
          Supported format: WebM (VP9/Opus).
        </p>
      </div>
    </div>
  );
};

export default InterviewRecorder;
