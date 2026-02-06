import React from 'react';
import {
  CheckCircle2,
  TrendingUp,
  Mic2,
  UserSquare2,
  FileText,
  Zap,
  Target,
  BarChart3,
  Eye,
  Activity,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AnalysisResult {
  overall_score: number;
  verbal_score: number;
  non_verbal_score: number;
  content_score: number;
  breakdown: {
    speech: {
      pace_score: number;
      filler_rate: number;
      confidence_score: number;
      wpm: number;
      tone?: string;
    };
    body_language: {
      eye_contact: { score: number; percentage: number };
      posture: { score: number; status: string };
      facial_expressions?: { status: string };
    };
    content: {
      relevance_score: number;
      star_score: number;
      clarity_score: number;
    };
  };
  strengths: string[];
  improvements: Array<{
    area: string;
    current_score: number;
    how_to_improve: string;
  }>;
  overall_summary?: string;
}

interface InterviewFeedbackProps {
  result: AnalysisResult;
  onClose: () => void;
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ result, onClose }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interview Performance Report</h1>
            <p className="text-slate-500 font-medium italic">Your comprehensive analysis is ready.</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-black text-blue-600 mb-1">{result.overall_score}%</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Overall Rating</div>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Done
          </button>
        </div>
      </div>

      {/* Hero Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: <Mic2 className="w-6 h-6" />, label: 'Communication (Verbal)', score: result.verbal_score, color: 'blue' },
          { icon: <UserSquare2 className="w-6 h-6" />, label: 'Body Language (Non-Verbal)', score: result.non_verbal_score, color: 'purple' },
          { icon: <FileText className="w-6 h-6" />, label: 'Logic & Content', score: result.content_score, color: 'emerald' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                <div className="text-2xl font-black text-slate-900">{item.score}%</div>
              </div>
            </div>
            <TrendingUp className={`w-5 h-5 text-${item.color}-500/30 group-hover:text-${item.color}-500 transition-colors`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section (New) */}
          {result.overall_summary && (
            <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Performance Summary
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {result.overall_summary}
              </p>
            </div>
          )}

          {/* Verbal Analysis */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600 group-hover:scale-110 transition-transform">
              <Mic2 className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Speech & Confidence Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-600">Pace Score</span>
                    <span className="text-sm font-black text-blue-600">{result.breakdown.speech.pace_score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${result.breakdown.speech.pace_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-600">Confidence</span>
                    <span className="text-sm font-black text-emerald-600">{result.breakdown.speech.confidence_score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${result.breakdown.speech.confidence_score}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-600">Filler Rate</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{result.breakdown.speech.filler_rate}%</span>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center flex flex-col justify-center shadow-2xl elevation-md">
                <div className="text-4xl font-black mb-1">{result.breakdown.speech.wpm}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Words Per Minute</div>
                {result.breakdown.speech.tone && (
                  <div className="px-4 py-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Detected Tone</div>
                    <div className="text-sm font-bold">{result.breakdown.speech.tone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body Language & Content Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-purple-600 group-hover:scale-110 transition-transform">
                <Eye className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <Activity className="w-4 h-4 text-purple-600" />
                Visual Feedback
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Eye Contact</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{result.breakdown.body_language.eye_contact.percentage}%</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase tracking-tighter">Consistency</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${result.breakdown.body_language.eye_contact.score}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-xs font-bold text-slate-400 mb-1">Posture</div>
                    <div className="text-sm font-black text-slate-900 mb-1">{result.breakdown.body_language.posture.status}</div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900" style={{ width: `${result.breakdown.body_language.posture.score}%` }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-xs font-bold text-slate-400 mb-1">Expressions</div>
                    <div className="text-sm font-black text-slate-900">{result.breakdown.body_language.facial_expressions?.status || 'Active'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-600 group-hover:scale-110 transition-transform">
                <Target className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Logic Analysis
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Content Relevance', score: result.breakdown.content.relevance_score },
                  { label: 'STAR Methodology', score: result.breakdown.content.star_score },
                  { label: 'Clarity & Structure', score: result.breakdown.content.clarity_score }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-600">{item.label}</span>
                      <span className="font-black text-emerald-600">{item.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${item.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Recommendations & Action Items */}
        <div className="space-y-8">
          {/* Strengths */}
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
            <h3 className="text-lg font-black text-emerald-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
              <TrendingUp className="w-5 h-5" />
              Top Strengths
            </h3>
            <ul className="space-y-3">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl font-bold text-sm text-emerald-800 border border-emerald-100/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
              <Activity className="w-5 h-5 text-blue-600" />
              Areas to Improve
            </h3>
            <div className="space-y-6">
              {result.improvements.map((imp, i) => (
                <div key={i} className="group cursor-default">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-black text-slate-900">{imp.area}</div>
                    <div className="text-xs font-black text-slate-400">{imp.current_score}%</div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                    {imp.how_to_improve}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items List - Now optional or merged into improvements */}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-12">
        <p className="text-slate-400 font-bold mb-6 italic">Want to try again with these improvements?</p>
        <button
          onClick={onClose}
          className="group flex items-center gap-3 mx-auto px-12 py-5 bg-white border border-slate-200 rounded-3xl font-black text-slate-900 hover:border-blue-500 hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50"
        >
          Start Practice Session
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default InterviewFeedback;
