import React from 'react';
import { CloudUpload, Search, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="animate-fade-in relative z-10 bg-white text-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:flex lg:items-center lg:gap-16">
        <div className="lg:w-1/2 space-y-8">
          <p className="text-blue-400 font-bold tracking-tight text-lg">#AI Career Tool </p>
          <h1 className="text-5xl md:text-[60px] font-bold leading-[1.1] text-slate-900">
            An AI Interview that automates entire job hunt.
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            FirstInterview automates your entire job hunt with AI from job matching to interview prep.
          </p>
          <div className="space-y-4">
            <button
              onClick={onStart}
              className="px-10 py-4 bg-slate-950 text-white rounded-[2rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Land more interviews for free
            </button>
            <p className="text-blue-500 font-medium text-sm">
              <a href="#" className="hover:underline">Love it? Share with your friends</a>
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          <div className="relative flex items-center justify-center">
            <img
              src="/hero-illustration.png"
              alt="Interview Candidates Illustration"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Logo Strip */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 border-t border-slate-100 pt-10">
          <p className="text-sm font-medium text-slate-400 whitespace-nowrap">Users landed roles at</p>
          <div className="flex flex-wrap gap-8 items-center opacity-60 grayscale">
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068cd4eb7cfa9918e11c_21.avif" loading="lazy" alt="AriseHealth logo" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068b4638397708f6c5a0_20.avif" loading="lazy" alt="2020INC logo" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068c54d454dde3645a61_16.avif" loading="lazy" alt="The Paak logo" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068cd06a7d714fa435ef_19.avif" loading="lazy" alt="Ephicient logo" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068c6660edcb3f6dc1bb_10.avif" loading="lazy" alt="Ephicient logo" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068c6dd97695b9d4e4ed_11.avif" loading="lazy" alt="Ghost illustration" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068bffe98b5b3e0667eb_6.avif" loading="lazy" alt="Capybara illustration" className="h-8 w-auto" />
            <img src="https://cdn.prod.website-files.com/67065b18171e78a558433e90/6712068c992d152ad6435da8_5.avif" loading="lazy" alt="Ephicient logo" className="h-8 w-auto" />
          </div>
        </div>

        {/* How it works Section */}
        <div className="bg-slate-50/50 py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-blue-500 font-bold tracking-wide text-sm mb-4">How it works?</p>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-20 tracking-tight">
              Perfect applications in one click.
            </h2>

            <div className="grid md:grid-cols-3 gap-12 mb-20">
              <div className="space-y-6 flex flex-col items-center">
                <div className="w-12 h-12 text-slate-900">
                  <CloudUpload className="w-full h-full stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Step 1:<br />Create a profile</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                    Create your profile by uploading an existing resume or create one from scratch using our resume builder.
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex flex-col items-center">
                <div className="w-12 h-12 text-slate-900">
                  <Search className="w-full h-full stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Step 2:<br />Find a job post</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                    Start searching for jobs anywhere you want and paste the job description in the box in FirstResume.
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex flex-col items-center">
                <div className="w-12 h-12 text-slate-900">
                  <Sparkles className="w-full h-full stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Step 3:<br />One click .. and done</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                    One click, and we will track your job with AI, analyse your compatibility, create your perfect resume and more, ready to apply.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="px-10 py-4 bg-slate-950 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              That's it! Give it a go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
