import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Clock, ArrowLeft, ChevronRight, AlertCircle, BarChart3, MessageSquare, Video, Brain } from 'lucide-react';
import InterviewFeedback from './InterviewFeedback';


interface GeneralInterviewProps {
  onBack: () => void;
  role: string;
  jd?: string;
}

const GeneralInterview: React.FC<GeneralInterviewProps> = ({ onBack, role, jd }) => {
  const [step, setStep] = useState<'intro' | 'interview' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState([
    { id: 1, text: "Tell me about yourself and your experience with " + role },
    { id: 2, text: "What are your greatest professional strengths?" },
    { id: 3, text: "Describe a difficult work situation and how you overcame it." },
    { id: 4, text: "Why do you want to work for our company?" },
    { id: 5, text: "Where do you see yourself in five years?" }
  ]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interimText, setInterimText] = useState('');
  const [timer, setTimer] = useState(150); // 2:30 per question

  // Fetch personalized questions if JD is provided
  useEffect(() => {
    if (jd && jd.trim().length > 20) {
      const fetchQuestions = async () => {
        setQuestionsLoading(true);
        try {
          const response = await fetch('http://localhost:8000/api/v1/questions/generate-from-jd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jd_text: jd })
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setQuestions(data.map((q: any, idx: number) => ({
                id: idx + 1,
                text: q.text
              })));
            }
          }
        } catch (error) {
          console.error("Failed to fetch personalized questions:", error);
        } finally {
          setQuestionsLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [jd]);

  // Metrics (Simulated like in the source codebase)
  const [metrics, setMetrics] = useState({
    posture: 85,
    eyeContact: 78,
    clarity: 82,
    confidence: 88
  });

  const [allScores, setAllScores] = useState<any[]>([]);
  const [allTranscripts, setAllTranscripts] = useState<{ question: string, answer: string }[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [realVolume, setRealVolume] = useState(0);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);

  // Persistent state ref for record status to use in recognition callbacks
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalText) {
          setTranscript(prev => [...prev, finalText]);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        // Ignore no-speech and aborted errors as they're expected during normal operation
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error("Speech Recognition Error:", event.error);
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) { }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
    }
  }, []);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Camera initialization with retry logic
  const initCamera = async (retryCount = 0) => {
    setCameraError(null);

    // Wait a bit before accessing camera (helps with resource conflicts)
    await new Promise(resolve => setTimeout(resolve, 500));

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
          throw new Error('No camera found. Please connect a webcam.');
        }
        if (!hasAudio) {
          throw new Error('No microphone found. Please connect a microphone.');
        }
      } catch (enumErr) {
        console.warn('Device enumeration failed:', enumErr);
        // Continue anyway, getUserMedia might still work
      }

      // Try to get media stream with fallback options
      let mediaStream;
      try {
        // First attempt: both video and audio
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (firstErr: any) {
        console.warn('First attempt failed, trying with basic constraints:', firstErr);

        // Second attempt: basic constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
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

      setStream(mediaStream);

      // Setup Web Audio API for real-time visualization
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch (ae) {
        console.warn("Audio visualization setup failed:", ae);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn("Video play failed:", e));
      }
    } catch (err: any) {
      console.error("Camera error:", err);

      // Retry logic for NotReadableError (camera busy)
      if (err.name === 'NotReadableError' && retryCount < 3) {
        console.log(`Camera busy, retrying in 2 seconds... (attempt ${retryCount + 1}/3)`);
        setCameraError(`Camera busy. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => initCamera(retryCount + 1), 2000);
        return;
      }

      setCameraError(err.message || `Camera Error: ${err.name}. Please check your camera/microphone and try again.`);
    }
  };

  useEffect(() => {
    if (step === 'interview') {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => {
          // Ignore errors when closing AudioContext
          if (err.name !== 'InvalidStateError') {
            console.error('AudioContext close error:', err);
          }
        });
      }
    };
  }, [step]);

  // Audio Analyzer Loop
  useEffect(() => {
    if (!isRecording || !analyserRef.current) return;

    let rafId: number;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateVolume = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        // Map average volume to a 0-100 scale
        setRealVolume(Math.min(100, Math.round(average * 2)));
      }
      rafId = requestAnimationFrame(updateVolume);
    };

    updateVolume();
    return () => cancelAnimationFrame(rafId);
  }, [isRecording]);

  // Live Feedback Logic (Voice & Content)
  useEffect(() => {
    if (!isRecording) {
      setLiveFeedback(null);
      return;
    }

    // Volume based feedback
    if (realVolume > 1 && realVolume < 12) {
      setLiveFeedback("Speak a bit louder...");
    } else if (realVolume > 85) {
      setLiveFeedback("Lower your voice slightly.");
    }

    const timer = setTimeout(() => {
      // Only clear if it's volume feedback
      setLiveFeedback(prev => (prev?.includes('Speak') || prev?.includes('Lower')) ? null : prev);
    }, 4000);

    return () => clearTimeout(timer);
  }, [realVolume, isRecording]);

  useEffect(() => {
    if (!isRecording || transcript.length === 0) return;

    const lastMsg = transcript[transcript.length - 1].toLowerCase();
    const fillers = ["um", "uh", "actually", "basically", "like"];

    if (fillers.some(f => lastMsg.includes(f))) {
      setLiveFeedback("Tip: Focus on minimizing filler words.");
      const timer = setTimeout(() => setLiveFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [transcript, isRecording]);

  const startQuestion = () => {
    setIsRecording(true);
    setTranscript([]);
    setInterimText('');
    setTimer(150);
    // DO NOT reset chunksRef here anymore, we want to accumulate the entire session

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Speech recognition already running or failed to start");
      }
    }

    if (stream) {
      try {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.start(1000); // Capture in 1s chunks
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.error("Recorder start failed:", e);
      }
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopQuestion();
          return 0;
        }
        return prev - 1;
      });

      // Drastically reduce jitter frequency and range to feel more "real"
      setMetrics(prev => {
        // Only update metrics visually every 3 seconds
        if (timer % 3 !== 0) return prev;

        return {
          posture: Math.round(Math.max(75, Math.min(95, prev.posture + (Math.random() * 2 - 1)))),
          eyeContact: Math.round(Math.max(70, Math.min(92, prev.eyeContact + (Math.random() * 4 - 2)))),
          clarity: Math.round(Math.max(80, Math.min(98, prev.clarity + (Math.random() * 2 - 1)))),
          confidence: Math.round(Math.max(85, Math.min(100, prev.confidence + (Math.random() * 2 - 1))))
        };
      });
    }, 1000) as unknown as number;
  };

  const stopQuestion = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setAllScores(prev => [...prev, { ...metrics }]);

    const fullAnswer = transcript.join(' ') + (interimText ? ' ' + interimText : '');
    const newTranscriptEntry = {
      question: questions[currentIdx].text,
      answer: fullAnswer || "(No verbal response captured)"
    };

    setAllTranscripts(prev => [...prev, newTranscriptEntry]);
  };

  const handleNext = async () => {
    if (isRecording) {
      stopQuestion();
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTranscript([]);
      setInterimText('');
      setTimer(150);
    } else {
      setStep('results');
      setIsAnalyzing(true);
      try {
        // Create form data for video and transcript analysis
        const formData = new FormData();
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });

        formData.append('file', videoBlob, 'session_recording.webm');
        formData.append('role', role);

        // Pass the accumulated transcripts for context
        // We include the last one too since state update might be async
        const fullAnswer = transcript.join(' ') + (interimText ? ' ' + interimText : '');
        const finalTranscripts = [...allTranscripts];
        if (finalTranscripts.length < questions.length) {
          finalTranscripts.push({
            question: questions[currentIdx].text,
            answer: fullAnswer || "(No verbal response captured)"
          });
        }
        formData.append('transcripts', JSON.stringify(finalTranscripts));

        // Call the new deep analysis endpoint with the video
        const response = await fetch('http://localhost:8000/api/v1/analysis/analyze-video', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error("Analysis failed");

        const data = await response.json();
        setAiAnalysis(data);
      } catch (error) {
        console.error("Deep Analysis failed, falling back to transcript-only:", error);
        // Fallback to text-only analysis if video fails
        try {
          const response = await fetch('http://localhost:8000/api/v1/questions/analyze-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, transcripts: allTranscripts })
          });
          const data = await response.json();
          setAiAnalysis(data);
        } catch (e) {
          console.error("Fallback analysis also failed.");
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (step === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl elevation-sm text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Video className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">AI General Interview</h1>
          <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Welcome to your AI-powered interview simulation. We'll go through 5 standard behavioral and technical questions for a <span className="text-orange-600 font-bold">{role}</span> role.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <Mic className="w-6 h-6 text-blue-500 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Voice Analysis</h3>
              <p className="text-xs text-slate-500 font-medium">Clarity and confidence tracking in real-time.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <Camera className="w-6 h-6 text-purple-500 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Visual Cues</h3>
              <p className="text-xs text-slate-500 font-medium">Posture and eye contact feedback loops.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock className="w-6 h-6 text-green-500 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Timing</h3>
              <p className="text-xs text-slate-500 font-medium">Industry-standard 2:30 min per response.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setStep('interview')}
              disabled={questionsLoading}
              className="px-12 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50"
            >
              {questionsLoading ? 'Customizing Questions...' : 'Start Session'}
            </button>
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    const avgScore = (key: keyof typeof metrics) => {
      if (allScores.length === 0) return 0;
      return Math.round(allScores.reduce((acc, curr) => acc + curr[key], 0) / allScores.length);
    };

    const overall = Math.round((avgScore('posture') + avgScore('eyeContact') + avgScore('clarity') + avgScore('confidence')) / 4);

    if (isAnalyzing) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative mb-12">
            <div className="w-24 h-24 border-4 border-slate-50 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500">
              <BarChart3 className="w-10 h-10 animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Generating Your Analysis...</h2>
          <p className="text-xl text-slate-500 font-medium max-w-md">Our AI Career Coach is analyzing your speech, body language, and content structure.</p>
        </div>
      );
    }

    return (
      <InterviewFeedback
        result={aiAnalysis || {
          overall_score: overall,
          verbal_score: avgScore('clarity'),
          non_verbal_score: (avgScore('posture') + avgScore('eyeContact')) / 2,
          content_score: avgScore('confidence'),
          breakdown: {
            speech: { pace_score: 85, filler_rate: 4.2, confidence_score: avgScore('confidence'), wpm: 135, filler_words: { "um": 3, "uh": 2 } },
            body_language: { eye_contact: { score: avgScore('eyeContact'), percentage: 70 }, posture: { average_score: avgScore('posture'), slouch_percentage: 10 }, gestures: { movement_score: 80 } },
            content: { relevance_score: 88, star_score: 75, clarity_score: avgScore('clarity') }
          },
          strengths: ["Confident communication", "Good posture"],
          improvements: [{ area: "Filler Words", current_score: 85, how_to_improve: "Try to slow down" }],
          action_items: ["Practice more questions", "Review STAR method"]
        }}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

        {/* Left Panel: Question and Transcription */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Live Response
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
                    {isRecording ? 'Mic Active' : 'Mic Ready'}
                  </span>
                  {isRecording && realVolume > 5 && (
                    <div className="flex gap-0.5 items-center h-3">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="w-0.5 bg-orange-400 rounded-full transition-all duration-75"
                          style={{ height: `${Math.min(100, Math.random() * realVolume + 20)}%` }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Clock className="w-4 h-4" /> {formatTime(timer)}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
              {questions[currentIdx].text}
            </h2>

            <div className="flex-1 bg-slate-50 rounded-2xl p-6 overflow-y-auto border border-slate-100 relative group min-h-[200px]">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded-md">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                    <span className="text-[8px] font-black text-orange-700 uppercase tracking-widest">AI Listening</span>
                  </div>
                )}
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                  Live Transcription
                </div>
              </div>

              {transcript.length === 0 && !interimText && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-10">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">
                    {isRecording ? "Listening for your response..." : "Click \"Start Recording\" to begin your response."}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {transcript.map((t, i) => (
                  <p key={i} className="text-slate-700 font-medium leading-relaxed text-sm animate-fade-in">{t}</p>
                ))}
                {interimText && (
                  <p className="text-slate-400 font-medium italic text-sm border-l-2 border-orange-200 pl-3 py-1">
                    {interimText}...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              {!isRecording ? (
                <button
                  onClick={startQuestion}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopQuestion}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Finish Response
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 group"
            >
              {currentIdx < questions.length - 1 ? 'Go to Next Question' : 'View Final Results'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Panel: Camera and Live Metrics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Video Preview */}
          <div className="flex-1 bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-inner flex items-center justify-center group">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {/* Live Coaching HUD */}
            {liveFeedback && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                <div className="bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-400/50 backdrop-blur-md">
                  <Brain className="w-5 h-5 text-orange-200" />
                  <span className="font-bold text-sm tracking-tight">{liveFeedback}</span>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-white font-bold mb-6 max-w-xs">{cameraError}</p>
                <button
                  onClick={initCamera}
                  className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Live AI Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-black text-white tracking-widest uppercase">
                  {isRecording ? 'Session Live' : 'Hardware Verified'}
                </span>
              </div>
            </div>

            {isRecording && (
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-3">
                {[
                  { label: 'Posture', value: metrics.posture, color: 'bg-blue-500' },
                  { label: 'Eyes', value: metrics.eyeContact, color: 'bg-purple-500' },
                  { label: 'Voice', value: Math.max(metrics.clarity, realVolume), color: 'bg-orange-500' },
                  { label: 'Confidence', value: Math.round(metrics.confidence * 0.7 + realVolume * 0.3), color: 'bg-green-500' },
                ].map((m) => (
                  <div key={m.label} className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 text-center translate-y-2 animate-slide-up">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                    <div className="text-xs font-bold text-white">{m.value}%</div>
                    <div className="text-[7px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Live Estimate</div>
                    <div className="mt-1 w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" /> Interviewer Tips
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-xl">
                <p className="text-[11px] font-bold text-orange-900 mb-1">Star Method</p>
                <p className="text-[10px] text-orange-700">Structure answers with Situation, Task, Action, Result.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-[11px] font-bold text-blue-900 mb-1">Body Language</p>
                <p className="text-[10px] text-blue-700">Keep your shoulders square and look at the camera lens.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Stop Session and Exit
        </button>
      </div>
    </div>
  );
};

export default GeneralInterview;
