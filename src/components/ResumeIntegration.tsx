import React, { useState, useRef } from 'react';
import {
  Upload,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  Briefcase,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface ResumeIntegrationProps {
  onBack: () => void;
  selectedJD?: string;
  selectedRole?: string;
}

interface AnalysisResult {
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  improvements: string[];
  matched_jobs: string[];
  analysis_summary: string;
}

const ResumeIntegration: React.FC<ResumeIntegrationProps> = ({ onBack, selectedJD, selectedRole }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jd_text', selectedJD || "General Software Engineering Role");

      const response = await fetch('http://localhost:8000/api/v1/resumes/analyze-match', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      setTimeout(() => {
        setAnalysis(data);
        setIsUploading(false);
      }, 2000);

    } catch (error: any) {
      console.error("Match analysis failed:", error);
      setIsUploading(false);
      alert(`Analysis failed: ${error.message || "Unknown error"}. Check if the backend is running at http://localhost:8000`);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setFileName(null);
    setIsUploading(false);
  };

  if (analysis) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in font-sans text-slate-900">
        <div className="flex justify-between items-center mb-10">
          <button onClick={reset} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all">
            <ArrowLeft className="w-4 h-4" /> Upload Another
          </button>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-bold text-xs border border-emerald-100 uppercase tracking-widest">
            Analysis Complete
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                    <circle
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * analysis.match_score) / 100}
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{analysis.match_score}%</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Match</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">Resume vs. {selectedRole || 'JD'}</h2>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md">{analysis.analysis_summary}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matching Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matching_skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" /> Critical Gaps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <TrendingUp className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-400" /> Strategic Improvements
              </h3>
              <ul className="space-y-6">
                {analysis.improvements.map((tip, i) => (
                  <li key={i} className="flex gap-4 items-start group/item">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400 font-black text-sm group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">{i + 1}</div>
                    <p className="text-slate-300 font-medium leading-relaxed group-hover/item:text-white transition-colors">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
              <h3 className="text-emerald-900 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Similar Role Matches
              </h3>
              <div className="space-y-3">
                {analysis.matched_jobs.map(job => (
                  <div key={job} className="p-4 bg-white rounded-2xl flex items-center justify-between group border border-emerald-100/50 hover:border-emerald-300 transition-all">
                    <span className="font-bold text-slate-800 text-sm">{job}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck className="w-24 h-24 text-blue-600" /></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[2px] mb-4">Pro Insight</h3>
              <p className="text-slate-600 font-medium leading-relaxed italic text-sm">"Your resume is currently Optimized for ATS, but missing specific keywords for high-level cloud architecture. Adding these could increase your call-back rate by 40%."</p>
            </div>
            <button onClick={onBack} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95">Return to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in text-center font-sans">
      <div className="mb-12">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[4px] mb-4 block">Resume Checker</span>
        <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">Is your resume <span className="text-emerald-500">good enough?</span></h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">A free and fast AI resume checker doing 16 crucial checks to ensure your resume is ready to perform and get you interview callbacks.</p>
      </div>
      <div className={`relative max-w-2xl mx-auto bg-white rounded-[3rem] p-12 border-2 border-dashed transition-all duration-300 ${isUploading ? 'border-blue-500 bg-blue-50/10' : 'border-emerald-200 hover:border-emerald-400'}`}>
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf" />
        {isUploading ? (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Resume...</h3>
            <p className="text-slate-500 font-medium">Matching against {selectedRole || 'JD'}</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/5"><Upload className="w-10 h-10 text-emerald-500" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {fileName ? fileName : 'Drop your resume here or choose a file.'}
            </h3>
            <p className="text-slate-400 font-medium text-sm mb-6">PDF only. Max 2MB file size.</p>

            <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100/50 flex items-start gap-3 text-left max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                <strong>Tip:</strong> Ensure your PDF is text-based (you can select text in it). Scanned images of resumes cannot be read by the AI.
              </p>
            </div>

            {!selectedRole && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3 text-left max-w-md mx-auto">
                <Target className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-orange-700 font-bold">
                  Please select a role in 'Role Specific' first for the best match!
                </p>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              Upload Your Resume
            </button>
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400"><ShieldCheck className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Privacy guaranteed</span></div>
          </>
        )}
      </div>
      <button onClick={onBack} className="mt-12 flex items-center gap-2 mx-auto text-slate-400 hover:text-slate-900 font-bold transition-all"><ArrowLeft className="w-4 h-4" /> Cancel Analysis</button>
    </div>
  );
};

export default ResumeIntegration;
