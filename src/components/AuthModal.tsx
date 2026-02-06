import React, { useState } from 'react';
import { X, Eye, EyeOff, Github, Chrome, Gitlab } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h2>
          <p className="text-slate-500 text-sm">Welcome! Please fill in the details to get started.</p>
        </div>

        {/* Social Login */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 flex items-center justify-center h-12 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Github className="w-5 h-5 text-slate-900" />
          </button>
          <button className="flex-1 flex items-center justify-center h-12 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Chrome className="w-5 h-5 text-slate-900" />
          </button>
          <button className="flex-1 flex items-center justify-center h-12 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Gitlab className="w-5 h-5 text-orange-600" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-8">
          <div className="relative flex items-center pt-0.5">
            <input
              type="checkbox"
              id="terms"
              className="peer h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
            />
          </div>
          <label htmlFor="terms" className="text-xs text-slate-500 leading-snug cursor-pointer select-none">
            I agree to the <a href="#" className="text-indigo-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 font-bold hover:underline">Privacy Policy</a>
          </label>
        </div>

        <button
          onClick={onContinue}
          className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all mb-6"
        >
          Continue
        </button>

        <p className="text-center text-sm font-medium text-slate-500">
          Already have an account? <button className="text-indigo-600 font-bold hover:underline">Sign in</button>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;
