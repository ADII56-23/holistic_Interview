import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Video,
  ChevronRight,
  AlertCircle,
  Clock,
  Square,
  Activity,
  BrainCircuit,
  ShieldCheck,
  MessageSquare,
  ScanFace,
  Loader2,
  Brain
} from 'lucide-react';
import InterviewFeedback from './InterviewFeedback';

/* ---------- MediaPipe Imports ---------- */
import {
  Holistic,
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  type Results as HolisticResults
} from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';


/* ---------- Web Speech API Types ---------- */
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (e: SpeechRecognitionEvent) => void;
  onerror: (e: any) => void;
  onend: () => void;
}

interface HireVueInterviewProps {
  onBack: () => void;
  role: string;
}

const HireVueInterview: React.FC<HireVueInterviewProps> = ({ onBack, role }) => {
  const [step, setStep] = useState<'intro' | 'interview' | 'results'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interimText, setInterimText] = useState('');
  const [allTranscripts, setAllTranscripts] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realVolume, setRealVolume] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Real-time Visual Metrics
  const [postureStatus, setPostureStatus] = useState<"Good" | "Needs Correction">("Good");
  const [eyeContactStatus, setEyeContactStatus] = useState<"Good" | "Poor">("Good");
  const [confidenceScore] = useState(100);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);

  const [questions, setQuestions] = useState<string[]>([
    "Tell me about a time you had to handle a difficult situation at work.",
    "Describe a project you're particularly proud of and your role in it.",
    "How do you prioritize tasks under tight deadlines?",
    "What are your strengths for this role?",
    "Where do you see yourself in five years?"
  ]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsGeneratingQuestions(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/questions/generate-interview?role=${encodeURIComponent(role)}`, {
          method: 'POST'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dynamic questions:", error);
      } finally {
        setIsGeneratingQuestions(false);
      }
    };

    if (role) {
      fetchQuestions();
    }
  }, [role]);

  /* -------------------- SPEECH TO TEXT -------------------- */
  const isSTTRunningRef = useRef(false);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SR() as SpeechRecognition;
    recognition.lang = 'en-US';
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Safe start function
    const safeStart = () => {
      if (isSTTRunningRef.current) {
        console.log('STT already running, skipping start');
        return;
      }
      try {
        recognition.start();
        isSTTRunningRef.current = true;
        console.log('🎤 STT started');
      } catch (e: any) {
        console.warn('STT start error:', e.message);
        isSTTRunningRef.current = false;
      }
    };

    // Audio detection events for debugging
    (recognition as any).onaudiostart = () => {
      console.log('🎤 STT: Audio capture active');
    };

    (recognition as any).onsoundstart = () => {
      console.log('🔊 STT: Sound detected!');
    };

    (recognition as any).onspeechstart = () => {
      console.log('🗣️ STT: Speech detected!');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('📝 STT Result received');

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          console.log('✅ Final:', text, '(confidence:', (confidence * 100).toFixed(0) + '%)');
          final += text;
        } else {
          console.log('💭 Interim:', text);
          interim += text;
        }
      }

      if (final.trim()) {
        setTranscript(prev => [...prev, final.trim()]);
      }
      setInterimText(interim);
    };

    recognition.onend = () => {
      isSTTRunningRef.current = false;
      console.log('� STT ended');

      // Auto-restart if still recording
      if (isRecordingRef.current) {
        setTimeout(safeStart, 500);
      }
    };

    recognition.onerror = (e: any) => {
      isSTTRunningRef.current = false;

      if (e.error === 'no-speech') {
        // This is normal - just means silence, will auto-restart via onend
        console.log('⏳ No speech detected');
      } else if (e.error === 'aborted') {
        console.log('🔄 STT aborted, will restart');
      } else if (e.error === 'network') {
        console.warn('🌐 Network error - check internet connection');
      } else if (e.error === 'not-allowed') {
        console.error('❌ Microphone permission denied');
      } else {
        console.error('❌ STT error:', e.error);
      }
    };

    // Store reference with safeStart method
    (recognition as any).safeStart = safeStart;
    recognitionRef.current = recognition;
  }, []);

  /* -------------------- MEDIAPIPE HOLISTIC -------------------- */
  useEffect(() => {
    if (step !== 'interview') return;

    let holistic: Holistic | null = null;
    let animationFrameId: number;

    const onResults = (results: HolisticResults) => {
      if (!canvasRef.current || !videoRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Match canvas size to video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // 1. Draw Pose
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(255,255,255,0.5)', lineWidth: 1 });
      drawLandmarks(ctx, results.poseLandmarks, { color: 'rgba(255,165,0,0.8)', lineWidth: 2, radius: 3 });

      // 2. Draw Face Mesh (Subtle)
      drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, { color: 'rgba(255,255,255,0.1)', lineWidth: 1 });

      // 3. Real-time Metrics Calculation
      if (results.poseLandmarks) {
        // Posture: Check shoulder alignment (landmarks 11 & 12)
        const leftShoulder = results.poseLandmarks[11];
        const rightShoulder = results.poseLandmarks[12];

        if (leftShoulder && rightShoulder) {
          const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
          // If slope > 0.05, shoulders are uneven
          if (shoulderSlope > 0.05) setPostureStatus("Needs Correction");
          else setPostureStatus("Good");
        }
      }

      if (results.faceLandmarks) {
        // Eye Contact: approximate by face orientation (nose tip at index 1)
        const nose = results.faceLandmarks[1];
        if (nose) {
          // Check if nose is roughly centered (0.4 to 0.6)
          if (nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.2 && nose.y < 0.8) {
            setEyeContactStatus("Good");
          } else {
            setEyeContactStatus("Poor");
          }
        }
      } else {
        setEyeContactStatus("Poor"); // No face detected
      }

      ctx.restore();
    };

    const initHolistic = async () => {
      holistic = new Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      holistic.onResults(onResults);
      await holistic.initialize();

      // Start processing loop
      const processFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            await holistic?.send({ image: videoRef.current });
          } catch (e) {
            // ignore frame errors
          }
        }
        animationFrameId = requestAnimationFrame(processFrame);
      };
      processFrame();
    };

    initHolistic();

    return () => {
      cancelAnimationFrame(animationFrameId);
      holistic?.close();
    };
  }, [step]);


  /* -------------------- CAMERA -------------------- */
  useEffect(() => {
    if (step !== 'interview') return;

    let activeStream: MediaStream | null = null;

    const initCamera = async () => {
      // Wait for component to fully mount
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("Initializing camera...");
      try {
        // First, check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera/Microphone access is not supported in this browser. Please use Chrome, Edge, or Firefox.');
        }

        // Enumerate devices to check what's available
        let devices;
        try {
          devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideo = devices.some(device => device.kind === 'videoinput');
          const hasAudio = devices.some(device => device.kind === 'audioinput');

          console.log('Available devices:', {
            video: hasVideo,
            audio: hasAudio,
            devices: devices.map(d => ({ kind: d.kind, label: d.label }))
          });

          if (!hasVideo && !hasAudio) {
            throw new Error('No camera or microphone found. Please connect a webcam and microphone.');
          }
          if (!hasVideo) {
            throw new Error('No camera found. Please connect a webcam to continue.');
          }
          if (!hasAudio) {
            throw new Error('No microphone found. Please connect a microphone to continue.');
          }
        } catch (enumErr) {
          console.warn('Device enumeration failed:', enumErr);
          // Continue anyway, getUserMedia might still work
        }

        // Try to get media stream with fallback options
        let stream;
        try {
          // First attempt: with ideal constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true // Important for boosting low volume
            }
          });
        } catch (firstErr: any) {
          console.warn('First attempt failed, trying with basic constraints:', firstErr);

          // Second attempt: basic constraints
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
          } catch (secondErr: any) {
            // If still failing, provide specific error message
            if (secondErr.name === 'NotFoundError') {
              throw new Error('Camera or microphone not found. Please ensure they are connected and not being used by another application.');
            } else if (secondErr.name === 'NotAllowedError' || secondErr.name === 'PermissionDeniedError') {
              throw new Error('Camera/microphone permission denied. Please allow access in your browser settings and refresh the page.');
            } else if (secondErr.name === 'NotReadableError') {
              throw new Error('Camera/microphone is already in use by another application. Please close other apps and try again.');
            } else {
              throw secondErr;
            }
          }
        }

        console.log("Stream successfully obtained:", stream.id);
        activeStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Try to play immediately
          videoRef.current.play().catch(e => console.warn("Initial play failed:", e));
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        alert(err.message || 'Could not access camera/mic. Please ensure permissions are granted and no other application is using them.');
      }
    };

    initCamera();


    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      streamRef.current = null;
    };
  }, [step]);

  /* -------------------- VOLUME DETECTION -------------------- */
  useEffect(() => {
    if (!isRecording || !analyserRef.current) {
      setRealVolume(0);
      return;
    }

    console.log('Volume detection starting, analyser ready:', !!analyserRef.current);
    const analyser = analyserRef.current;

    // Use time-domain data for reliable audio detection
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    let raf: number;
    let frameCount = 0;

    const loop = () => {
      if (!analyserRef.current) {
        setRealVolume(0);
        return;
      }

      // Get time-domain data (waveform)
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS (Root Mean Square) for volume
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      // Scale up significantly for UI display (microphone levels are typically low)
      const scaledVolume = Math.min(100, Math.round(rms * 500));

      // Debug log every 60 frames (~1 second)
      frameCount++;
      if (frameCount % 60 === 0) {
        console.log('Audio RMS:', rms.toFixed(4), 'Scaled volume:', scaledVolume, 'Raw sample:', dataArray[0]);
      }

      setRealVolume(scaledVolume);
      raf = requestAnimationFrame(loop);
    };

    // Small delay to ensure analyser is fully ready
    const timeoutId = setTimeout(loop, 100);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(raf);
    };
  }, [isRecording]);

  /* -------------------- TIMER -------------------- */
  useEffect(() => {
    let id: any;
    if (isRecording) id = setInterval(() => setTimer(t => t + 1), 1000);
    else setTimer(0);
    return () => clearInterval(id);
  }, [isRecording]);

  /* -------------------- START RECORDING -------------------- */
  const startMedia = async () => {
    if (isRecordingRef.current) return;

    // Set refs first, but don't trigger re-render yet
    isRecordingRef.current = true;
    setTranscript([]);
    setInterimText('');

    if (!streamRef.current) {
      isRecordingRef.current = false;
      return;
    }

    try {
      // Validate audio tracks exist
      const audioTracks = streamRef.current.getAudioTracks();
      console.log('Audio tracks available:', audioTracks.length, audioTracks.map(t => ({ label: t.label, enabled: t.enabled, muted: t.muted })));

      if (audioTracks.length === 0) {
        console.error('No audio tracks found in stream!');
        alert('No microphone detected. Please ensure your microphone is connected and permissions are granted.');
        isRecordingRef.current = false;
        return;
      }

      // 1. Audio Pipeline initialization - MUST complete before setIsRecording
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      // Remove sampleRate constraint to avoid conflicts with Windows default (often 48k)
      const audioCtx = new AudioCtx();

      // Chrome requirement: Resume context on user action
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      console.log('AudioContext state:', audioCtx.state, 'sampleRate:', audioCtx.sampleRate);

      const source = audioCtx.createMediaStreamSource(streamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512; // Better frequency resolution
      analyser.smoothingTimeConstant = 0.3; // More responsive
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      // Keep pipeline hot with silent connection to destination
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      source.connect(analyser);
      analyser.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      // Store refs BEFORE triggering state update
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      console.log('Audio analyser initialized, frequencyBinCount:', analyser.frequencyBinCount);

      // NOW trigger the recording state - analyser is ready!
      setIsRecording(true);

      // 2. Start Speech Recognition (with longer delay for stability)
      setTimeout(() => {
        if (recognitionRef.current) {
          const recognition = recognitionRef.current as any;
          if (recognition.safeStart) {
            recognition.safeStart();
          } else {
            try {
              recognition.start();
              console.log('Speech recognition started');
            } catch (e) {
              console.warn("STT start error:", e);
            }
          }
        }
      }, 800);

      // 3. Start MediaRecorder with stagger delay (avoids mic conflicts)
      setTimeout(() => {
        if (!isRecordingRef.current) return;
        try {
          const recorder = new MediaRecorder(streamRef.current!, { mimeType: 'video/webm' });
          chunksRef.current = [];
          recorder.ondataavailable = e => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        } catch (e) {
          console.error("MediaRecorder start failed:", e);
        }
      }, 500);

    } catch (err) {
      console.error("Recording init failed:", err);
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  /* -------------------- STOP RECORDING -------------------- */
  const stopMedia = () => {
    isRecordingRef.current = false;
    isSTTRunningRef.current = false; // Reset STT state
    setIsRecording(false);

    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
    }

    if (interimText.trim()) {
      setTranscript(prev => [...prev, interimText.trim()]);
    }

    // Save this question's data
    const finalAnswer = [...transcript, interimText].join(' ').trim() || "(No speech detected)";
    setAllTranscripts(prev => [
      ...prev,
      {
        question: questions[currentQuestionIdx],
        answer: finalAnswer
      }
    ]);

    setInterimText('');
  };

  const handleNext = async () => {
    // If there is an answer, analyze it before moving on

    // Check if we just answered (transcript might be easier to use directly from current capture)
    // Actually, stopMedia saves to allTranscripts.
    // Let's check if we have feedback already.
    if (currentFeedback) {
      // User saw feedback, now proceed
      setCurrentFeedback(null);
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setTranscript([]);
        setInterimText('');
        setTimer(0);
      } else {
        finishInterview();
      }
      return;
    }

    // Identify the last answer provided
    // If not recording, and we are here, likely the user stopped recording.
    // Use the last entry in allTranscripts? 
    // Wait, stopMedia appends to allTranscripts.

    if (allTranscripts.length > currentQuestionIdx) {
      // Answer exists
      setIsAnalyzingAnswer(true);
      try {
        const lastEntry = allTranscripts[allTranscripts.length - 1];
        // Ensure it matches current question
        if (lastEntry.question === questions[currentQuestionIdx]) {
          const res = await fetch('http://localhost:8000/api/v1/questions/analyze-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: lastEntry.question,
              answer: lastEntry.answer
            })
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentFeedback(data);
            setIsAnalyzingAnswer(false);
            return; // Stop here to show feedback
          }
        }
      } catch (err) {
        console.error("Answer analysis failed", err);
      }
      setIsAnalyzingAnswer(false);
    }

    // Fallback if analysis fails or no answer
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTranscript([]);
      setInterimText('');
      setTimer(0);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setStep('results');
    setIsAnalyzing(true);

    try {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoFile = new File([videoBlob], 'interview.webm', { type: 'video/webm' });

      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('role', role);
      formData.append('transcripts', JSON.stringify(allTranscripts));

      const response = await fetch('http://localhost:8000/api/v1/analysis/analyze-video', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /* -------------------- UI STEPS -------------------- */
  if (step === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Video className="w-64 h-64" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">HireVue Simulation</h1>
              <p className="text-slate-500 font-medium tracking-wide">Explainable Multi-Modal Analysis</p>
            </div>
          </div>
          <div className="space-y-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900">Advanced Signal Processing</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Deep analysis of Eye, Filler words, Pause behavior, Pitch variance, and Volume stability using Whisper ASR and Librosa.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                <div className="text-[10px] font-black uppercase text-orange-600 mb-1">Duration</div>
                <div className="font-bold">~15 Mins</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <div className="text-[10px] font-black uppercase text-blue-600 mb-1">Questions</div>
                <div className="font-bold">8 Behavioral</div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep('interview')}
              className="flex-1 py-5 bg-orange-500 text-white rounded-3xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 active:scale-95"
            >
              Start Full Assessment
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={onBack} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-3xl font-bold hover:bg-slate-200 transition-all">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'interview') {
    return (
      <div className="h-[90vh] flex flex-col gap-6 p-6 relative">
        {/* Feedback Overlay */}
        {currentFeedback && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center p-8 animate-fade-in">
            <div className="bg-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">AI Feedback</h3>
                  <p className="text-slate-500 font-medium">Analysis of your answer</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Clarity</div>
                    <div className="text-2xl font-black text-slate-900">{currentFeedback.clarity_score}/100</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Relevance</div>
                    <div className="text-2xl font-black text-slate-900">{currentFeedback.relevance_score}/100</div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700 leading-relaxed">
                  {currentFeedback.feedback}
                </div>

                {currentFeedback.suggestions && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Improvements
                    </h4>
                    <ul className="space-y-2">
                      {currentFeedback.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className="font-bold text-slate-300">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-4"
                >
                  Continue to Next Question
                </button>
              </div>
            </div>
          </div>
        )}

        {isGeneratingQuestions && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Generating Questions...</h3>
            <p className="text-slate-500">Tailoring interview for {role}</p>
          </div>
        )}
        {isAnalyzingAnswer && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Analyzing Answer...</h3>
            <p className="text-slate-500">Generating instant feedback</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Question {currentQuestionIdx + 1}/{questions.length}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold bg-slate-100 px-4 py-1.5 rounded-full text-sm shadow-sm ring-1 ring-slate-200">
                  <Clock className="w-3 h-3 text-orange-500" /> {formatTime(timer)}
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-8 leading-tight">{questions[currentQuestionIdx]}</h2>

              <div className="flex-1 bg-slate-50/50 rounded-[2rem] p-6 overflow-y-auto border border-slate-100 relative shadow-inner">
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm z-10 ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Scanning Voice</span>
                </div>

                <div className="space-y-4">
                  {transcript.length === 0 && !interimText && (
                    <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 text-center">
                      <Mic className={`w-10 h-10 mb-3 ${isRecording ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                      <p className="text-[10px] font-black uppercase tracking-widest">{isRecording ? "Analyzing acoustic signals..." : "Ready to record"}</p>
                    </div>
                  )}
                  {transcript.map((t, i) => (
                    <div key={i} className="flex gap-4 animate-fade-in py-2">
                      <div className="w-1 h-auto bg-orange-500 rounded-full"></div>
                      <p className="text-slate-700 font-bold leading-relaxed">{t}</p>
                    </div>
                  ))}
                  {interimText && (
                    <div className="flex gap-4 animate-pulse py-2">
                      <div className="w-1 h-auto bg-slate-200 rounded-full"></div>
                      <p className="text-slate-400 font-bold italic leading-relaxed">{interimText}...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              {!isRecording ? (
                <button
                  onClick={startMedia}
                  className="flex-1 py-6 bg-orange-500 text-white rounded-3xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
                >Start Recording</button>
              ) : (
                <button
                  onClick={stopMedia}
                  className="flex-1 py-6 bg-red-600 text-white rounded-3xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Square className="w-5 h-5 fill-current" /> Stop Answer
                </button>
              )}
              {!isRecording && allTranscripts.length > currentQuestionIdx && (
                <button onClick={handleNext} className="w-24 h-24 bg-slate-900 text-white rounded-3xl flex items-center justify-center hover:bg-slate-800 shadow-lg active:scale-90 transition-all">
                  <ChevronRight className="w-10 h-10" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <div className="flex-1 bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl border-4 border-white">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-60 pointer-events-none" />

              {/* Real-time AI Metrics Overlay */}
              <div className="absolute top-10 right-10 flex flex-col gap-2 pointer-events-none z-10 transition-all duration-500 hover:opacity-100">
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white w-56 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                    <ScanFace className="w-4 h-4 text-orange-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Biometrics</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Posture</span>
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md transition-all ${postureStatus === 'Good' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20 animate-pulse'}`}>{postureStatus}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Eye Contact</span>
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md transition-all ${eyeContactStatus === 'Good' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>{eyeContactStatus}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Confidence</span>
                      <span className="text-[10px] uppercase font-black px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/20">{confidenceScore}%</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Voice Stability</span>
                        <span className="text-[10px] font-mono text-orange-400">{realVolume > 0 ? realVolume : 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100 ease-out" style={{ width: `${Math.min(100, realVolume * 2)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 left-10 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Inference Tracking Enabled</span>
                </div>
                {isRecording && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${realVolume > 2 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                    {realVolume > 2 ? 'Audio Signal Detected' : 'No Audio Input Found'}
                  </div>
                )}
              </div>

              <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                <div className="flex gap-1.5 items-end h-14 px-8 py-3.5 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                  {[...Array(12)].map((_, i) => {
                    const heightValue = isRecording ? Math.max(15, realVolume * (0.6 + Math.random() * 0.4) * (1 - Math.abs(i - 6) / 12)) : 20;
                    return (
                      <div key={i} className={`w-1.5 rounded-full transition-all duration-75 ${isRecording && realVolume > 2 ? 'bg-orange-500' : 'bg-white/20'}`} style={{ height: `${heightValue}%` }}></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mb-10 border border-orange-500/20">
              <BrainCircuit className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Computing Speech Inference</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Analyzing WPM, pitch stability, and filler word density...</p>
          </div>
        ) : aiAnalysis ? (
          <InterviewFeedback result={aiAnalysis} onClose={onBack} />
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-slate-100 max-w-2xl mx-auto">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-900 mb-4">Submission Failed</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">Internal Error during speech decomposition.</p>
            <button onClick={onBack} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all">Return to Hub</button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default HireVueInterview;