
import React, { useState } from 'react';
import { Goal, Subtask } from '../types';
import { DeleteModal } from './DeleteModal';
import { Notification } from './Notification';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (text: string, type: 'monthly' | 'yearly', description?: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onGoalsUpdate: (goals: Goal[]) => void;
  allowCompletedDeletion: boolean;
}

const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return `goal-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const GoalsView: React.FC<GoalsViewProps> = ({ 
  goals, 
  onAddGoal, 
  onToggleGoal, 
  onDeleteGoal, 
  onGoalsUpdate,
  allowCompletedDeletion
}) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [activeType, setActiveType] = useState<'monthly' | 'yearly'>('monthly');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);
  
  // Editing state for main goals
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  const [editingGoalDescription, setEditingGoalDescription] = useState('');

  // Deletion state
  const [pendingDelete, setPendingDelete] = useState<{ id: string; subId?: string; title: string } | null>(null);

  const filteredGoals = goals.filter(g => g.type === activeType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      onAddGoal(newGoalText.trim(), activeType, newGoalDescription.trim() || undefined);
      setNewGoalText('');
      setNewGoalDescription('');
      setIsAddingGoal(false);
    }
  };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingGoalText(goal.text);
    setEditingGoalDescription(goal.description || '');
  };

  const handleSaveGoalEdit = (id: string) => {
    const trimmedText = editingGoalText.trim();
    if (!trimmedText) {
      setEditingGoalId(null);
      return;
    }
    const updatedGoals = goals.map(g => g.id === id ? { 
      ...g, 
      text: trimmedText, 
      description: editingGoalDescription.trim() || undefined 
    } : g);
    onGoalsUpdate(updatedGoals);
    setEditingGoalId(null);
  };

  const handleAddSubtask = (goalId: string) => {
    const trimmed = newSubtaskText.trim();
    if (!trimmed) return;
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const newSub: Subtask = { id: generateId(), text: trimmed, completed: false };
        return { ...g, subtasks: [...(g.subtasks || []), newSub] };
      }
      return g;
    });
    onGoalsUpdate(updatedGoals);
    setNewSubtaskText('');
    setAddingSubtaskToId(null);
  };

  const handleDeleteGoalAttempt = (goal: Goal) => {
    if (goal.completed && !allowCompletedDeletion) {
      setNotification({ message: "Deletion of completed goals is disabled in your profile settings.", type: 'error' });
      return;
    }
    setPendingDelete({ id: goal.id, title: 'Delete Goal' });
  };

  const handleDeleteSubtaskAttempt = (goal: Goal, subtask: Subtask) => {
    if (subtask.completed && !allowCompletedDeletion) {
      setNotification({ message: "Deletion of completed steps is disabled in your profile settings.", type: 'error' });
      return;
    }
    setPendingDelete({ id: goal.id, subId: subtask.id, title: 'Delete Step' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.subId) {
      const updatedGoals = goals.map(g => {
        if (g.id === pendingDelete.id) {
          return {
            ...g,
            subtasks: (g.subtasks || []).filter(s => s.id !== pendingDelete.subId)
          };
        }
        return g;
      });
      onGoalsUpdate(updatedGoals);
    } else {
      onDeleteGoal(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  const handleToggleSubtask = (goalId: string, subtaskId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          subtasks: (g.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return g;
    });
    onGoalsUpdate(updatedGoals);
  };

  return (
    <>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors">Strategic Goals</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Focus on what matters most for your long-term vision</p>
        </div>
        {!isAddingGoal && (
          <button 
            onClick={() => setIsAddingGoal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Goal
          </button>
        )}
      </header>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors max-w-lg">
        <button onClick={() => setActiveType('monthly')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeType === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Monthly Targets</button>
        <button onClick={() => setActiveType('yearly')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeType === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Yearly Visions</button>
      </div>

      {isAddingGoal && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Set New Target</h3>
               <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{activeType}</span>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Objective</label>
              <input 
                type="text"
                autoFocus
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder={`What's your main ${activeType} objective?`}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-5 rounded-2xl text-2xl font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-200 dark:placeholder:text-slate-700 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">The "Why" (Description)</label>
              <textarea 
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                placeholder="Give this goal some context. Why does this matter and how will you measure it?"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-5 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all min-h-[140px] resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit"
                disabled={!newGoalText.trim()}
                className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-lg"
              >
                Establish Goal
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <p className="text-slate-400 dark:text-slate-600 font-bold text-xl uppercase tracking-widest">No Active {activeType} Targets</p>
            <button onClick={() => setIsAddingGoal(true)} className="mt-6 px-8 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black rounded-xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-all uppercase text-xs tracking-widest">Create One Now</button>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const completedSubs = (goal.subtasks || []).filter(s => s.completed).length;
            const totalSubs = (goal.subtasks || []).length;
            const isEditing = editingGoalId === goal.id;
            const goalProgress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : (goal.completed ? 100 : 0);

            return (
              <div key={goal.id} className={`group flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm transition-all hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-xl ${goal.completed ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                <div className="flex items-start gap-4 mb-5">
                  <button onClick={() => onToggleGoal(goal.id)} className={`mt-1.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}>{goal.completed && <svg className="w-5 h-5 animate-check-pop" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}</button>
                  
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-4">
                        <input 
                          type="text"
                          value={editingGoalText}
                          onChange={(e) => setEditingGoalText(e.target.value)}
                          autoFocus
                          className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-indigo-200 dark:border-indigo-800 px-3 py-2 text-xl font-black text-slate-800 dark:text-slate-100 focus:outline-none transition-colors rounded-t-xl"
                        />
                        <textarea 
                          value={editingGoalDescription}
                          onChange={(e) => setEditingGoalDescription(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[120px]"
                          placeholder="Why is this important?"
                        />
                        <div className="flex gap-2">
                           <button onClick={() => handleSaveGoalEdit(goal.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all uppercase tracking-widest">Update</button>
                           <button onClick={() => setEditingGoalId(null)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-200 transition-all uppercase tracking-widest">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 
                          onClick={() => startEditingGoal(goal)}
                          className={`text-2xl font-black transition-all cursor-text leading-[1.1] mb-2 ${goal.completed ? 'line-through text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}
                        >
                          {goal.text}
                        </h3>
                        {goal.description && (
                          <div className={`p-4 rounded-2xl mb-4 transition-colors ${goal.completed ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                            <p className={`text-xs font-medium leading-relaxed italic ${goal.completed ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                              {goal.description}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-400 dark:text-indigo-500 rounded text-[9px] font-black uppercase tracking-[0.15em]">{new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          {totalSubs > 0 && <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded text-[9px] font-black uppercase tracking-[0.15em]">{completedSubs}/{totalSubs} Steps Done</span>}
                        </div>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEditingGoal(goal)} className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10" title="Edit Goal Details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteGoalAttempt(goal)} 
                        disabled={goal.completed && !allowCompletedDeletion}
                        className={`p-2 transition-all rounded-xl ${
                          goal.completed && !allowCompletedDeletion
                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                        }`}
                        title={goal.completed && !allowCompletedDeletion ? 'Enable deletion of completed goals in settings' : 'Delete Goal'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Bar for the Goal */}
                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Journey Progress</p>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{Math.round(goalProgress)}%</p>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {(goal.subtasks || []).map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 group/sub">
                      <button onClick={() => handleToggleSubtask(goal.id, subtask.id)} className={`w-5 h-5 rounded-lg border-2 transition-colors flex items-center justify-center shrink-0 ${subtask.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400'}`}>{subtask.completed && <svg className="w-3.5 h-3.5 text-white animate-check-pop" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}</button>
                      <span className={`text-sm flex-1 leading-snug font-medium ${subtask.completed ? 'text-slate-300 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{subtask.text}</span>
                      <button onClick={() => handleDeleteSubtaskAttempt(goal, subtask)} className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg></button>
                    </div>
                  ))}
                  
                  {addingSubtaskToId === goal.id ? (
                    <div className="flex gap-2 items-center animate-in slide-in-from-top-1 duration-200">
                      <input 
                        type="text" autoFocus value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(goal.id); if (e.key === 'Escape') setAddingSubtaskToId(null); }} 
                        placeholder="Action step..." 
                        className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors" 
                      />
                      <button onClick={() => handleAddSubtask(goal.id)} className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all tracking-widest">Add</button>
                    </div>
                  ) : (
                    goal.completed ? (
                       <p className="text-[10px] text-slate-300 dark:text-slate-600 italic py-2 pl-2">Objective finalized. No further steps allowed.</p>
                    ) : (
                      <button onClick={() => setAddingSubtaskToId(goal.id)} className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-all font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 -ml-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Add Step
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <DeleteModal 
        isOpen={!!pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={pendingDelete?.title || 'Confirm Delete'}
        message="Are you sure you want to delete this target? This action will remove all progress associated with it."
      />
      </div>
    </>
  );
};
