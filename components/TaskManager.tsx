
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Task, Category, Subtask } from '../types';
import { DeleteModal } from './DeleteModal';
import { Notification } from './Notification';

interface TaskManagerProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onMoveTask: (taskId: string, fromDate: string, toDate: string) => void;
  allowCompletedDeletion: boolean;
  datesWithTasks: string[];
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Urgent', 'Other'];

const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getLocalDateString = () => new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];

export const TaskManager: React.FC<TaskManagerProps> = ({ 
  selectedDate, 
  setSelectedDate, 
  tasks, 
  onTasksChange,
  onMoveTask,
  allowCompletedDeletion,
  datesWithTasks
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Personal');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(selectedDate);
  const [sortByDate, setSortByDate] = useState(false);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Personal');
  const [editDueDate, setEditDueDate] = useState('');

  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  
  const [pendingDelete, setPendingDelete] = useState<{ id: string; subId?: string; title: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

  // Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(selectedDate + 'T00:00:00'));
  const calendarRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const today = getLocalDateString();

  useEffect(() => {
    setNewTaskDueDate(selectedDate);
    setCalendarViewDate(new Date(selectedDate + 'T00:00:00'));
  }, [selectedDate]);

  // Click outside listener for calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const processedTasks = useMemo(() => {
    let list = [...safeTasks];
    if (sortByDate) {
      list.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    }
    return list;
  }, [safeTasks, sortByDate]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
      dueDate: newTaskDueDate || undefined,
      subtasks: []
    };
    onTasksChange([...safeTasks, newTask]);
    setNewTaskText('');
    inputRef.current?.focus();
  };

  const handleToggleTask = (id: string) => {
    onTasksChange(safeTasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
    // Default to current date if not set, satisfying the requirement to "default to current date"
    setEditDueDate(task.dueDate || getLocalDateString());
  };

  const saveEdit = () => {
    if (!editingTaskId || !editText.trim()) return;
    onTasksChange(safeTasks.map(t => t.id === editingTaskId ? { ...t, text: editText.trim(), category: editCategory, dueDate: editDueDate || undefined } : t));
    setEditingTaskId(null);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    onTasksChange(safeTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) };
      }
      return t;
    }));
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskText.trim()) return;
    onTasksChange(safeTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [
            ...(t.subtasks || []),
            {
              id: generateId(),
              text: newSubtaskText.trim(),
              completed: false
            }
          ]
        };
      }
      return t;
    }));
    setNewSubtaskText('');
    setAddingSubtaskToId(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.subId) {
      // Deleting a subtask
      onTasksChange(safeTasks.map(t => {
        if (t.id === pendingDelete.id) {
          return {
            ...t,
            subtasks: (t.subtasks || []).filter(s => s.id !== pendingDelete.subId)
          };
        }
        return t;
      }));
    } else {
      // Deleting a task
      onTasksChange(safeTasks.filter(t => t.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarViewDate(newDate);
  };

  const selectCalendarDate = (day: number) => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const newDate = new Date(year, month, day);
    // Adjust for timezone offset to get YYYY-MM-DD local string correctly
    const dateStr = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setIsCalendarOpen(false);
  };

  const { days, firstDay, year, month } = getDaysInMonth(calendarViewDate);
  const completedCount = safeTasks.filter(t => t.completed).length;
  const progress = safeTasks.length > 0 ? (completedCount / safeTasks.length) * 100 : 0;

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight">Daily Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Schedule for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="relative" ref={calendarRef}>
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>

          {isCalendarOpen && (
            <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-slate-800 z-50 w-[320px] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
                <span className="font-bold text-slate-800 dark:text-slate-100">{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-black uppercase text-slate-400 py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = currentStr === selectedDate;
                  const isToday = currentStr === today;
                  const hasTasks = datesWithTasks.includes(currentStr);

                  return (
                    <button 
                      key={day}
                      onClick={() => selectCalendarDate(day)}
                      className={`h-9 w-9 rounded-xl flex flex-col items-center justify-center text-xs relative transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-bold scale-110 z-10' 
                          : hasTasks
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      } ${isToday && !isSelected ? 'ring-1 ring-inset ring-indigo-200 dark:ring-indigo-700' : ''}`}
                    >
                      <span>{day}</span>
                      {hasTasks && !isSelected && (
                        <span className="w-1 h-1 bg-indigo-500 rounded-full mt-0.5 opacity-60" />
                      )}
                      {hasTasks && isSelected && (
                        <span className="w-1 h-1 bg-white/60 rounded-full mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 transition-colors">
            <form onSubmit={handleAddTask} className="flex flex-col gap-2">
              <input ref={inputRef} type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a task to today's log..." className="w-full px-6 py-4 bg-transparent border-none focus:outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors font-medium" />
              <div className="flex items-center justify-between px-4 pb-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category)} className="bg-slate-50 dark:bg-slate-800 border-none px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 focus:outline-none">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button type="submit" disabled={!newTaskText.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">Capture Task</button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {processedTasks.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Clear Horizon</p>
              </div>
            ) : (
              processedTasks.map(task => {
                // Calculate days remaining: due date - today
                const daysUntilDue = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : null;
                // Upcoming: Due today (0), tomorrow (1), or day after (2)
                const isUpcoming = !task.completed && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2;
                // Overdue: Due before today (< 0)
                const isOverdue = !task.completed && daysUntilDue !== null && daysUntilDue < 0;
                // Future: Due in 3+ days
                const hasFutureDueDate = !task.completed && daysUntilDue !== null && daysUntilDue > 2;

                if (editingTaskId === task.id) {
                   return (
                     <div key={task.id} className="p-6 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-[2rem] shadow-lg transition-all space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Edit Task</p>
                          <input 
                            type="text" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full text-lg font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-slate-800 dark:text-slate-100"
                            placeholder="Task title"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 ml-1">Category</p>
                             <select 
                                value={editCategory} 
                                onChange={(e) => setEditCategory(e.target.value as Category)}
                                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                              >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 ml-1">Due Date</p>
                             <input 
                                type="date" 
                                value={editDueDate} 
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setEditingTaskId(null)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors">Cancel</button>
                          <button onClick={saveEdit} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none transition-all">Save Changes</button>
                        </div>
                     </div>
                   );
                }

                return (
                  <div key={task.id} className={`group flex flex-col p-6 bg-white dark:bg-slate-900 border rounded-[2rem] shadow-sm transition-all hover:shadow-xl ${task.completed ? 'opacity-60 border-slate-100 dark:border-slate-800' : isUpcoming ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/20' : isOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleToggleTask(task.id)} className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 active:scale-125 ${task.completed ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}>
                        {task.completed && <svg className="w-5 h-5 animate-check-pop" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-lg font-bold leading-snug truncate ${task.completed ? 'line-through text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>{task.text}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-500 border border-indigo-100 dark:border-indigo-900">{task.category}</span>
                          {(task.subtasks || []).length > 0 && <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{(task.subtasks || []).filter(s=>s.completed).length}/{(task.subtasks || []).length} Steps</span>}
                          
                          {/* Urgency Indicators */}
                          {isUpcoming && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {daysUntilDue === 0 ? 'Due Today' : (daysUntilDue === 1 ? 'Due Tomorrow' : `Due ${new Date(task.dueDate!).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`)}
                            </span>
                          )}
                          {isOverdue && (
                             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-1">
                               <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                               Overdue
                             </span>
                          )}
                          {hasFutureDueDate && (
                             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                               <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               {new Date(task.dueDate!).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                             </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => startEditing(task)} className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10" title="Edit Task">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         </button>
                         <button onClick={() => { setAddingSubtaskToId(task.id); setNewSubtaskText(''); }} className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10" title="Add Subtask">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                         </button>
                         <button onClick={() => setPendingDelete({id: task.id, title: 'Delete Task'})} className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10" title="Delete Task">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>
                    
                    {/* Subtasks List */}
                    {(task.subtasks || []).length > 0 && (
                      <div className="ml-11 mt-4 space-y-2">
                        {task.subtasks.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3 group/sub">
                             <button onClick={() => handleToggleSubtask(task.id, sub.id)} className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center shrink-0 ${sub.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-100 dark:border-slate-800'}`}>
                               {sub.completed && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                             </button>
                             <span className={`text-xs font-medium flex-1 ${sub.completed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-600 dark:text-slate-400'}`}>{sub.text}</span>
                             
                             {/* Subtask Delete Button */}
                             <button 
                               onClick={() => {
                                 if (sub.completed && !allowCompletedDeletion) {
                                    setNotification({ message: "Deletion of completed items is disabled.", type: 'error' });
                                    return;
                                 }
                                 setPendingDelete({ id: task.id, subId: sub.id, title: 'Delete Step' });
                               }}
                               className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                               title="Delete Step"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                             </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Subtask Input */}
                    {addingSubtaskToId === task.id && (
                       <div className="ml-11 mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                          <input 
                             autoFocus
                             type="text"
                             value={newSubtaskText}
                             onChange={(e) => setNewSubtaskText(e.target.value)}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubtask(task.id);
                                if (e.key === 'Escape') {
                                  setAddingSubtaskToId(null);
                                  setNewSubtaskText('');
                                }
                             }}
                             placeholder="Add a step..."
                             className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button onClick={() => handleAddSubtask(task.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Add</button>
                          <button onClick={() => { setAddingSubtaskToId(null); setNewSubtaskText(''); }} className="p-1.5 text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                       </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50 dark:text-slate-800" />
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-600 transition-all duration-1000" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800 dark:text-slate-100">{Math.round(progress)}%</div>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Daily Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest font-black">
              {progress === 100 ? "Zen Master Level" : "Keep Polishing"}
            </p>
          </div>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!pendingDelete} 
        onCancel={() => setPendingDelete(null)} 
        onConfirm={confirmDelete} 
        title={pendingDelete?.title || ''} 
        message={pendingDelete?.subId ? "Permanently remove this step?" : "Permanent removal of this task entry?"} 
      />
    </div>
    </>
  );
};
