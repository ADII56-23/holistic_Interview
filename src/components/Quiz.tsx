import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, RotateCcw, ArrowLeft, Loader2, XCircle, Info, BookOpen } from 'lucide-react';
import StudyGuide from './StudyGuide';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizProps {
  onBack: () => void;
}

type Step = 'selection' | 'subtopic' | 'level' | 'loading' | 'quiz' | 'result' | 'study';

const Quiz: React.FC<QuizProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('selection');
  const [language, setLanguage] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAI, setIsAI] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const languages = [
    { name: 'React', icon: '⚛️' },
    { name: 'JavaScript', icon: 'JS' },
    { name: 'TypeScript', icon: 'TS' },
    { name: 'Python', icon: '🐍' },
    { name: 'DSA', icon: '🌳' },
    { name: 'System Design', icon: '🏗️' },
    { name: 'Behavioral', icon: '🤝' },
    { name: 'HR Round', icon: '💼' }
  ];

  const [subTopics, setSubTopics] = useState<Record<string, string[]>>({
    'React': ['Hooks', 'Components', 'Context API', 'Performance', 'Testing'],
    'JavaScript': ['ES6+', 'Async/Await', 'DOM Manipulation', 'Closures', 'Classes'],
    'TypeScript': ['Interfaces', 'Generics', 'Enums', 'Type Guards', 'Config'],
    'Python': ['Decorators', 'List Comprehensions', 'Multithreading', 'Dictionaries', 'Classes'],
    'DSA': ['Arrays & Hashing', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Sorting'],
    'System Design': ['Load Balancing', 'Caching', 'Database Sharding', 'Microservices', 'API Design'],
    'Behavioral': ['Conflict Resolution', 'Leadership', 'Teamwork', 'Problem Solving', 'Adaptability'],
    'HR Round': ['Salary Negotiation', 'Career Goals', 'Why Us?', 'Strengths/Weaknesses', 'Company Culture']
  });

  const levels = [
    { id: 'Beginner', description: 'Basic concepts and syntax' },
    { id: 'Intermediate', description: 'Functional programming and best practices' },
    { id: 'Advanced', description: 'Deep dives and optimization' }
  ];

  const [subTopicLoading, setSubTopicLoading] = useState(false);

  const handleLanguageSelect = async (selectedLang: string) => {
    setLanguage(selectedLang);
    setStep('subtopic');
    setSubTopicLoading(true);
    setSelectedTopics([]); // Reset topics when language changes

    try {
      const response = await fetch(`http://localhost:8000/api/v1/questions/subtopics?language=${encodeURIComponent(selectedLang)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.topics && data.topics.length > 0) {
        setSubTopics((prev: Record<string, string[]>) => ({
          ...prev,
          [selectedLang]: data.topics
        }));
      }
    } catch (error) {
      console.error('Failed to fetch AI subtopics, using fallback:', error);
      // Fallback to default subtopics is already in state
    } finally {
      setSubTopicLoading(false);
    }
  };

  const toggleTopic = (selectedTopic: string) => {
    setSelectedTopics(prev =>
      prev.includes(selectedTopic)
        ? prev.filter(t => t !== selectedTopic)
        : [...prev, selectedTopic]
    );
  };

  const handleTopicsContinue = () => {
    if (selectedTopics.length > 0) {
      setStep('level');
    }
  };

  const startQuiz = async () => {
    setStep('loading');
    const topicsString = selectedTopics.join(', ');
    const fullTopic = `${language}: ${topicsString}`;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/questions/generate-quiz?topic=${encodeURIComponent(fullTopic)}&difficulty=${difficulty}`, {
        method: 'POST'
      });
      const data = await response.json();

      // Use the 'questions' array from the new API structure
      const parsedQuiz = data.questions || [];
      if (parsedQuiz.length === 0) throw new Error('No questions returned');

      setQuestions(parsedQuiz);
      // If the first question contains "Pre-assessment" or is from our fallback list, it's not AI
      const firstQ = parsedQuiz[0].question.toLowerCase();
      setIsAI(!firstQ.includes("sample question") && !firstQ.includes("pre-assessment"));

      setStep('quiz');
    } catch (error) {
      console.error('Quiz generation failed:', error);
      setIsAI(false);
      // Fallback to mock data if API fails
      const mockQuestions = [
        { id: 1, question: `Basic ${topicsString} concept: What is the primary use of ${selectedTopics[0]}?`, options: ["Development", "Design", "Testing", "Deployment"], correctAnswer: "Development" },
        { id: 2, question: `Industry standard: Which of these is a best practice in ${language}?`, options: ["Documentation", "No Testing", "Hardcoding", "Ignoring Errors"], correctAnswer: "Documentation" }
      ];
      setQuestions(mockQuestions);
      setStep('quiz');
    }
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === questions[currentQuestionIdx].correctAnswer;
    if (isCorrect) setScore(score + 1);

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setStep('result');
    }
  };

  const resetQuiz = () => {
    setStep('selection');
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
    setScore(0);
  };

  if (step === 'selection') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Step 1: Choose Language</h1>
          <p className="text-slate-500 font-medium">Select a language to generate your custom AI quiz.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {languages.map((l) => (
            <button
              key={l.name}
              onClick={() => handleLanguageSelect(l.name)}
              className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group text-center space-y-4 elevation-sm"
            >
              <div className="text-4xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-300">{l.icon}</div>
              <div className="font-bold text-slate-900">{l.name}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Feature
          </button>
        </div>
      </div>
    );
  }

  if (step === 'subtopic') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 border border-blue-100">
            {language}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Step 2: Choose Topics</h1>
          <p className="text-slate-500 font-medium">Select one or multiple areas of {language} to focus on.</p>
        </div>

        {subTopicLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse text-lg">AI is exploring {language} topics...</p>
          </div>
        ) : (
          <>
            <div
              onClick={() => setStep('study')}
              className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg">AI Study Guide for {language}</h3>
                  <p className="text-blue-100 text-sm font-medium">Review concepts and examples before your quiz.</p>
                </div>
              </div>
              <div className="bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-xs group-hover:bg-blue-50 transition-colors uppercase tracking-widest">
                Start Learning
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {subTopics[language]?.map((t) => {
                const isSelected = selectedTopics.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTopic(t)}
                    className={`p-6 border rounded-2xl transition-all text-left font-bold flex justify-between items-center group
                      ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white border-slate-100 text-slate-700 hover:border-blue-500 hover:text-blue-600'}`}
                  >
                    {t}
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-6 mb-12">
              <button
                onClick={handleTopicsContinue}
                disabled={selectedTopics.length === 0}
                className={`px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-xl flex items-center gap-3
                  ${selectedTopics.length > 0
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                Continue to Difficulty <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        <div className="flex justify-center">
          <button onClick={() => setStep('selection')} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Change Language
          </button>
        </div>
      </div>
    );
  }

  if (step === 'level') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-100 text-xs font-bold mb-4 border border-blue-100">
            <span className="text-blue-600">{language}</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600">{selectedTopics.join(', ')}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Step 3: Difficulty Level</h1>
          <p className="text-slate-500 font-medium">Choose a level that matches your current skill set.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id as any)}
              className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group
                ${difficulty === level.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors
                ${difficulty === level.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}
              >
                <div className="text-xl font-bold">{level.id[0]}</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{level.id}</h3>
              <p className={`text-sm font-medium leading-relaxed ${difficulty === level.id ? 'text-slate-300' : 'text-slate-400'}`}>
                {level.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={startQuiz}
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            Start Quiz <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setStep('subtopic')} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Change Topic
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="flex justify-center mb-8">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Generating Questions...</h2>
        <p className="text-slate-500 font-medium italic">InterviewQuizAI is crafting 10 challenges for {language} ({difficulty})</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {selectedTopics.map(t => (
            <span key={t} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{t}</span>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        {!isAI && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 animate-slide-in">
            <Info className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-bold">
              Standard Mode: Using pre-recorded questions.
            </div>
          </div>
        )}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Question {currentQuestionIdx + 1} of {questions.length}</div>
              <div className="text-sm font-bold text-slate-900">{language} • {difficulty}</div>
            </div>
            <div className="text-xs font-bold text-slate-400">{Math.round(progress)}% Complete</div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/20 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 leading-tight">
            {q.question}
          </h2>

          <div className="grid gap-3">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="w-full p-6 text-left border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 hover:text-slate-900 flex justify-between items-center group"
              >
                <span>{option}</span>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/20 mb-12 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 
            ${score >= 7 ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
            {score >= 7 ? <CheckCircle2 className="w-12 h-12" /> : <Info className="w-12 h-12" />}
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Quiz Complete!</h1>
          <p className="text-xl text-slate-500 font-medium mb-12">You scored {score} out of {questions.length}</p>

          <div className="grid grid-cols-3 gap-8 mb-12 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div>
              <div className="text-4xl font-black text-blue-600">{score}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Right</div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900">{questions.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-500">{Math.round((score / questions.length) * 100)}%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Try Another Topic
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
            >
              Pratice more
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 mb-8 px-4 flex items-center gap-3">
            Detailed Review <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{language} • {difficulty}</span>
          </h3>
          {questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctAnswer;
            return (
              <div key={q.id} className={`p-8 rounded-[2.5rem] border transition-all elevation-sm ${isCorrect ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center 
                    ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{q.question}</h4>
                </div>

                <div className="grid gap-3 ml-10">
                  {q.options.map((opt, oIdx) => {
                    const isUserChoice = opt === userAnswers[idx];
                    const isCorrectChoice = opt === q.correctAnswer;

                    let bgClass = 'bg-slate-50 border-transparent text-slate-600';
                    if (isCorrectChoice) bgClass = 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100';
                    if (isUserChoice && !isCorrect) bgClass = 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100';

                    return (
                      <div key={oIdx} className={`p-4 rounded-xl border text-sm font-bold flex items-center justify-between ${bgClass}`}>
                        <span>{opt}</span>
                        {isCorrectChoice && <span className="text-[10px] uppercase tracking-tighter bg-green-200/50 px-2 py-0.5 rounded-full">Correct Answer</span>}
                        {isUserChoice && !isCorrect && <span className="text-[10px] uppercase tracking-tighter bg-red-200/50 px-2 py-0.5 rounded-full">Your Choice</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === 'study') {
    return <StudyGuide language={language} onBack={() => setStep('subtopic')} />;
  }

  return null;
};

export default Quiz;
