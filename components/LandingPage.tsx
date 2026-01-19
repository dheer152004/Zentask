
import React from 'react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight">ZenTask </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">Methodology</a>
            <button 
              onClick={onLaunchApp}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              Launch App
            </button>
          </div>
          <button onClick={onLaunchApp} className="md:hidden p-2 text-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            We will write something here
          </div> */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Find your flow. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Master your day.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The minimalist todo list that thinks. Daily tracking, strategic goal setting, and insights to help you build lasting discipline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <button 
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 text-lg"
            >
              Start Free Today
            </button>
            <a href="#features" className="w-full sm:w-auto px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg">
              Explore Features
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Product Mockup Preview */}
      <section className="px-4 pb-32">
        <div className="max-w-6xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden aspect-video relative group transition-all duration-700 hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/5 to-transparent pointer-events-none" />
          <div className="p-8 md:p-12 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-6 flex-1">
              <div className="col-span-2 space-y-4">
                <div className="h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-left-4 duration-1000" />
                <div className="h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 delay-150 animate-in slide-in-from-left-4 duration-1000" />
                <div className="h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 delay-300 animate-in slide-in-from-left-4 duration-1000" />
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white animate-in slide-in-from-right-4 duration-1000">
                  <span className="text-4xl font-black">84%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={onLaunchApp} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-2xl shadow-slate-200 flex items-center gap-2">
              Live Preview <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid (Methodology) */}
      <section id="features" className="py-32 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">Core Methodology</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Everything you need to stop procrastinating and start producing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
              title="Daily Tracking"
              description="Simple, intuitive task management scoped to exactly one day at a time to prevent overwhelm."
            />
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="Report Insights"
              description="Analyzes your patterns and check you patterns about your goals and habbits."
              highlight
            />
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              title="Strategic Goals"
              description="Connect your daily actions to long-term monthly and yearly objectives."
            />
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              title="Habit Duels"
              description="Commit to consistency with multiple concurrent challenges and visual progress heatmaps."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto flex flex-col gap-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Focus on the Input, <br />Trust the Result.</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                Most tools focus on "doing more." ZenTask focuses on "doing the right thing." We believe that discipline isn't about working hard once; it's about making small, consistent steps towards a defined vision.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200 dark:shadow-none">1</div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Define your strategic visions</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200 dark:shadow-none">2</div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Log daily actions religiously</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200 dark:shadow-none">3</div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Analyze your report and check the patterns</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-indigo-600 h-[400px] w-full rounded-[3rem] shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden flex items-center justify-center p-12 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="text-white text-center relative z-10">
                <p className="text-8xl font-black mb-4 tracking-tighter">ZEN</p>
                <p className="text-indigo-200 font-bold tracking-[0.3em] uppercase">State of Mind</p>
              </div>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-[60px]" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 bg-slate-900 dark:bg-black text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">Ready to reclaim your focus?</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">
            Join thousands of professionals who have found their productivity flow with ZenTask. No credit card required.
          </p>
          <button 
            onClick={onLaunchApp}
            className="px-12 py-6 bg-white text-slate-900 font-black rounded-3xl hover:bg-indigo-50 transition-all active:scale-95 text-xl"
          >
            Launch the App
          </button>
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/30 rounded-full blur-[100px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg" />
            <span className="font-black text-lg text-slate-900 dark:text-slate-100">ZenTask </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 ZenTask Productivity. Built for Focus.</p>
          <div className="flex gap-6">
            {/* <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a> */}
            {/* <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a> */}
            <a href="https://www.linkedin.com/in/dheer152004/" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
            <a href="https://www.github.com/dheer152004/ZenTask" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, highlight }) => (
  <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${highlight ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${highlight ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
      {icon}
    </div>
    <h3 className={`text-xl font-bold mb-3 ${highlight ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed ${highlight ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
      {description}
    </p>
  </div>
);
