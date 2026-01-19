
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyHabit, Category, THEMES } from '../types';
import { DeleteModal } from './DeleteModal';
import { Notification } from './Notification';

interface MonthlyHabitsProps {
  habits: MonthlyHabit[];
  onHabitsChange: (habits: MonthlyHabit[]) => void;
  allowCompletedDeletion: boolean;
  currentTheme: string;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Urgent', 'Other'];

export const MonthlyHabits: React.FC<MonthlyHabitsProps> = ({ 
  habits, 
  onHabitsChange,
  allowCompletedDeletion,
  currentTheme
}) => {
  const [newHabitText, setNewHabitText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Personal');
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar'>('matrix');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);
  
  // Deletion Modal State
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Ref for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const themeColors = THEMES[currentTheme] || THEMES['indigo'];
  const primaryColor = themeColors.primary[600];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = now.toLocaleString('default', { month: 'long' });
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  // Scroll to today's date in Matrix view
  useEffect(() => {
    if (viewMode === 'matrix' && scrollContainerRef.current) {
      // Short timeout to allow DOM to render
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        const todayHeader = document.getElementById('today-column-header');
        
        if (container && todayHeader) {
          const containerWidth = container.clientWidth;
          const headerLeft = todayHeader.offsetLeft;
          const headerWidth = todayHeader.offsetWidth;
          
          // Center the today column
          const scrollLeft = headerLeft - (containerWidth / 2) + (headerWidth / 2);
          
          container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, daysInMonth]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;
    const newHabit: MonthlyHabit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: newHabitText.trim(),
      category: selectedCategory,
      completions: [],
      createdAt: new Date().toISOString()
    };
    onHabitsChange([...habits, newHabit]);
    if (!selectedHabitId) setSelectedHabitId(newHabit.id);
    setNewHabitText('');
  };

  const toggleDay = (habitId: string, day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onHabitsChange(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completions.includes(dateStr);
        const newCompletions = isCompleted 
          ? habit.completions.filter(d => d !== dateStr)
          : [...habit.completions, dateStr];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const handleDeleteAttempt = (habit: MonthlyHabit) => {
    if (habit.completions.length > 0 && !allowCompletedDeletion) {
      setNotification({ message: "Deletion of habits with active completions is disabled in your profile settings.", type: 'error' });
      return;
    }
    setPendingDeleteId(habit.id);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    onHabitsChange(habits.filter(h => h.id !== pendingDeleteId));
    if (selectedHabitId === pendingDeleteId) {
      setSelectedHabitId(habits.find(h => h.id !== pendingDeleteId)?.id || null);
    }
    setPendingDeleteId(null);
  };

  const chartData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completedCount = habits.filter(h => h.completions.includes(dateStr)).length;
      return {
        day,
        score: habits.length > 0 ? (completedCount / habits.length) * 100 : 0
      };
    });
  }, [habits, daysInMonth, currentYear, currentMonth]);

  const activeHabit = habits.find(h => h.id === (selectedHabitId || habits[0]?.id));

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 transition-colors">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors">Consistency Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Monitoring all recurring habits for {monthName} {currentYear}</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 transition-colors">
          <button onClick={() => setViewMode('matrix')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'matrix' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Matrix</button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Calendar</button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Monthly Performance Trend</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">% Total Habits Completed</span>
          </div>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} labelFormatter={(label) => `Day ${label}`} />
              <Area type="monotone" dataKey="score" stroke={primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 transition-colors">
        <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input type="text" value={newHabitText} onChange={(e) => setNewHabitText(e.target.value)} placeholder="Track a new recurring goal..." className="w-full pl-6 pr-32 py-4 bg-transparent border-none focus:outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors" />
            <div className="absolute right-2 top-2 bottom-2 flex items-center">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category)} className="h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 rounded-xl text-xs font-bold uppercase text-slate-500 dark:text-slate-400 focus:outline-none transition-colors">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={!newHabitText.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg dark:shadow-none active:scale-95 flex items-center gap-2">Add Habbit</button>
        </form>
      </div>

      {viewMode === 'matrix' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors">
          <div ref={scrollContainerRef} className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <th className="sticky left-0 bg-slate-50 dark:bg-slate-800 p-4 text-left text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest w-48 z-20">Task / Habit</th>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const isToday = (i + 1) === now.getDate();
                    return (
                      <th 
                        key={i} 
                        id={isToday ? 'today-column-header' : undefined}
                        className={`p-2 text-center text-[10px] font-black min-w-[32px] border-l border-slate-100/50 dark:border-slate-700/50 transition-colors ${isToday ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        {i + 1}
                      </th>
                    );
                  })}
                  <th className="p-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 w-16">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                {habits.length === 0 ? (
                  <tr><td colSpan={daysInMonth + 2} className="py-20 text-center text-slate-400 dark:text-slate-600 italic">Add your first habit to start the monthly matrix view.</td></tr>
                ) : (
                  habits.map(habit => {
                    const monthlyCount = habit.completions.filter(d => d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length;
                    return (
                      <tr key={habit.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 p-4 z-10 border-r border-slate-100 dark:border-slate-800 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate transition-colors">{habit.text}</p>
                              <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-400/80 dark:text-indigo-500/80">{habit.category}</span>
                            </div>
                            <button onClick={() => handleDeleteAttempt(habit)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isCompleted = habit.completions.includes(dateStr);
                          const isToday = now.getDate() === day;
                          return (
                            <td key={i} className={`p-0.5 border-l border-slate-100/30 dark:border-slate-800/30 ${isToday ? 'bg-indigo-50/10 dark:bg-indigo-900/10' : ''} transition-colors`}>
                              <button onClick={() => toggleDay(habit.id, day)} className={`w-full aspect-square max-h-[30px] rounded-md transition-all flex items-center justify-center ${isCompleted ? 'bg-indigo-600 text-white shadow-inner' : isToday ? 'border border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </button>
                            </td>
                          );
                        })}
                        <td className="p-2 text-center text-xs font-black text-indigo-600 dark:text-indigo-400 bg-slate-50/20 dark:bg-slate-800/20 transition-colors tracking-tighter">{monthlyCount}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-y-auto max-h-[500px] transition-colors">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Select a Habit</h3>
            <div className="space-y-2">
              {habits.map(habit => (
                <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)} className={`w-full text-left p-4 rounded-2xl transition-all border ${(selectedHabitId || habits[0]?.id) === habit.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <p className="truncate">{habit.text}</p>
                  <span className={`text-[9px] uppercase tracking-widest ${(selectedHabitId || habits[0]?.id) === habit.id ? 'text-indigo-400 dark:text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}>{habit.category}</span>
                </button>
              ))}
              {habits.length === 0 && <p className="text-slate-400 dark:text-slate-600 italic text-sm">No habits added yet.</p>}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 transition-colors">
            {activeHabit ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">{activeHabit.text}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl">{activeHabit.completions.length}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase transition-colors">Total Days</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase py-2">{day}</div>)}
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`pad-${i}`} className="aspect-square" />;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isCompleted = activeHabit.completions.includes(dateStr);
                    const isToday = now.getDate() === day;
                    return (
                      <button key={day} onClick={() => toggleDay(activeHabit.id, day)} className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group relative ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg dark:shadow-none' : isToday ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'}`}>
                        <span className={`text-xs font-black ${isCompleted ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>
                        {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        {!isCompleted && isToday && <div className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-600 rounded-full animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="font-bold">Select a habit to view its calendar</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <DeleteModal 
        isOpen={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All progress logs for this habit will be permanently removed."
      />
      </div>
    </>
  );
};
