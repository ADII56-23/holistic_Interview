import React from 'react';
import { CloudUpload, Search, Sparkles, Twitter, Instagram } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="animate-fade-in relative z-10 bg-white text-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:flex lg:items-center lg:gap-12">
        <div className="lg:w-[45%] space-y-8">
          <p className="text-blue-400 font-bold tracking-tight text-lg">#AI Career Tool </p>
          <h1 className="text-5xl md:text-[50px] font-bold leading-[1.1] text-slate-900">
            An AI Interview that automates entire job hunt.
          </h1>
          <p className="text-lg text-slate-550 font-medium leading-relaxed max-w-lg">
            FirstInterview automates your entire job hunt with AI from job matching to interview prep.
          </p>
          <div className="space-y-5">
            <button
              onClick={onStart}
              className="px-8 py-3 bg-slate-950 text-white rounded-[2rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-90"
            >
            Land more interviews for free
            </button>
            <p className="text-blue-500 font-medium text-sm">
              <a href="#" className="hover:underline">Love it? Share with your friends</a>
            </p>
          </div>
        </div>

        <div className="lg:w-[55%] mt-12 lg:mt-0 relative">
          <div className="relative flex items-center justify-end">
            <img
              src="/hero-illustration.png"
              alt="Interview Candidates Illustration"
              className="w-full max-w-[650px] h-auto object-contain transform lg:scale-110 lg:translate-x-4"
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
                  <h3 className="text-xl font-bold">Step 2:<br />Select a job role</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
                    Prepare interview questions and analysis in FirstInterview
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
                    One click, and we will track your Interview with AI, analyse your compatibility. create your perfect resume and more, ready to apply.
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

        {/* Testimonials Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <p className="text-blue-500 font-bold uppercase tracking-wider text-sm">What our users say</p>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                Loved by the community.
              </h2>
              <div className="flex justify-center mt-8">
                <img
                  src="/community-illustration.svg"
                  alt="Community Illustration"
                  className="h-48 w-auto grayscale"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Main Card */}
              <div className="lg:col-span-1 bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                <div className="space-y-6">
                  <p className="text-3xl font-bold text-slate-700 leading-[1.3]">
                    "We partner with <span className="text-slate-900">FirstInterview</span> because they are the most seamless CV polishing tool in the market empowered by AI"
                  </p>
                  <a href="#" className="inline-block text-blue-500 font-bold hover:underline">Read more</a>
                </div>
                <div className="mt-12 flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CUHK" alt="CUHK" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <span className="font-bold text-slate-900">CUHK MBA Programme</span>
                </div>
              </div>

              {/* Sarah's Card */}
              <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                  "Tried chatgpt for weeks and got zero interviews... FirstInterview got me 3 callbacks in the first month?? actually sounds like me and takes 2 mins. worth every $$"
                </p>
                <div className="mt-12 flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900">Sarah</h4>
                    <p className="text-sm text-slate-500">Product Manager @ Google</p>
                  </div>
                </div>
              </div>

              {/* Michael's Card */}
              <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                  "Been using FirstInterview for the past month and wow... applied to 40 jobs already and got 4 interviews! Usually I'd spend forever tweaking each resume but this does it so much better than I could."
                </p>
                <div className="mt-12 flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="Michael" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900">Michael</h4>
                    <p className="text-sm text-slate-500">Business Analyst @ PwC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Section */}
        <footer className="mt-12 pt-20 pb-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
              {/* Logo Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold font-serif">1</span>
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-slate-900">FirstInterview</span>
                </div>
              </div>

              {/* Product Column */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Product</h4>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li><a href="#" className="hover:text-slate-900 transition-colors">AI Resume</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">AI coding analyse</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">large library </a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">AI Interview Prep</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors"></a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">AI assistant</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Resources</h4>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li><a href="#" className="hover:text-slate-900 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Career Glossary</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Product Roadmap</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Feedback</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Terms & Conditions</a></li>
                  <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              {/* Follow Us Column */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Follow Us</h4>
                <div className="space-y-4">
                  <a href="#" className="block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Contact Us</a>
                  <div className="flex items-center gap-4">
                    <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/10">
                      <Twitter className="w-5 h-5 fill-current" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/10">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/10">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a13.14 13.14 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01a13.525 13.525 0 0 0 10.986 0a.074.074 0 0 1 .077.01c.124.098.249.196.372.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Made by FirstInterview with</span>
                <span className="text-red-500 animate-pulse text-sm">❤️</span>
              </div>
              <div className="hidden md:block w-px h-3 bg-slate-200"></div>
              <span>Copyright © 2026 FirstInterview</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
