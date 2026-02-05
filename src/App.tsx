import { useState } from 'react'
import {
  BookOpen,
  Video,
  FileText,
  Briefcase,
  Paperclip,
  Users,
  ChevronDown,
  Brain
} from 'lucide-react'
import InterviewRecorder from './components/InterviewRecorder'
import LandingPage from './components/LandingPage'
import Preparation from './components/Preparation'
import Quiz from './components/Quiz'
import PreparationHub from './components/PreparationHub'
import GeneralInterview from './components/GeneralInterview'

type View = 'landing' | 'preparation_hub' | 'preparation' | 'interview' | 'quiz' | 'general_interview';

function App() {
  const [view, setView] = useState<View>('landing');
  const [interviewRole, setInterviewRole] = useState('Software Engineer');

  const startInterview = () => {
    setView('preparation_hub');
  };

  const proceedToInterview = (type: string) => {
    if (type === 'quiz') {
      setView('quiz');
    } else if (type === 'general') {
      // For General Interview we use our new structured component
      setView('general_interview');
    } else {
      // Default to standard recorder for others
      setView('interview');
    }
  };

  const handleHubSelection = (feature: 'quiz' | 'interview') => {
    if (feature === 'quiz') {
      setView('quiz');
    } else {
      setView('preparation');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-serif">1</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FirstInterview</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => setView('landing')} className="hover:text-slate-900 transition-colors">Home</button>
            <div className="relative group">
              <button onClick={() => setView('preparation_hub')} className="hover:text-slate-900 transition-colors flex items-center gap-1 py-4">
                Features <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <div className="absolute top-full -left-4 w-72 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-left z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden ring-1 ring-slate-900/5">
                  <div className="grid gap-1">
                    <button
                      onClick={() => setView('preparation_hub')}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Preparation</div>
                        <div className="text-xs text-slate-500">Study materials & guides</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setView('preparation')}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                    >
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover/item:bg-purple-100 transition-colors">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Mock Interview</div>
                        <div className="text-xs text-slate-500">Practice with AI</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setView('quiz')}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                    >
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover/item:bg-green-100 transition-colors">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Topic Quiz</div>
                        <div className="text-xs text-slate-500">Assess your knowledge</div>
                      </div>
                    </button>

                    <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                      <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover/item:bg-pink-100 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">AI Resume Builder</div>
                        <div className="text-xs text-slate-500">Create ATS-friendly resumes</div>
                      </div>
                    </a>

                    <button
                      onClick={() => setView('preparation')}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                    >
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover/item:bg-orange-100 transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Role Specific</div>
                        <div className="text-xs text-slate-500">Targeted simulations</div>
                      </div>
                    </button>

                    <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover/item:bg-green-100 transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Resume Integration</div>
                        <div className="text-xs text-slate-500">Sync your profile</div>
                      </div>
                    </a>

                    <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Collaboration Mode</div>
                        <div className="text-xs text-slate-500">Practice with peers</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">Resources <ChevronDown className="w-3 h-3" /></a>
            <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">About Us <ChevronDown className="w-3 h-3" /></a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('preparation_hub')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        {view === 'landing' && (
          <LandingPage onStart={startInterview} />
        )}

        {view === 'preparation_hub' && (
          <PreparationHub onBack={() => setView('landing')} onSelectFeature={handleHubSelection} />
        )}

        {view === 'preparation' && (
          <Preparation onBack={() => setView('preparation_hub')} onStartInterview={proceedToInterview} onRoleChange={setInterviewRole} />
        )}

        {view === 'general_interview' && (
          <GeneralInterview onBack={() => setView('preparation')} role={interviewRole} />
        )}

        {view === 'quiz' && (
          <Quiz onBack={() => setView('preparation_hub')} />
        )}

        {view === 'interview' && (
          <div className="animate-fade-in pt-10 px-4">
            <div className="max-w-4xl mx-auto mb-10 text-center">
              <button
                onClick={() => setView('preparation_hub')}
                className="text-sm text-slate-400 hover:text-slate-600 mb-4 transition-colors"
              >
                ← Back to Selection
              </button>
              <h2 className="text-3xl font-bold">Interview Room</h2>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                SESSION ACTIVE
              </div>
            </div>
            <InterviewRecorder />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
