
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { loadUserDataFromFirestore, debouncedSyncToFirestore, syncAllDataToFirestore } from './services/dataSync';
import { Auth } from './components/Auth';
import { TaskManager } from './components/TaskManager';
import { ReportDashboard } from './components/ReportDashboard';
import { MonthlyHabits } from './components/MonthlyHabits';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { GoalsView } from './components/GoalsView';
import { ChallengeManager } from './components/ChallengeManager';
import { LandingPage } from './components/LandingPage';
import { Task, DayLog, MonthlyHabit, Goal, UserProfile, Challenge, THEMES } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('zentask_guest_mode') === 'true');
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'habits' | 'monthly' | 'profile' | 'goals' | 'challenges'>('daily');
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [monthlyHabits, setMonthlyHabits] = useState<MonthlyHabit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Zen User',
    bio: 'Finding focus and flow every day.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    productivityMantra: 'Small steps, big impact.',
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    theme: 'indigo',
    allowCompletedDeletion: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setIsGuest(false);
        setShowLanding(false);
        localStorage.removeItem('zentask_guest_mode');
        // Redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
        // We will load the specific user profile in the data loading effect
      }
    });
    return unsubscribe;
  }, [navigate]);

  const getLocalDateString = () => new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      try {
        const prefix = currentUser ? `${currentUser.uid}_` : 'zentask_';

        // For authenticated users, load from Firestore first
        if (currentUser) {
          console.log('🔄 Loading data from Firestore...');
          const firestoreData = await loadUserDataFromFirestore(currentUser.uid);

          // Merge Firestore data with localStorage (Firestore takes precedence)
          const savedLogs = localStorage.getItem(`${prefix}logs`);
          const savedHabits = localStorage.getItem(`${prefix}habits`);
          const savedGoals = localStorage.getItem(`${prefix}goals`);
          const savedChallenges = localStorage.getItem(`${prefix}challenges`);
          const savedProfile = localStorage.getItem(`${prefix}profile`);

          setLogs(firestoreData.logs || (savedLogs ? JSON.parse(savedLogs) : {}));
          setMonthlyHabits(firestoreData.habits || (savedHabits ? JSON.parse(savedHabits) : []));
          setGoals(firestoreData.goals || (savedGoals ? JSON.parse(savedGoals) : []));
          setChallenges(firestoreData.challenges || (savedChallenges ? JSON.parse(savedChallenges) : []));

          if (firestoreData.profile) {
            setUserProfile(firestoreData.profile);
          } else if (savedProfile) {
            setUserProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
          } else {
            setUserProfile({
              name: currentUser?.displayName || 'Zen User',
              bio: 'Finding focus and flow every day.',
              avatarUrl: currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`,
              productivityMantra: 'Small steps, big impact.',
              darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
              theme: 'indigo',
              allowCompletedDeletion: false
            });
          }

          // If there was local data but no Firestore data, migrate it
          if (savedLogs && !firestoreData.logs) {
            console.log('📤 Migrating local data to Firestore...');
            const localLogs = savedLogs ? JSON.parse(savedLogs) : {};
            const localHabits = savedHabits ? JSON.parse(savedHabits) : [];
            const localGoals = savedGoals ? JSON.parse(savedGoals) : [];
            const localChallenges = savedChallenges ? JSON.parse(savedChallenges) : [];
            const localProfile = savedProfile ? JSON.parse(savedProfile) : userProfile;

            await syncAllDataToFirestore(currentUser.uid, {
              logs: localLogs,
              habits: localHabits,
              goals: localGoals,
              challenges: localChallenges,
              profile: localProfile
            });
          }
        } else {
          // Guest mode: Load from localStorage only
          const savedLogs = localStorage.getItem(`${prefix}logs`);
          const savedHabits = localStorage.getItem(`${prefix}habits`);
          const savedGoals = localStorage.getItem(`${prefix}goals`);
          const savedChallenges = localStorage.getItem(`${prefix}challenges`);
          const savedProfile = localStorage.getItem(`${prefix}profile`);

          setLogs(savedLogs ? JSON.parse(savedLogs) : {});
          setMonthlyHabits(savedHabits ? JSON.parse(savedHabits) : []);
          setGoals(savedGoals ? JSON.parse(savedGoals) : []);
          setChallenges(savedChallenges ? JSON.parse(savedChallenges) : []);

          if (savedProfile) {
            setUserProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
          } else {
            setUserProfile({
              name: 'Zen User',
              bio: 'Finding focus and flow every day.',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
              productivityMantra: 'Small steps, big impact.',
              darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
              theme: 'indigo',
              allowCompletedDeletion: false
            });
          }
        }
      } catch (e) {
        console.error('❌ Error loading data:', e);
      }
    };

    loadData();
  }, [currentUser, authLoading]);

  // Apply Theme and Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    const isAppActive = !showLanding && (!!currentUser || isGuest);

    // Dark Mode
    if (userProfile.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Theme Application - Force Indigo if not in main app (Landing or Auth)
    const activeThemeKey = isAppActive ? userProfile.theme : 'indigo';
    const theme = THEMES[activeThemeKey] || THEMES['indigo'];
    const { primary, neutral } = theme;

    // Set CSS Variables
    Object.entries(primary).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });
    Object.entries(neutral).forEach(([shade, value]) => {
      root.style.setProperty(`--color-neutral-${shade}`, value);
    });

  }, [userProfile.darkMode, userProfile.theme, showLanding, currentUser, isGuest]);

  useEffect(() => {
    if (!authLoading && (currentUser || isGuest)) {
      const prefix = currentUser ? `${currentUser.uid}_` : 'zentask_';
      // Always save to localStorage for offline access
      localStorage.setItem(`${prefix}logs`, JSON.stringify(logs));
      localStorage.setItem(`${prefix}habits`, JSON.stringify(monthlyHabits));
      localStorage.setItem(`${prefix}goals`, JSON.stringify(goals));
      localStorage.setItem(`${prefix}challenges`, JSON.stringify(challenges));
      localStorage.setItem(`${prefix}profile`, JSON.stringify(userProfile));

      // For authenticated users, also sync to Firestore (debounced)
      if (currentUser) {
        debouncedSyncToFirestore(currentUser.uid, 'logs', logs);
        debouncedSyncToFirestore(currentUser.uid, 'habits', monthlyHabits);
        debouncedSyncToFirestore(currentUser.uid, 'goals', goals);
        debouncedSyncToFirestore(currentUser.uid, 'challenges', challenges);
        debouncedSyncToFirestore(currentUser.uid, 'profile', userProfile);
      }
    }
  }, [logs, monthlyHabits, goals, challenges, userProfile, currentUser, isGuest, authLoading]);

  const handleUpdateTasks = useCallback((date: string, tasks: Task[]) => {
    setLogs(prev => ({ ...prev, [date]: { date, tasks: [...tasks] } }));
  }, []);

  const handleMoveTask = useCallback((taskId: string, fromDate: string, toDate: string) => {
    setLogs(prev => {
      const newLogs = { ...prev };
      const fromLog = newLogs[fromDate];
      if (!fromLog) return prev;
      const taskToMove = fromLog.tasks.find(t => t.id === taskId);
      if (!taskToMove) return prev;
      newLogs[fromDate] = { ...fromLog, tasks: fromLog.tasks.filter(t => t.id !== taskId) };
      const targetLog = newLogs[toDate] || { date: toDate, tasks: [] };
      newLogs[toDate] = { ...targetLog, tasks: [...targetLog.tasks, { ...taskToMove, dueDate: toDate }] };
      return newLogs;
    });
  }, []);

  // Calculate which dates have incomplete tasks for the calendar highlight
  const datesWithTasks = useMemo(() => {
    return Object.keys(logs).filter(date => {
      const dayLog = logs[date];
      return dayLog && dayLog.tasks && dayLog.tasks.some(t => !t.completed);
    });
  }, [logs]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading ZenTask...</div>;

  return (
    <Routes>
      <Route path="/" element={showLanding && !currentUser && !isGuest ? <LandingPage onLaunchApp={() => { setShowLanding(false); navigate('/auth'); }} /> : !currentUser && !isGuest ? <Auth onContinueAsGuest={() => { setIsGuest(true); setShowLanding(false); localStorage.setItem('zentask_guest_mode', 'true'); navigate('/dashboard'); }} /> : <Dashboard />} />
      <Route path="/auth" element={<Auth onContinueAsGuest={() => { setIsGuest(true); setShowLanding(false); localStorage.setItem('zentask_guest_mode', 'true'); navigate('/dashboard'); }} />} />
      <Route path="/dashboard" element={currentUser || isGuest ? <Dashboard /> : <Auth onContinueAsGuest={() => { setIsGuest(true); setShowLanding(false); localStorage.setItem('zentask_guest_mode', 'true'); navigate('/dashboard'); }} />} />
    </Routes>
  );

  function Dashboard() {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} goals={goals} onAddGoal={(text, type, description) => setGoals(prev => [...prev, { id: `goal-${Date.now()}`, text, description, type, completed: false, createdAt: new Date().toISOString(), subtasks: [] }])} onToggleGoal={(id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))} onDeleteGoal={(id) => setGoals(prev => prev.filter(g => g.id !== id))} userProfile={userProfile} />
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto mb-24 md:mb-0">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'daily' && <TaskManager selectedDate={selectedDate} setSelectedDate={setSelectedDate} tasks={logs[selectedDate]?.tasks || []} onTasksChange={(newTasks) => handleUpdateTasks(selectedDate, newTasks)} onMoveTask={handleMoveTask} allowCompletedDeletion={userProfile.allowCompletedDeletion} datesWithTasks={datesWithTasks} />}
            {activeTab === 'habits' && <MonthlyHabits habits={monthlyHabits} onHabitsChange={setMonthlyHabits} allowCompletedDeletion={userProfile.allowCompletedDeletion} currentTheme={userProfile.theme} />}
            {activeTab === 'goals' && <GoalsView goals={goals} onAddGoal={(text, type, description) => setGoals(prev => [...prev, { id: `goal-${Date.now()}`, text, description, type, completed: false, createdAt: new Date().toISOString(), subtasks: [] }])} onToggleGoal={(id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))} onDeleteGoal={(id) => setGoals(prev => prev.filter(g => g.id !== id))} onGoalsUpdate={setGoals} allowCompletedDeletion={userProfile.allowCompletedDeletion} />}
            {activeTab === 'challenges' && <ChallengeManager challenges={challenges} onChallengesChange={setChallenges} allowCompletedDeletion={userProfile.allowCompletedDeletion} currentTheme={userProfile.theme} />}
            {activeTab === 'monthly' && <ReportDashboard logs={logs} goals={goals} challenges={challenges} currentTheme={userProfile.theme} />}
            {activeTab === 'profile' &&
              <Profile
                profile={userProfile}
                onProfileChange={setUserProfile}
                logs={logs}
                onLogsUpdate={setLogs}
                habits={monthlyHabits}
                onHabitsUpdate={setMonthlyHabits}
                goals={goals}
                onGoalsUpdate={setGoals}
                challenges={challenges}
                onChallengesUpdate={setChallenges}
                onLogout={() => { if (currentUser) auth.signOut(); else setIsGuest(false); setShowLanding(true); navigate('/'); }}
                isGuest={isGuest}
              />
            }
          </div>
        </main>
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} />
      </div>
    );
  }
};

export default App;
