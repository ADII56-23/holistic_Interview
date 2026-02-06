import React, { useState } from 'react';
import { Monitor, MessageSquare, Phone, ChevronDown } from 'lucide-react';

interface PreparationProps {
  onBack: () => void;
  onStartInterview: (type: string) => void;
  onRoleChange?: (role: string) => void;
}

const Preparation: React.FC<PreparationProps> = ({ onBack, onStartInterview, onRoleChange }) => {
  const [selectedType, setSelectedType] = useState('general');
  const [role, setRole] = useState('Software Engineer');

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  const interviewTypes = [
    {
      id: 'general',
      title: 'General Interview',
      description: 'A reliable choice that works well in nearly all scenarios.',
      tag: 'Best for most interviews',
      icon: <Monitor className="w-12 h-12" />,
      image: "https://illustrations.popsy.co/gray/remote-work.svg"
    },
    {
      id: 'hirevue',
      title: 'HireVue Interview',
      description: 'Explainable AI assessment of WPM, filler usage, pitch variance, and volume stability.',
      tag: 'Premium AI Inference',
      icon: <MessageSquare className="w-12 h-12" />,
      image: "https://illustrations.popsy.co/gray/web-design.svg"
    },
    {
      id: 'phone',
      title: 'Phone Interview',
      description: 'Listens to the call and delivers fast, relevant response suggestions on the fly.',
      tag: 'For Audio-only Interviews',
      icon: <Phone className="w-12 h-12" />,
      image: "https://illustrations.popsy.co/gray/communication.svg"
    }
  ];

  const handleStartInterview = () => {
    if (selectedType === 'phone') {
      window.open('/?view=phone', '_blank');
    } else {
      onStartInterview(selectedType);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      {/* Header with Role Selection */}
      <div className="flex flex-col items-center mb-12 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4 text-slate-600 font-medium text-lg">
          <span>My Role is</span>
          <div className="relative inline-block">
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-6 py-2 pr-12 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-sm"
            >
              <option>Software Engineer</option>
              <option>Product Manager</option>
              <option>Data Scientist</option>
              <option>UI/UX Designer</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interview Type Selection */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold text-slate-700">My Interview Type</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {interviewTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 relative group overflow-hidden ${selectedType === type.id
              ? 'border-orange-500 bg-orange-50/10 shadow-lg shadow-orange-500/5'
              : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
          >
            <div className="aspect-[4/3] mb-6 rounded-xl bg-slate-50 flex items-center justify-center p-4 border border-slate-100 overflow-hidden">
              <img src={type.image} alt={type.title} className="w-full h-full object-contain grayscale opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="text-center space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedType === type.id ? 'text-orange-500' : 'text-slate-400'
                }`}>
                {type.tag}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{type.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                {type.description}
              </p>
            </div>

            {selectedType === type.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleStartInterview}
          className="px-12 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center gap-3"
        >
          Start Interview {selectedType === 'coding' ? 'with Copilot' : ''}
        </button>

        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
        >
          ← Back to selection
        </button>
      </div>
    </div>
  );
};

export default Preparation;
