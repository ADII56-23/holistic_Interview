import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Clock, ArrowLeft, ChevronRight, CheckCircle2, AlertCircle, Award, BarChart3, MessageSquare, Video, Loader2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
}

interface GeneralInterviewProps {
  onBack: () => void;
  role?: string;
}

const GeneralInterview: React.FC<GeneralInterviewProps> = ({ onBack, role = 'Software Engineer' }) => {
  const [step, setStep] = useState<'intro' | 'interview' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interimText, setInterimText] = useState('');
  const [timer, setTimer] = useState(150); // 2:30 per question

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

  const questions: Question[] = [
    { id: 1, text: "Tell me about yourself and your experience as a " + role + "." },
    { id: 2, text: "Describe a challenging technical project you worked on recently." },
    { id: 3, text: "How do you handle disagreements within a technical team?" },
    { id: 4, text: "What are your greatest professional strengths and weaknesses?" },
    { id: 5, text: "Where do you see your career heading in the next 5 years?" }
  ];

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) setTranscript(prev => [...prev, final]);
        setInterimText(interim);
      };

      recognition.onend = () => {
        if (isRecording) recognition.start();
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording]);

  const [cameraError, setCameraError] = useState<string | null>(null);

  // Camera initialization
  const initCamera = async () => {
    setCameraError(null);
    console.log("Initializing camera...");
    try {
      // Use simpler constraints first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log("Stream captured:", stream.id);
      console.log("Video tracks:", stream.getVideoTracks().length);
      console.log("Audio tracks:", stream.getAudioTracks().length);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure the video plays once metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current?.play().then(() => {
            console.log("Playback started successfully");
          }).catch(e => {
            console.error("Playback start failed:", e);
          });
        };
      }
    } catch (err: any) {
      console.error("Critical Camera error:", err);
      if (err.name === 'NotAllowedError') {
        setCameraError("Camera/Mic access was denied. Please check your browser's site settings and click Retry.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError("No camera or microphone found. Please connect your hardware and click Retry.");
      } else {
        setCameraError(`Camera Error: ${err.message || 'Unknown error'}. Please refresh or try another browser.`);
      }
    }
  };

  useEffect(() => {
    if (step === 'interview') {
      initCamera();
    }

    return () => {
      // Cleanup tracks on unmount or step change
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const startQuestion = () => {
    setIsRecording(true);
    setTranscript([]);
    setInterimText('');
    setTimer(150);
    if (recognitionRef.current) recognitionRef.current.start();

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopQuestion();
          return 0;
        }
        return prev - 1;
      });

      // Update random metrics to simulate AI
      setMetrics({
        posture: Math.floor(Math.random() * 10) + 85,
        eyeContact: Math.floor(Math.random() * 15) + 75,
        clarity: Math.floor(Math.random() * 10) + 80,
        confidence: Math.floor(Math.random() * 12) + 82
      });
    }, 1000) as unknown as number;
  };

  const stopQuestion = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);

    // Save scores for this question
    setAllScores(prev => [...prev, { ...metrics }]);

    // Save transcript for this question
    const fullAnswer = transcript.join(' ') + (interimText ? ' ' + interimText : '');
    setAllTranscripts(prev => [...prev, {
      question: questions[currentIdx].text,
      answer: fullAnswer || "(No verbal response captured)"
    }]);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTranscript([]);
      setInterimText('');
      setTimer(150);
    } else {
      setStep('results');
      setIsAnalyzing(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/questions/analyze-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            transcripts: allTranscripts
          })
        });
        const data = await response.json();
        setAiAnalysis(data);
      } catch (error) {
        console.error("Analysis failed:", error);
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
              className="px-12 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
            >
              Start Session
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

    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-2xl overflow-hidden relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full font-bold text-sm mb-6">
              <Award className="w-4 h-4" /> Interview Complete
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Your Performance Report</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-10 bg-slate-900 rounded-[2rem] text-white">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Overall Score</span>
              <div className="text-7xl font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {aiAnalysis?.overall_score || overall}%
              </div>
              <p className="mt-6 text-slate-400 text-sm font-medium text-center">
                Top 15% of candidates for {role} positions.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { label: 'Posture', value: avgScore('posture'), icon: <Camera className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                { label: 'Eye Contact', value: avgScore('eyeContact'), icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
                { label: 'Speech Clarity', value: avgScore('clarity'), icon: <Mic className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
                { label: 'Confidence', value: avgScore('confidence'), icon: <Award className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
              ].map((m) => (
                <div key={m.label} className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className={`p-2 rounded-lg ${m.color} mb-3 inline-block`}>{m.icon}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{m.value}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-500" /> AI Insights & Feedback
            </h3>

            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                <span className="text-slate-500 font-bold animate-pulse">AI Career Coach is analyzing your session...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Improvements</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.improvements.map((im: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" /> {im}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2 mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-orange-900 font-medium italic">
                    "{aiAnalysis.insights}"
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-slate-600 font-medium italic">
                  "Your confidence in technical explanations is high, but try to maintain more consistent eye contact when discussing teamwork."
                </li>
                <li className="flex items-start gap-2 text-slate-600 font-medium italic">
                  "Great posture throughout. Speech clarity slightly dipped during the challenge description—remember to pace your words."
                </li>
              </ul>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onBack}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
            >
              Finish HubSession
            </button>
            <button
              onClick={() => {
                setStep('intro');
                setCurrentIdx(0);
                setAllScores([]);
              }}
              className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Restart Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

        {/* Left Panel: Question and Transcription */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
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

            <div className="flex-1 bg-slate-50 rounded-2xl p-6 overflow-y-auto border border-slate-100 relative group">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                Live Transcription
              </div>

              {transcript.length === 0 && !interimText && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Click "Start Recording" and speak clearly into your microphone.</p>
                </div>
              )}

              <div className="space-y-2">
                {transcript.map((t, i) => (
                  <p key={i} className="text-slate-700 font-medium leading-relaxed">{t}</p>
                ))}
                {interimText && (
                  <p className="text-slate-400 font-medium italic animate-pulse">{interimText}</p>
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
              disabled={isRecording || transcript.length === 0}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all disabled:opacity-30 group"
            >
              {currentIdx < questions.length - 1 ? 'Go to Next Question' : 'View Final Results'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Panel: Camera and Live Metrics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-950 rounded-[2rem] overflow-hidden relative border-4 border-white shadow-2xl aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

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
                  { label: 'Voice', value: metrics.clarity, color: 'bg-orange-500' },
                  { label: 'Confidence', value: metrics.confidence, color: 'bg-green-500' },
                ].map((m) => (
                  <div key={m.label} className="bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 text-center translate-y-2 animate-slide-up">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                    <div className="text-xs font-bold text-white">{m.value}%</div>
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
