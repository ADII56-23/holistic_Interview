import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Code2, Sparkles, MessageSquare, Share2, Printer } from 'lucide-react';

interface Topic {
  title: string;
  content: string;
  example: string;
}

interface TutorialData {
  title: string;
  introduction: string;
  topics: Topic[];
}

interface StudyGuideProps {
  language: string;
  onBack: () => void;
}

const StudyGuide: React.FC<StudyGuideProps> = ({ language, onBack }) => {
  const [data, setData] = useState<TutorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);

  useEffect(() => {
    const fetchTutorial = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/v1/questions/tutorial?language=${encodeURIComponent(language)}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch tutorial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mt-8 mb-2">Curating Study Materials</h2>
        <p className="text-slate-500 font-medium max-w-md">Our AI is fetching the best concepts, examples, and best practices for {language}...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row animate-fade-in relative">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-900 truncate">{data.title}</h1>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto sticky top-0 hidden lg:block scrollbar-hide">
        <div className="p-8 border-b border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Subjects
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Tutorial Guide</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">{language} Basics</h2>
        </div>

        <div className="p-4 space-y-1">
          {data.topics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTopicIdx(idx)}
              className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group
                                ${activeTopicIdx === idx
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span className="font-bold text-sm line-clamp-1">{idx + 1}. {topic.title}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTopicIdx === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
            </button>
          ))}
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 sticky bottom-0 bg-white">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer">
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
            <h4 className="font-black mb-2 relative z-10">Ready for Quiz?</h4>
            <p className="text-[10px] text-slate-400 font-medium mb-4 relative z-10 leading-relaxed">Test your understanding with AI questions.</p>
            <button
              onClick={onBack}
              className="w-full py-2 bg-white text-slate-900 rounded-full text-xs font-black hover:bg-blue-50 transition-colors relative z-10"
            >
              Take Quiz
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-12 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
              <span>Library</span>
              <ChevronRight className="w-3 h-3" />
              <span>{language}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">{data.topics[activeTopicIdx].title}</span>
            </nav>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight">
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-bold border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                AI Verified Content
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MessageSquare className="w-4 h-4" />
                Interactive
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-12">
              {data.introduction}
            </p>

            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/20 mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <BookOpen className="w-64 h-64" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black">
                    {activeTopicIdx + 1}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 m-0 leading-tight">
                    {data.topics[activeTopicIdx].title}
                  </h2>
                </div>

                <p className="text-xl text-slate-600 leading-relaxed mb-10">
                  {data.topics[activeTopicIdx].content}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                      <Code2 className="w-4 h-4" />
                      Live Example
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 font-mono text-sm leading-relaxed text-blue-100 shadow-2xl elevation-md">
                    <pre className="overflow-x-auto scrollbar-thin">
                      <code>{data.topics[activeTopicIdx].example}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 py-12 border-t border-slate-100">
            <button
              disabled={activeTopicIdx === 0}
              onClick={() => setActiveTopicIdx(activeTopicIdx - 1)}
              className={`flex flex-col gap-1 text-left transition-all ${activeTopicIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-x-2'}`}
            >
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Previous Topic</span>
              <span className="text-lg font-bold text-slate-900">
                {activeTopicIdx > 0 ? data.topics[activeTopicIdx - 1].title : 'Start'}
              </span>
            </button>

            <button
              disabled={activeTopicIdx === data.topics.length - 1}
              onClick={() => setActiveTopicIdx(activeTopicIdx + 1)}
              className={`flex flex-col gap-1 text-right transition-all ${activeTopicIdx === data.topics.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:translate-x-2'}`}
            >
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Topic</span>
              <span className="text-lg font-bold text-slate-900">
                {activeTopicIdx < data.topics.length - 1 ? data.topics[activeTopicIdx + 1].title : 'Finish'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyGuide;
