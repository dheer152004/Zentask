
import React, { useState } from 'react';
import { Goal, UserProfile } from '../types';
import { DeleteModal } from './DeleteModal';

type TabType = 'daily' | 'habits' | 'monthly' | 'profile' | 'challenges' | 'goals';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  goals: Goal[];
  onAddGoal: (text: string, type: 'monthly' | 'yearly', description?: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  userProfile: UserProfile;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onDeleteGoal,
  userProfile
}) => {
  
  // Deletion state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'daily',
      label: 'Daily Tracker',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      id: 'habits',
      label: 'Habit Tracker',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      id: 'goals',
      label: 'Strategic Goals',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    {
      id: 'challenges',
      label: 'Challenge Duel',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      id: 'monthly',
      label: 'Insights Report',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    }
  ];

  return (
    <aside className="hidden md:flex md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-8 px-4 h-screen sticky top-0 overflow-y-auto scrollbar-hide transition-colors">
      <div className="mb-10 flex items-center gap-3 px-2 flex-shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">ZenTask <span className="text-indigo-600">AI</span></h1>
      </div>

      <nav className="w-full space-y-1 mb-8 flex-shrink-0">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
              )}
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex-shrink-0 w-full px-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all relative ${
            activeTab === 'profile' 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
          }`}
        >
          {activeTab === 'profile' && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
          )}
          <img src={userProfile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full shrink-0" />
          <div className="text-left overflow-hidden">
            <p className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>{userProfile.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">Settings</p>
          </div>
        </button>
      </div>

      <DeleteModal 
        isOpen={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) onDeleteGoal(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? All sub-steps will also be removed."
      />
    </aside>
  );
};
