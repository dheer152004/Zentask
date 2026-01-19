import React from 'react';
import { UserProfile } from '../types';

interface MobileNavProps {
  activeTab: 'daily' | 'habits' | 'monthly' | 'profile' | 'goals' | 'challenges';
  setActiveTab: (tab: 'daily' | 'habits' | 'monthly' | 'profile' | 'goals' | 'challenges') => void;
  userProfile: UserProfile;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, userProfile }) => {
  return (
    <>
      {/* Profile Section in Top Right - Hidden on Profile Page */}
      {activeTab !== 'profile' && (
        <div className="md:hidden absolute top-0 right-0 z-40 px-4 pt-4">
          <div 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg'}`}
          >
            <img 
              src={userProfile.avatarUrl} 
              alt={userProfile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-xs font-bold uppercase tracking-tighter hidden sm:inline max-w-20 truncate">{userProfile.name}</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
        <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-2xl dark:shadow-slate-950/50 flex items-center justify-around p-1.5 transition-all">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${activeTab === 'daily' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Daily</span>
          </button>

          <button 
            onClick={() => setActiveTab('habits')}
            className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${activeTab === 'habits' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Habits</span>
          </button>

          <button 
            onClick={() => setActiveTab('challenges')}
            className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${activeTab === 'challenges' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Duel</span>
          </button>

          <button 
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${activeTab === 'goals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Goals</span>
          </button>

          <button 
            onClick={() => setActiveTab('monthly')}
            className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Report</span>
          </button>
        </div>
      </nav>
    </>
  );
};
