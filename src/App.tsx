import { useState, useEffect } from 'react'
import {
  BookOpen,
  Video,
  FileText,
  Briefcase,
  Paperclip,
  Users,
  ChevronDown,
  Brain,
  Download,
  HelpCircle,
  Mail,
  Tag,
  Book,
  File,
  Edit3
} from 'lucide-react'
import InterviewRecorder from './components/InterviewRecorder'
import LandingPage from './components/LandingPage'
import Preparation from './components/Preparation'
import Quiz from './components/Quiz'
import PreparationHub from './components/PreparationHub'
import GeneralInterview from './components/GeneralInterview'
import CodingCopilot from './components/CodingCopilot'
import PhoneInterview from './components/PhoneInterview'
import Library from './components/Library'
import ResumeBuilder from './components/ResumeBuilder'
import RoleSelection from './components/RoleSelection'
import ResumeIntegration from './components/ResumeIntegration'
import HireVueInterview from './components/HireVueInterview'
import AuthModal from './components/AuthModal'

type View = 'landing' | 'preparation_hub' | 'preparation' | 'interview' | 'quiz' | 'general_interview' | 'hirevue_interview' | 'phone_interview' | 'library' | 'coding_copilot' | 'resume_builder' | 'role_selection' | 'resume_integration';

function App() {
  const [view, setView] = useState<View>('landing');
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [selectedJD, setSelectedJD] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for standalone view on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'phone') {
      setView('phone_interview');
    }
  }, []);

  const startInterview = () => {
    setShowAuthModal(true);
  };

  const handleAuthContinue = () => {
    setShowAuthModal(false);
    setView('preparation_hub');
  };

  const proceedToInterview = (type: string) => {
    if (type === 'quiz') {
      setView('quiz');
    } else if (type === 'general') {
      // For General Interview we use our new structured component
      setView('general_interview');
    } else if (type === 'hirevue') {
      setView('hirevue_interview');
    } else if (type === 'coding') {
      setView('coding_copilot');
    } else {
      // Default to standard recorder for others
      setView('interview');
    }
  };

  const handleHubSelection = (feature: string) => {
    if (feature === 'quiz') {
      setView('quiz');
    } else if (feature === 'coding') {
      setView('coding_copilot');
    } else if (feature === 'role_selection') {
      setView('role_selection');
    } else {
      setView('preparation');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinue={handleAuthContinue}
      />

      {view !== 'coding_copilot' && (
        <nav className="sticky top-4 z-50 px-6">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-900/5 h-20 flex items-center justify-between px-8">
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
                          <div className="text-xs text-slate-500">Coding and Quizs</div>
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

                      <button
                        onClick={() => setView('resume_builder')}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                      >
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover/item:bg-pink-100 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">AI Resume Builder</div>
                          <div className="text-xs text-slate-500">Create ATS-friendly resumes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setView('role_selection')}
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

                      <button
                        onClick={() => setView('resume_integration')}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                      >
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover/item:bg-green-100 transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Resume Integration</div>
                          <div className="text-xs text-slate-500">Sync and Analyze</div>
                        </div>
                      </button>

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
              <div className="relative group">
                <button onClick={() => setView('library')} className="hover:text-slate-900 transition-colors flex items-center gap-1 py-4">
                  Library <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <div className="absolute top-full -left-4 w-72 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-left z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden ring-1 ring-slate-900/5">
                    <div className="grid gap-1">
                      <button className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg group-hover/item:bg-yellow-100 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Notes</div>
                          <div className="text-xs text-slate-500">Your interview prep notes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setView('library')}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                          <Book className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Book Library</div>
                          <div className="text-xs text-slate-500">Search 1000+ career books</div>
                        </div>
                      </button>

                      <button className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item w-full text-left">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover/item:bg-slate-100 transition-colors">
                          <File className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Documents</div>
                          <div className="text-xs text-slate-500">Resumes, cover letters & more</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button className="hover:text-slate-900 transition-colors flex items-center gap-1 py-4">
                  Resources <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <div className="absolute top-full -left-4 w-72 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-left z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden ring-1 ring-slate-900/5">
                    <div className="grid gap-1">
                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Blog</div>
                          <div className="text-xs text-slate-500">Latest interview tips & news</div>
                        </div>
                      </a>

                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item font-medium">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover/item:bg-orange-100 transition-colors">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Ultimate Job Hunt Guide</div>
                          <div className="text-xs text-slate-500 italic text-blue-500">Free download</div>
                        </div>
                      </a>

                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover/item:bg-purple-100 transition-colors">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Career Glossary</div>
                          <div className="text-xs text-slate-500">Key industry terms explained</div>
                        </div>
                      </a>

                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover/item:bg-green-100 transition-colors">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Interview Question Bank</div>
                          <div className="text-xs text-slate-500">1000+ top company questions</div>
                        </div>
                      </a>

                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Contact Us</div>
                          <div className="text-xs text-slate-500">Get in touch with our team</div>
                        </div>
                      </a>

                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover/item:bg-pink-100 transition-colors">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">Discounts</div>
                          <div className="text-xs text-slate-500">Student & partner savings</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">About Us <ChevronDown className="w-3 h-3" /></a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={startInterview}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>
      )}

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
          <GeneralInterview
            onBack={() => setView('preparation')}
            role={interviewRole}
            jd={selectedJD}
          />
        )}

        {view === 'hirevue_interview' && (
          <HireVueInterview
            onBack={() => setView('preparation')}
            role={interviewRole}
          />
        )}

        {view === 'quiz' && (
          <Quiz onBack={() => setView('preparation_hub')} />
        )}

        {view === 'library' && (
          <Library />
        )}

        {view === 'coding_copilot' && (
          <CodingCopilot onBack={() => setView('preparation')} role={interviewRole} />
        )}

        {view === 'resume_builder' && (
          <ResumeBuilder onBack={() => setView('landing')} />
        )}

        {view === 'role_selection' && (
          <RoleSelection
            onBack={() => setView('preparation_hub')}
            onSelectRole={(role, jd) => {
              setInterviewRole(role);
              setSelectedJD(jd);
              setView('preparation');
            }}
          />
        )}

        {view === 'resume_integration' && (
          <ResumeIntegration
            onBack={() => setView('landing')}
            selectedRole={interviewRole}
            selectedJD={selectedJD}
          />
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

        {view === 'phone_interview' && (
          <div className="bg-slate-50 min-h-[calc(100vh-80px)]">
            <PhoneInterview role={interviewRole} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App


