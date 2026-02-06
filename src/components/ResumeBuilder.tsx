import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Edit3,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';

interface Education {
  institution: string;
  location: string;
  degree: string;
  expected_graduation: string;
}

interface Experience {
  company: string;
  location: string;
  role: string;
  duration: string;
  description: string[];
}

interface Leadership {
  organization: string;
  location: string;
  role: string;
  duration: string;
  description: string[];
}

interface SkillsInterests {
  computer: string;
  language: string;
  interests: string;
}

interface ResumeData {
  name: string;
  phone: string;
  email: string;
  education: Education[];
  experience: Experience[];
  leadership: Leadership[];
  skills: SkillsInterests;
}

type FormStep = 'welcome' | 'basic' | 'exp_level' | 'student' | 'edu_level' | 'edu_details' | 'exp_details' | 'skills' | 'loading' | 'preview';

interface ResumeBuilderProps {
  onBack: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onBack }) => {
  const [step, setStep] = useState<FormStep>('welcome');
  const [, setIsGenerating] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    exp_level: '',
    is_student: '',
    edu_level: '',
    education_info: '',
    experience_info: '',
    skills_info: ''
  });

  const [resumeResults, setResumeResults] = useState<ResumeData | null>(null);

  const handleGenerate = async () => {
    setStep('loading');
    setIsGenerating(true);

    // Combine raw info for the API
    const apiPayload = {
      basic_info: `Name: ${formData.name}, Email: ${formData.email}, Phone: ${formData.phone}`,
      education_info: `Level: ${formData.edu_level}, Details: ${formData.education_info}`,
      experience_info: `Level: ${formData.exp_level}, Details: ${formData.experience_info}`,
      skills_info: formData.skills_info
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/resumes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
      const data = await response.json();
      setResumeResults(data);
      setStep('preview');
    } catch (error) {
      console.error("Failed to generate resume:", error);
      setStep('skills'); // Go back to last step on error
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;

    const canvas = await html2canvas(resumeRef.current, {
      scale: 4, // Higher scale for extreme clarity
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${resumeResults?.name || 'Resume'}.pdf`);
  };

  const nextStep = (currentStep: FormStep) => {
    if (currentStep === 'welcome') setStep('basic');
    if (currentStep === 'basic') setStep('exp_level');
    if (currentStep === 'exp_level') setStep('student');
    if (currentStep === 'student') setStep('edu_level');
    if (currentStep === 'edu_level') setStep('edu_details');
    if (currentStep === 'edu_details') {
      if (formData.exp_level === 'No Experience') setStep('skills');
      else setStep('exp_details');
    }
    if (currentStep === 'exp_details') setStep('skills');
  };

  const prevStep = (currentStep: FormStep) => {
    if (currentStep === 'basic') setStep('welcome');
    if (currentStep === 'exp_level') setStep('basic');
    if (currentStep === 'student') setStep('exp_level');
    if (currentStep === 'edu_level') setStep('student');
    if (currentStep === 'edu_details') setStep('edu_level');
    if (currentStep === 'exp_details') setStep('edu_details');
    if (currentStep === 'skills') {
      if (formData.exp_level === 'No Experience') setStep('edu_details');
      else setStep('exp_details');
    }
  };

  // --- RENDERING VARIOUS STEPS ---

  if (step === 'welcome') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 text-white">
          <Sparkles className="w-10 h-10" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">AI Resume Builder</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12">
          We'll guide you through a few simple questions to build your professional, Harvard-standard resume in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => nextStep('welcome')}
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            Get Started <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold px-8">Maybe Later</button>
        </div>
      </div>
    );
  }

  if (step === 'basic') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
        <h2 className="text-4xl font-black text-slate-900 mb-2">What's your name?</h2>
        <p className="text-slate-500 mb-12 font-medium italic">Let's start with your contact details.</p>

        <div className="space-y-6">
          <div className="group">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-blue-500 transition-colors">Full Name</label>
            <input
              autoFocus
              className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-blue-500">Email Address</label>
              <input
                className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block group-focus-within:text-blue-500">Phone Number</label>
              <input
                className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between">
          <button onClick={() => prevStep('basic')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
          <button
            disabled={!formData.name || !formData.email}
            onClick={() => nextStep('basic')}
            className={`px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95
              ${formData.name && formData.email ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300'}`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'exp_level') {
    const levels = ['No Experience', 'Less Than 3 Years', '3-5 Years', '5-10 Years', '10+ Years'];
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">How long have you been working?</h2>
          <Info className="w-5 h-5 text-slate-300 hover:text-slate-900 cursor-help" />
        </div>
        <p className="text-slate-500 mb-12 font-medium">We'll find the best templates for your experience level.</p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {levels.map(l => (
            <button
              key={l}
              onClick={() => { setFormData({ ...formData, exp_level: l }); nextStep('exp_level'); }}
              className={`px-8 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:scale-105 active:scale-95
                 ${formData.exp_level === l
                  ? 'bg-blue-900 border-blue-900 text-white shadow-2xl shadow-blue-900/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => prevStep('exp_level')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
      </div>
    );
  }

  if (step === 'student') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-slide-up text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight">Are you a student?</h2>

        <div className="flex justify-center gap-6 mb-16">
          <button
            onClick={() => { setFormData({ ...formData, is_student: 'Yes' }); nextStep('student'); }}
            className={`w-48 py-6 rounded-2xl font-bold text-2xl border-2 transition-all hover:scale-105 active:scale-95
                    ${formData.is_student === 'Yes'
                ? 'bg-blue-900 border-blue-900 text-white shadow-2xl shadow-blue-900/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
          >
            Yes
          </button>
          <button
            onClick={() => { setFormData({ ...formData, is_student: 'No' }); nextStep('student'); }}
            className={`w-48 py-6 rounded-2xl font-bold text-2xl border-2 transition-all hover:scale-105 active:scale-95
                    ${formData.is_student === 'No'
                ? 'bg-blue-900 border-blue-900 text-white shadow-2xl shadow-blue-900/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
          >
            No
          </button>
        </div>

        <button onClick={() => prevStep('student')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
      </div>
    );
  }

  if (step === 'edu_level') {
    const eduLevels = ['Secondary School', 'Vocational Certificate or Diploma', 'Apprenticeship or Internship Training', 'Bachelor Degree', 'Masters Degree', 'PhD'];
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-slide-up text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">What education level are you currently pursuing?</h2>
        <p className="text-slate-500 mb-12 font-medium">Select the highest level so we can organize your resume correctly.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {eduLevels.map(l => (
            <button
              key={l}
              onClick={() => { setFormData({ ...formData, edu_level: l }); nextStep('edu_level'); }}
              className={`px-6 py-8 rounded-2xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-center
                   ${formData.edu_level === l
                  ? 'bg-blue-900 border-blue-900 text-white shadow-2xl shadow-blue-900/20'
                  : 'bg-white border-slate-100 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm shadow-slate-200/50'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => prevStep('edu_level')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
      </div>
    );
  }

  if (step === 'edu_details') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Academic Story</h2>
        <p className="text-slate-500 mb-12 font-medium italic">Describe your university, major, graduation year, etc.</p>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/20">
          <textarea
            autoFocus
            className="w-full h-48 bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
            placeholder="Mention your institution, location, degree title, and any notable achievements or GPA."
            value={formData.education_info}
            onChange={(e) => setFormData({ ...formData, education_info: e.target.value })}
          />
        </div>

        <div className="mt-12 flex justify-between">
          <button onClick={() => prevStep('edu_details')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
          <button
            onClick={() => nextStep('edu_details')}
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'exp_details') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Work Chronicles</h2>
        <p className="text-slate-500 mb-12 font-medium italic">Tell us about your previous roles and what you achieved.</p>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/20">
          <textarea
            autoFocus
            className="w-full h-48 bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
            placeholder="Paste your past job descriptions or just list where you worked and what you did. We'll professionalize it."
            value={formData.experience_info}
            onChange={(e) => setFormData({ ...formData, experience_info: e.target.value })}
          />
        </div>

        <div className="mt-12 flex justify-between">
          <button onClick={() => prevStep('exp_details')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
          <button
            onClick={() => nextStep('exp_details')}
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
          >
            Almost Done
          </button>
        </div>
      </div>
    );
  }

  if (step === 'skills') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Final Flourish</h2>
        <p className="text-slate-500 mb-12 font-medium italic">What are your superpowers? (Tools, Technologies, Interests)</p>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/20">
          <textarea
            autoFocus
            className="w-full h-48 bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
            placeholder="e.g. Python, React, Photoshop, Fluent in Spanish, Hiking, Chess."
            value={formData.skills_info}
            onChange={(e) => setFormData({ ...formData, skills_info: e.target.value })}
          />
        </div>

        <div className="mt-12 flex justify-between">
          <button onClick={() => prevStep('skills')} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
          <button
            onClick={handleGenerate}
            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            Generate Resume <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="relative mb-12">
          <div className="w-24 h-24 border-4 border-slate-50 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-10 h-10 animate-pulse" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Weaving Your Future...</h2>
        <p className="text-xl text-slate-500 font-medium max-w-md">Our AI is analyzing your answers, applying the Harvard-standard format, and crafting professional bullet points for you.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Actions Sidebar */}
        <aside className="w-full lg:w-72 space-y-4">
          <button
            onClick={() => setStep('basic')}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-500 transition-all group"
          >
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Edit3 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-700">Refine Details</span>
          </button>

          <button
            onClick={downloadPDF}
            className="w-full flex items-center gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all group"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Download PDF</span>
          </button>

          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 mt-8">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-3">
              <CheckCircle2 className="w-4 h-4" />
              ATS Optimization
            </div>
            <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">
              This template follows the traditional Harvard-standard format favored by high-end recruitment software and elite employers.
            </p>
            <button onClick={onBack} className="mt-6 text-[10px] font-black text-emerald-600 flex items-center gap-1 hover:underline uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Back to Features
            </button>
          </div>
        </aside>

        {/* --- EXACT REPLICA OF REQUESTED IMAGE FORMAT --- */}
        <div className="flex-1 bg-white p-4 sm:p-8 md:p-12 lg:p-14 shadow-2xl rounded-none ring-1 ring-slate-200 overflow-x-auto min-h-[11in] flex justify-center">
          <div ref={resumeRef} className="bg-white w-full max-w-[8.5in] p-[1in] text-[#000] font-serif leading-[1.2] text-[11px] select-text">

            {/* NAME HEADER - LARGE BOLD CAPS */}
            <div className="text-center mb-6">
              <h1 className="text-[26px] font-bold tracking-[1px] mb-1 uppercase" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {resumeResults?.name || 'NAME'}
              </h1>
              <div className="text-[12px] flex justify-center items-center gap-2">
                <span>{resumeResults?.phone || 'Phone number'}</span>
                <span className="text-slate-300">|</span>
                <span>{resumeResults?.email || 'Email Address'}</span>
              </div>
            </div>

            {/* EDUCATION SECTION */}
            <section className="mb-5">
              <h3 className="font-bold uppercase tracking-widest border-b border-[#000] mb-2 text-[12px] pb-[1px]">Education</h3>
              {resumeResults?.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between font-bold">
                    <span>{edu.institution}, <span className="font-normal">{edu.location}</span></span>
                    <span className="font-normal">Expected {edu.expected_graduation}</span>
                  </div>
                  <div className="italic text-[11px] leading-tight">{edu.degree}</div>
                </div>
              ))}
            </section>

            {/* WORK EXPERIENCE SECTION */}
            <section className="mb-5">
              <h3 className="font-bold uppercase tracking-widest border-b border-[#000] mb-2 text-[12px] pb-[1px]">Work Experience</h3>
              {resumeResults?.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between font-bold items-baseline">
                    <span>{exp.company}, <span className="font-normal">{exp.location}</span>, <span className="italic font-normal">{exp.role}</span></span>
                    <span className="font-normal">{exp.duration}</span>
                  </div>
                  <ul className="list-disc ml-5 mt-1 space-y-[2px]">
                    {exp.description.map((bullet, j) => (
                      <li key={j} className="text-justify leading-tight">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {/* LEADERSHIP SECTION */}
            {resumeResults?.leadership && resumeResults.leadership.length > 0 && (
              <section className="mb-5">
                <h3 className="font-bold uppercase tracking-widest border-b border-[#000] mb-2 text-[12px] pb-[1px]">Leadership</h3>
                {resumeResults.leadership.map((led, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between font-bold items-baseline">
                      <span>{led.organization}, <span className="font-normal">{led.location}</span>, <span className="italic font-normal">{led.role}</span></span>
                      <span className="font-normal">{led.duration}</span>
                    </div>
                    <ul className="list-disc ml-5 mt-1 space-y-[2px]">
                      {led.description.map((bullet, j) => (
                        <li key={j} className="text-justify leading-tight">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* SKILLS & INTERESTS SECTION */}
            <section className="mb-5">
              <h3 className="font-bold uppercase tracking-widest border-b border-[#000] mb-2 text-[12px] pb-[1px]">Skills & Interests</h3>
              <div className="space-y-[3px]">
                <div className="flex gap-1 items-baseline">
                  <span className="italic font-bold">Computer:</span>
                  <span className="leading-tight">{resumeResults?.skills.computer}</span>
                </div>
                <div className="flex gap-1 items-baseline">
                  <span className="italic font-bold">Language:</span>
                  <span className="leading-tight">{resumeResults?.skills.language}</span>
                </div>
                <div className="flex gap-1 items-baseline">
                  <span className="italic font-bold">Interests:</span>
                  <span className="leading-tight">{resumeResults?.skills.interests}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
