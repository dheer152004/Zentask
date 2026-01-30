
import React, { useState } from 'react';
import { Challenge, Subtask, ChallengeCompletion } from '../types';
import { DeleteModal } from './DeleteModal';

interface ChallengeManagerProps {
  challenges: Challenge[];
  onChallengesChange: (challenges: Challenge[]) => void;
  allowCompletedDeletion: boolean;
  currentTheme?: string;
}

const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return `challenge-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const ChallengeManager: React.FC<ChallengeManagerProps> = ({ 
  challenges, 
  onChallengesChange,
  allowCompletedDeletion,
  currentTheme = 'indigo'
}) => {
  // New Duel Creation State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [tempRules, setTempRules] = useState<string[]>([]);
  const [currentRuleInput, setCurrentRuleInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletionError, setDeletionError] = useState<boolean>(false);

  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const handleAddTempRule = () => {
    if (currentRuleInput.trim()) {
      setTempRules([...tempRules, currentRuleInput.trim()]);
      setCurrentRuleInput('');
    }
  };

  const handleRemoveTempRule = (index: number) => {
    setTempRules(tempRules.filter((_, i) => i !== index));
  };

  const handleStartChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || tempRules.length === 0) return;

    const finalDuration = customDuration ? parseInt(customDuration, 10) : newDuration;
    if (isNaN(finalDuration) || finalDuration <= 0) return;

    const challenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || `Commit to ${newTitle} for ${finalDuration} days.`,
      durationDays: finalDuration,
      startDate: today,
      completions: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      subtasks: tempRules.map(text => ({ id: generateId(), text, completed: false }))
    };

    onChallengesChange([...challenges, challenge]);
    setNewTitle('');
    setNewDescription('');
    setTempRules([]);
    setCustomDuration('');
    setIsCreating(false);
  };

  const handleToggleSubtask = (challengeId: string, subtaskId: string) => {
    onChallengesChange(challenges.map(c => {
      if (c.id === challengeId) {
        const nextSubtasks = (c.subtasks || []).map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );

        // Calculate today's progress percentage
        const total = nextSubtasks.length;
        const done = nextSubtasks.filter(s => s.completed).length;
        const progress = total > 0 ? (done / total) * 100 : 0;

        // Update completions map for today
        let nextCompletions = [...c.completions];
        const todayIndex = nextCompletions.findIndex(comp => comp.date === today);
        
        if (todayIndex > -1) {
          nextCompletions[todayIndex] = { ...nextCompletions[todayIndex], progress };
        } else {
          nextCompletions.push({ date: today, progress });
        }

        // Check overall duel completion (total unique days where 100% was reached)
        const daysWithPerfectScore = nextCompletions.filter(comp => comp.progress === 100).length;
        let nextStatus = c.status;
        if (daysWithPerfectScore >= c.durationDays) {
          nextStatus = 'completed';
        } else if (c.status === 'completed' && daysWithPerfectScore < c.durationDays) {
          nextStatus = 'active';
        }

        return {
          ...c,
          subtasks: nextSubtasks,
          completions: nextCompletions,
          status: nextStatus
        };
      }
      return c;
    }));
  };

  const handleDeleteAttempt = (challenge: Challenge) => {
    if (challenge.status === 'completed' && !allowCompletedDeletion) {
      setDeletionError(true);
      setTimeout(() => setDeletionError(false), 4000);
      return;
    }
    setPendingDelete({ id: challenge.id, title: 'Abandon Duel' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onChallengesChange(challenges.filter(c => c.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const getHeatmapColor = (progress: number | undefined) => {
    if (progress === undefined || progress === 0) return 'bg-red-500'; // 0%
    if (progress < 50) return 'bg-orange-500'; // >0% and <50%
    if (progress < 100) return 'bg-yellow-400'; // >=50% and <100%
    return 'bg-green-500'; // 100%
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors">Challenge Duel</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Strategic commitments with immutable rules</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm md:text-base w-full md:w-auto justify-center md:justify-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Start Duel</span>
          </button>
        )}
      </header>

      {deletionError && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-indigo-900 dark:text-indigo-200">Deletion of completed duels is disabled</p>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-1">This feature is disabled in your profile settings. Enable it to delete completed duels.</p>
            </div>
          </div>
        </div>
      )}      {isCreating && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleStartChallenge} className="space-y-8">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Duel Subject</label>
              <input 
                type="text" autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Master Morning Routine"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-xl font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Define Daily Rules (Fixed for Duration)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" value={currentRuleInput} onChange={(e) => setCurrentRuleInput(e.target.value)} placeholder="Add a specific rule..."
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTempRule(); } }}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button type="button" onClick={handleAddTempRule} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Add</button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {tempRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 group animate-in slide-in-from-left-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-4">{rule}</span>
                      <button type="button" onClick={() => handleRemoveTempRule(idx)} className="text-red-400 hover:text-red-600 p-1 opacity-50 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                      </button>
                    </div>
                  ))}
                  {tempRules.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-xl">Define at least one rule to establish your duel discipline.</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">Duel Duration (Days)</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[7, 21, 30, 50, 75, 100].map(days => (
                      <button 
                        key={days} 
                        type="button" 
                        onClick={() => {setNewDuration(days); setCustomDuration('');}} 
                        className={`py-3 rounded-xl font-black text-xs transition-all border-2 ${newDuration === days && !customDuration ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-200'}`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Custom Days</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="365"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={!newTitle.trim() || tempRules.length === 0} 
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 text-lg"
                >
                  Seal Duel Agreement
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl animate-in fade-in duration-500">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Once launched, duel rules and duration cannot be modified. Commit wisely.
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeChallenges.map(challenge => {
          const todayCompletion = challenge.completions.find(c => c.date === today);
          const isFullyDoneToday = todayCompletion?.progress === 100;
          const daysReached = challenge.completions.filter(c => c.progress === 100).length;
          const progressPercent = (daysReached / challenge.durationDays) * 100;
          
          return (
            <div key={challenge.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/30 relative overflow-hidden flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex-shrink-0 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle 
                        cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        className="text-green-500 transition-all duration-1000"
                        strokeDasharray={2 * Math.PI * 14}
                        strokeDashoffset={2 * Math.PI * 14 * (1 - progressPercent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors truncate max-w-[180px]">{challenge.title}</h3>
                       {isFullyDoneToday && (
                         <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-in zoom-in-50 duration-300">Daily Victory</span>
                       )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{challenge.durationDays} Day Duel</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{daysReached} Victories achieved</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteAttempt(challenge)} 
                  disabled={challenge.status === 'completed' && !allowCompletedDeletion}
                  className={`opacity-0 group-hover:opacity-100 p-2 transition-all rounded-xl ${
                    challenge.status === 'completed' && !allowCompletedDeletion
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                  }`}
                  title={challenge.status === 'completed' && !allowCompletedDeletion ? 'Enable deletion of completed duels in settings' : 'Delete duel'}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 transition-colors relative z-10 font-medium italic">"{challenge.description}"</p>

              <div className="flex-1 flex flex-col relative z-10 mb-8 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 transition-colors">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Today's Rules Checklist</h4>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{Math.round(todayCompletion?.progress || 0)}% Done</span>
                 </div>
                 <div className="space-y-4">
                   {(challenge.subtasks || []).map(sub => (
                     <div key={sub.id} className="flex items-center gap-4 group/sub">
                        <button 
                          onClick={() => handleToggleSubtask(challenge.id, sub.id)}
                          className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 active:scale-125 ${sub.completed ? 'bg-green-500 border-green-500 shadow-md shadow-green-100 dark:shadow-none' : 'border-slate-200 dark:border-slate-700 hover:border-green-400'}`}
                        >
                          {sub.completed && <svg className="w-4 h-4 text-white animate-check-pop" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                        </button>
                        <span className={`text-sm flex-1 truncate transition-all font-bold ${sub.completed ? 'text-slate-300 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{sub.text}</span>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10 pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Duel Heatmap (4-Color Scale)</p>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div><span className="text-[8px] font-bold text-slate-400">0%</span></div>
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div><span className="text-[8px] font-bold text-slate-400">&lt;50%</span></div>
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div><span className="text-[8px] font-bold text-slate-400">&lt;100%</span></div>
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div><span className="text-[8px] font-bold text-slate-400">100%</span></div>
                   </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: challenge.durationDays }).map((_, idx) => {
                    const d = new Date(challenge.startDate);
                    d.setDate(d.getDate() + idx);
                    const dStr = d.toISOString().split('T')[0];
                    const comp = challenge.completions.find(c => c.date === dStr);
                    const isFuture = dStr > today;
                    return (
                      <div 
                        key={idx} 
                        className={`w-3.5 h-3.5 rounded-[4px] transition-all hover:scale-125 hover:shadow-md cursor-help ${isFuture ? 'bg-slate-100 dark:bg-slate-800' : getHeatmapColor(comp?.progress)}`}
                        title={`Day ${idx + 1}: ${dStr} - ${comp ? Math.round(comp.progress) : 0}% progress`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedChallenges.length > 0 && (
        <div className="space-y-6 pt-12 animate-in fade-in duration-1000">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-3 transition-colors">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Victories (Hall of Fame)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {completedChallenges.map(challenge => (
              <div key={challenge.id} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-900/10 dark:to-green-900/5 p-8 rounded-[3rem] border-2 border-green-100 dark:border-emerald-800/30 flex flex-col gap-6 transition-all hover:scale-[1.02] relative group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-500 text-white rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl shadow-green-200 dark:shadow-none animate-bounce-subtle">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-green-900 dark:text-emerald-400 truncate text-2xl">{challenge.title}</p>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Duel Mastered</span>
                       <span className="w-1 h-1 bg-green-300 rounded-full" />
                       <span className="text-[10px] font-black text-green-500/70 tracking-widest">{challenge.durationDays} Days Completed</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAttempt(challenge)} 
                    disabled={!allowCompletedDeletion}
                    className={`opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl ${
                      !allowCompletedDeletion
                        ? 'text-green-300/50 dark:text-green-400/50 cursor-not-allowed'
                        : 'text-green-300 hover:text-red-400'
                    }`}
                    title={!allowCompletedDeletion ? 'Enable deletion of completed duels in settings' : 'Delete duel'}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="pl-20 space-y-4">
                   <p className="text-base text-green-800/80 dark:text-emerald-400/80 italic leading-relaxed font-medium">"{challenge.description}"</p>
                   <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-green-600/60 uppercase tracking-[0.2em] pt-4">
                     <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Started: {new Date(challenge.startDate).toLocaleDateString()}</span>
                     <span className="w-1 h-1 bg-green-200 rounded-full" />
                     <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Total Score: 100% Alignment</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && !isCreating && (
        <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
            <svg className="w-12 h-12 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h4 className="text-3xl font-black text-slate-400 dark:text-slate-600 mb-4 transition-colors px-4 tracking-tighter">Enter the Duel</h4>
          <p className="text-slate-400 dark:text-slate-600 max-w-sm mx-auto mb-10 transition-colors px-6 text-lg leading-relaxed">Commit to a multi-day ritual. Define your rules, set your duration, and earn your place in the Hall of Fame.</p>
          <button onClick={() => setIsCreating(true)} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 text-lg">Start your first Duel</button>
        </div>
      )}

      <DeleteModal 
        isOpen={!!pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={pendingDelete?.title || 'Abandon Duel'}
        message="Are you sure you want to abandon this commitment? This will permanently erase your progress and daily consistency history for this duel."
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
