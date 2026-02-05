import React from 'react';
import { Brain, ArrowLeft, ChevronRight } from 'lucide-react';

interface PreparationHubProps {
  onSelectFeature: (feature: 'quiz' | 'interview') => void;
  onBack: () => void;
}

const PreparationHub: React.FC<PreparationHubProps> = ({ onSelectFeature, onBack }) => {
  const features = [
    {
      id: 'quiz',
      title: 'Topic Quiz',
      description: 'Test your knowledge on specific topics with dynamic AI-generated quizzes.',
      icon: <Brain className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50',
      borderColor: 'hover:border-green-500',
      shadowColor: 'hover:shadow-green-500/10'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Preparation Hub</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Choose a practice mode to sharpen your skills and get ready for your next big opportunity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onSelectFeature(feature.id as 'quiz' | 'interview')}
            className={`flex flex-col items-start p-8 bg-white border border-slate-100 rounded-[2.5rem] transition-all duration-300 text-left group elevation-sm ${feature.borderColor} ${feature.shadowColor} hover:shadow-2xl`}
          >
            <div className={`p-4 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-6">
              {feature.description}
            </p>

            <div className="flex items-center gap-2 text-slate-900 font-bold group-hover:gap-3 transition-all">
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors py-2 px-4 rounded-full hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default PreparationHub;
