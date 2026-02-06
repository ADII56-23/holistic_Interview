import React, { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import axios from 'axios';
import {
  Phone,
  PhoneOff,
  Mic,
  User,
  AlarmClock,
  CheckCircle
} from 'lucide-react';

const webClient = new RetellWebClient();

interface PhoneInterviewProps {
  onBack?: () => void;
  role?: string;
}

const PhoneInterview: React.FC<PhoneInterviewProps> = ({ role = "Software Engineer" }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastInterviewerResponse, setLastInterviewerResponse] = useState("Hello! I'm your AI interviewer today. Please start the call when you're ready.");
  const [lastUserResponse, setLastUserResponse] = useState('');
  const [activeTurn, setActiveTurn] = useState<'agent' | 'user' | ''>('');
  const [timer, setTimer] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    webClient.on('call_started', () => {
      console.log('Call started');
      setIsCalling(true);
      setIsStarted(true);
      startTimer();
    });

    webClient.on('call_ended', () => {
      console.log('Call ended');
      setIsCalling(false);
      setIsEnded(true);
      stopTimer();
    });

    webClient.on('agent_start_talking', () => {
      setActiveTurn('agent');
    });

    webClient.on('agent_stop_talking', () => {
      setActiveTurn('user');
    });

    webClient.on('update', (update: any) => {
      if (update.transcript) {
        const agentTranscript = update.transcript.find((t: any) => t.role === 'agent');
        const userTranscript = update.transcript.find((t: any) => t.role === 'user');

        if (agentTranscript) setLastInterviewerResponse(agentTranscript.content);
        if (userTranscript) setLastUserResponse(userTranscript.content);
      }
    });

    webClient.on('error', (error) => {
      console.error('Retell error:', error);
      stopCall();
    });

    return () => {
      webClient.removeAllListeners();
      stopTimer();
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000) as unknown as number;
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    if (!name || !email) {
      alert('Please enter your name and email to start.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/voice/register-call', {
        interviewer_id: 'default',
        dynamic_data: {
          role: role,
          name: name,
          email: email
        }
      });

      const { access_token } = response.data.registerCallResponse;

      if (access_token === 'demo_access_token') {
        // Handle demo mode
        setIsCalling(true);
        setIsStarted(true);
        setLastInterviewerResponse("Demo Mode: This is how it would sound if a Retell Agent ID was configured. You can simulate the end of the call.");
        setTimeout(() => setIsCalling(false), 5000);
      } else {
        await webClient.startCall({ accessToken: access_token });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start call. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const stopCall = () => {
    webClient.stopCall();
    setIsCalling(false);
    setIsEnded(true);
    stopTimer();
  };

  if (isEnded) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Interview Completed</h2>
          <p className="text-slate-500 font-medium mb-10">
            Thank you for participating in the phone interview. Your responses have been recorded and will be analyzed by our team.
          </p>
          <button
            onClick={() => window.close()}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden elevation-sm">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Phone Interview</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</p>
            </div>
          </div>
          {isStarted && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <AlarmClock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-black text-slate-700 tabular-nums">{formatTime(timer)}</span>
            </div>
          )}
        </div>

        {!isStarted ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to begin?</h2>
              <p className="text-slate-500 font-medium mb-10">
                Please enter your details to start the AI-powered voice interview. Make sure you are in a quiet environment.
              </p>

              <div className="space-y-4 mb-10">
                <div className="text-left">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <button
                onClick={startCall}
                disabled={loading}
                className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <span className="animate-pulse">Connecting...</span>
                ) : (
                  <>
                    <Phone className="w-5 h-5 fill-current" />
                    Start Interview Call
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Interviewer Box */}
              <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${activeTurn === 'agent' ? 'border-orange-500 bg-orange-50/10 shadow-lg' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTurn === 'agent' ? 'bg-orange-500 text-white scale-110' : 'bg-slate-200 text-slate-400'}`}>
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">AI Interviewer</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTurn === 'agent' ? 'text-orange-500' : 'text-slate-400'}`}>
                      {activeTurn === 'agent' ? 'Speaking...' : 'Listening'}
                    </p>
                  </div>
                </div>
                <div className="min-h-[120px] bg-white rounded-2xl p-6 border border-slate-100 text-slate-700 font-medium leading-relaxed italic">
                  "{lastInterviewerResponse}"
                </div>
              </div>

              {/* User Box */}
              <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${activeTurn === 'user' ? 'border-blue-500 bg-blue-50/10 shadow-lg' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTurn === 'user' ? 'bg-blue-500 text-white scale-110' : 'bg-slate-200 text-slate-400'}`}>
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">You ({name})</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTurn === 'user' ? 'text-blue-500' : 'text-slate-400'}`}>
                      {activeTurn === 'user' ? 'Your Turn' : 'Waiting'}
                    </p>
                  </div>
                </div>
                <div className="min-h-[120px] bg-white rounded-2xl p-6 border border-slate-100 text-slate-500 font-medium leading-relaxed">
                  {lastUserResponse || "Speak into your microphone..."}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={stopCall}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-all hover:scale-110 active:scale-95">
                  <PhoneOff className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-black text-red-500 uppercase tracking-widest">End Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCalling ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
              {isCalling ? 'STREAMS ACTIVE' : 'SYSTEM STANDBY'}
            </div>
            <div className="w-px h-3 bg-slate-800"></div>
            <div>VERIFIED SECURE</div>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Powered by Retell AI
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Voice System Status</p>
        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-1 h-12 bg-slate-100 rounded-full overflow-hidden mb-2">
              {activeTurn === 'agent' && <div className="w-full bg-orange-500 animate-wave h-full"></div>}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-1 h-12 bg-slate-100 rounded-full overflow-hidden mb-2">
              {activeTurn === 'user' && <div className="w-full bg-blue-500 animate-wave h-full"></div>}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneInterview;
