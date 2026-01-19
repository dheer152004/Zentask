
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DayLog, AIInsights, Category, THEMES, Goal, Challenge, Task } from '../types';


interface ReportDashboardProps {
  logs: Record<string, DayLog>;
  goals: Goal[];
  challenges: Challenge[];
  currentTheme: string;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ logs, goals, challenges, currentTheme }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [viewingDate, setViewingDate] = useState<string | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{date: string, task: Task}[]>([]);

  const themeColors = THEMES[currentTheme] || THEMES['indigo'];

  const CATEGORY_COLORS: Record<string, string> = {
    Work: themeColors.primary[600],
    Personal: themeColors.primary[400],
    Health: '#10b981', // Keep static green for health
    Urgent: '#ef4444', // Keep static red for urgent
    Other: themeColors.neutral[400]
  };

  const stats = useMemo(() => {
    const today = new Date();
    const last30DaysArr = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs[dateStr];
      const tasks = log?.tasks || [];
      const completed = tasks.filter(t => t.completed).length;
      const total = tasks.length;
      last30DaysArr.push({
        date: dateStr,
        dayNum: d.getDate(),
        completed,
        total,
        progress: total > 0 ? (completed / total) * 100 : 0,
        hasTasks: total > 0
      });
    }

    const categoryCounts: Record<Category, number> = {
      Work: 0, Personal: 0, Health: 0, Urgent: 0, Other: 0
    };

    let totalGlobal = 0;
    let completedGlobal = 0;

    // Fix: Explicitly type 'log' as DayLog to avoid 'unknown' type inference error on 'tasks' property
    Object.values(logs).forEach((log: DayLog) => {
      log.tasks.forEach(t => {
        totalGlobal++;
        if (t.completed) {
          completedGlobal++;
          categoryCounts[t.category]++;
        }
      });
    });

    const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

    return { totalGlobal, completedGlobal, last30DaysArr, pieData };
  }, [logs]);

  // Goal Analysis
  const goalStats = useMemo(() => {
    const monthly = goals.filter(g => g.type === 'monthly');
    const yearly = goals.filter(g => g.type === 'yearly');
    
    const monthlyCompleted = monthly.filter(g => g.completed).length;
    const yearlyCompleted = yearly.filter(g => g.completed).length;

    const activeGoals = goals.filter(g => !g.completed).slice(0, 3); // Top 3 active

    return { monthly, yearly, monthlyCompleted, yearlyCompleted, activeGoals };
  }, [goals]);

  // Challenge/Duel Analysis
  const duelStats = useMemo(() => {
    const active = challenges.filter(c => c.status === 'active');
    const completed = challenges.filter(c => c.status === 'completed');
    return { active, completed };
  }, [challenges]);

  useEffect(() => {
    if (Object.keys(logs).length > 0) {
      setLoadingAI(true);
    }
  }, [logs]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        const results: {date: string, task: Task}[] = [];
        Object.values(logs).forEach((log: DayLog) => {
          log.tasks.forEach(task => {
            if (task.text.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({ date: log.date, task });
            }
          });
        });
        // Sort by date descending
        results.sort((a, b) => b.date.localeCompare(a.date));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, logs]);

  const getHeatmapColor = (progress: number, hasTasks: boolean) => {
    if (!hasTasks) return 'bg-slate-100 dark:bg-slate-800 opacity-30';
    if (progress === 0) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 100) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getGoalProgress = (goal: Goal) => {
    const total = goal.subtasks?.length || 0;
    if (total === 0) return goal.completed ? 100 : 0;
    const done = goal.subtasks?.filter(s => s.completed).length || 0;
    return (done / total) * 100;
  };

  const getDuelDayProgress = (challenge: Challenge) => {
    const daysCompleted = challenge.completions.filter(c => c.progress === 100).length;
    return Math.min(100, (daysCompleted / challenge.durationDays) * 100);
  };

  if (Object.keys(logs).length === 0 && goals.length === 0 && challenges.length === 0) {
    return <div className="text-center py-32 font-bold text-slate-400 uppercase tracking-widest">No data to analyze yet</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight transition-colors">Discipline Audit</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Monthly performance and AI strategic advice</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-indigo-600 dark:bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full">Discipline Score</span>
             <div className="mt-6 flex items-baseline gap-3">
                <span className="text-7xl font-black">{loadingAI ? '...' : insights?.productivityScore || '--'}</span>
                <span className="text-indigo-200 text-xl font-bold">/ 100</span>
             </div>
             <p className="mt-6 text-indigo-50 font-medium italic text-lg leading-relaxed max-w-md">
               {loadingAI ? "Decoding your habits..." : `"${insights?.summary || "Consistent daily tracking leads to measurable long-term growth."}"`}
             </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="bg-white/10 p-5 rounded-3xl flex flex-col justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Success</span>
                <span className="text-3xl font-black">{stats.completedGlobal}</span>
             </div>
             <div className="bg-white/10 p-5 rounded-3xl flex flex-col justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Total</span>
                <span className="text-3xl font-black">{stats.totalGlobal}</span>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">AI Strategy Tips</h3>
          <ul className="space-y-4">
             {loadingAI ? (
               [1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />)
             ) : (
               insights?.recommendations.map((rec, i) => (
                 <li key={i} className="flex gap-4 group">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">{i+1}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{rec}</p>
                 </li>
               ))
             )}
          </ul>
        </div>

        {/* Goals & Challenges Analysis Row */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Strategic Alignment (Goals) */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Strategic Alignment</h3>
                <div className="flex gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">Goals</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{goalStats.monthlyCompleted} <span className="text-sm text-slate-400">/ {goalStats.monthly.length}</span></span>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mt-1">Monthly Targets</span>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{goalStats.yearlyCompleted} <span className="text-sm text-slate-400">/ {goalStats.yearly.length}</span></span>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mt-1">Yearly Visions</span>
                 </div>
              </div>

              <div className="space-y-4 flex-1">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Active Focus</h4>
                 {goalStats.activeGoals.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No active goals found.</p>
                 ) : (
                    goalStats.activeGoals.map(goal => (
                      <div key={goal.id} className="space-y-1.5">
                         <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span className="truncate max-w-[70%]">{goal.text}</span>
                            <span>{Math.round(getGoalProgress(goal))}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getGoalProgress(goal)}%` }} />
                         </div>
                      </div>
                    ))
                 )}
              </div>
           </div>

           {/* Duel Mastery (Challenges) */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Duel Mastery</h3>
                <div className="flex gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">Challenges</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8">
                 <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                 </div>
                 <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{duelStats.completed.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hall of Fame Victories</p>
                 </div>
              </div>

              <div className="space-y-4 flex-1">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Active Duels</h4>
                 {duelStats.active.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No active duels. Start a new challenge!</p>
                 ) : (
                    duelStats.active.map(duel => {
                       const progress = getDuelDayProgress(duel);
                       const daysDone = duel.completions.filter(c => c.progress === 100).length;
                       return (
                         <div key={duel.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{duel.title}</span>
                               <span className="text-[10px] font-black bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{daysDone}/{duel.durationDays} Days</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                         </div>
                       );
                    })
                 )}
              </div>
           </div>
        </div>

        {/* Task Search Bar & Results */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search your task history..."
                 className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
           </div>
           
           {/* Search Results Area */}
           {searchTerm && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                    {searchResults.length > 0 ? `Found ${searchResults.length} Matches` : 'No matches found'}
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {searchResults.map(({date, task}, idx) => (
                       <button 
                          key={`${date}-${task.id}-${idx}`}
                          onClick={() => setViewingDate(date)}
                          className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-800 transition-all text-left group"
                       >
                          <div className="flex justify-between items-center w-full">
                             <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-500 transition-colors">
                                {new Date(date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                             </span>
                             {task.completed && <span className="text-green-500"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></span>}
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full">{task.text}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-md self-start">{task.category}</span>
                       </button>
                    ))}
                 </div>
              </div>
           )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Daily Task Heatmap</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Low</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Full</span></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
             {stats.last30DaysArr.map((day, idx) => (
               <div key={idx} className="flex flex-col items-center gap-1.5">
                  <button 
                    onClick={() => setViewingDate(day.date)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${getHeatmapColor(day.progress, day.hasTasks)} shadow-sm`}
                    title={`${day.date}: ${Math.round(day.progress)}% task completion`}
                  >
                     <span className={`text-[10px] font-black ${day.hasTasks ? 'text-white' : 'text-slate-300 dark:text-slate-600'}`}>{day.dayNum}</span>
                  </button>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col items-center text-center">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Discipline Focus</h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || themeColors.primary[600]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {stats.pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || themeColors.primary[600] }} />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewingDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={() => setViewingDate(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[80vh] flex flex-col">
             <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {new Date(viewingDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Daily Snapshot</p>
                </div>
                <button 
                  onClick={() => setViewingDate(null)} 
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>

             <div className="overflow-y-auto pr-2 custom-scrollbar space-y-3 flex-1">
                {!logs[viewingDate]?.tasks?.length ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    No tasks recorded for this day.
                  </div>
                ) : (
                  logs[viewingDate].tasks.map((task) => (
                    <div key={task.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${task.completed ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                       <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                         {task.completed && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${task.completed ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{task.category}</span>
                             {task.subtasks && task.subtasks.length > 0 && (
                               <span className="text-[10px] font-bold text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                             )}
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
