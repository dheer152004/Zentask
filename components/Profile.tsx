
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DayLog, MonthlyHabit, Goal, Challenge, THEMES } from '../types';
import { DeleteModal } from './DeleteModal';
import { Notification } from './Notification';
import { auth, db, requestNotificationPermission } from '../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { debouncedSyncToFirestore, syncAllDataToFirestore } from '../services/dataSync';

interface ProfileProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  logs: Record<string, DayLog>;
  onLogsUpdate: (logs: Record<string, DayLog>) => void;
  habits: MonthlyHabit[];
  onHabitsUpdate: (habits: MonthlyHabit[]) => void;
  goals: Goal[];
  onGoalsUpdate: (goals: Goal[]) => void;
  challenges: Challenge[];
  onChallengesUpdate: (challenges: Challenge[]) => void;
  onLogout: () => void;
  isGuest: boolean;
}

// Expanded presets with diverse styles
const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Spot',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha',
  'https://api.dicebear.com/7.x/micah/svg?seed=Willow',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Nala',
  'https://api.dicebear.com/7.x/open-peeps/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Retro',
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Mouse',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Bandit',
];

const AVATAR_STYLES = [
  { id: 'avataaars', label: 'Classic' },
  { id: 'notionists', label: 'Sketch' },
  { id: 'bottts', label: 'Robots' },
  { id: 'lorelei', label: 'Artistic' },
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'open-peeps', label: 'Doodles' },
  { id: 'micah', label: 'Modern' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'pixel-art', label: 'Pixel' },
  { id: 'identicon', label: 'Abstract' }
];

export const Profile: React.FC<ProfileProps> = ({
  profile,
  onProfileChange,
  logs,
  onLogsUpdate,
  habits,
  onHabitsUpdate,
  goals,
  onGoalsUpdate,
  challenges,
  onChallengesUpdate,
  onLogout,
  isGuest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedBio, setEditedBio] = useState(profile.bio);
  const [editedMantra, setEditedMantra] = useState(profile.productivityMantra);
  const [editedAvatar, setEditedAvatar] = useState(profile.avatarUrl);
  const [editedUsername, setEditedUsername] = useState(profile.username || '');
  const [usernameError, setUsernameError] = useState('');

  // Custom Avatar Generator State
  const [customSeed, setCustomSeed] = useState('');
  const [customStyle, setCustomStyle] = useState('avataaars');

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalTasksCompleted = (Object.values(logs) as DayLog[]).reduce((acc, log) => {
    return acc + (log.tasks?.filter(t => t.completed).length || 0);
  }, 0);

  const totalHabitDays = habits.reduce((acc, habit) => acc + habit.completions.length, 0);
  const totalGoalsCompleted = goals.filter(g => g.completed).length;

  const startEditing = () => {
    setEditedName(profile.name);
    setEditedBio(profile.bio);
    setEditedMantra(profile.productivityMantra);
    setEditedAvatar(profile.avatarUrl);
    setEditedUsername(profile.username || '');
    setUsernameError('');
    setCustomSeed(profile.name); // Default seed to current name
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validate username
    if (editedUsername && editedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (editedUsername && !/^[a-zA-Z0-9_-]+$/.test(editedUsername)) {
      setUsernameError('Username can only contain letters, numbers, underscore, and dash');
      return;
    }

    // Check if username already exists (excluding current username)
    if (editedUsername && editedUsername !== profile.username) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', editedUsername.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUsernameError('This username is already taken');
          return;
        }
      } catch (err: any) {
        console.error('Error checking username:', err);
        setNotification({ message: 'Error checking username availability', type: 'error' });
        return;
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      name: editedName,
      bio: editedBio,
      productivityMantra: editedMantra,
      avatarUrl: editedAvatar,
      username: editedUsername.toLowerCase().trim()
    };

    // Always update locally first
    onProfileChange(updatedProfile);
    setNotification({ message: 'Profile updated successfully!', type: 'success' });

    // Update username in Firestore if user is logged in
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          username: editedUsername.toLowerCase().trim(),
          displayName: editedName,
          avatarUrl: editedAvatar,
          slogan: editedMantra,
          updatedAt: new Date().toISOString()
        });
      } catch (err: any) {
        console.error('Error updating profile:', err);
        setNotification({ message: 'Profile saved locally, but failed to sync to database', type: 'warning' });
      }
    }

    setUsernameError('');
    setIsEditing(false);
  };

  // Generate URL whenever custom inputs change
  useEffect(() => {
    if (isEditing && customSeed) {
      const url = `https://api.dicebear.com/7.x/${customStyle}/svg?seed=${encodeURIComponent(customSeed)}`;
      // Only auto-update if the user is interacting with the generator, 
      // but we don't want to override if they just clicked a preset.
      // So we'll leave this as a manual action or just use it for the "Generate" button.
    }
  }, [customSeed, customStyle, isEditing]);

  const applyCustomAvatar = () => {
    if (customSeed) {
      const url = `https://api.dicebear.com/7.x/${customStyle}/svg?seed=${encodeURIComponent(customSeed)}`;
      setEditedAvatar(url);
    }
  };

  const toggleDarkMode = () => {
    const updatedProfile = {
      ...profile,
      darkMode: !profile.darkMode
    };
    onProfileChange(updatedProfile);
    if (auth.currentUser) {
      debouncedSyncToFirestore(auth.currentUser.uid, 'profile', updatedProfile);
    }
  };

  const changeTheme = (themeKey: string) => {
    const updatedProfile = {
      ...profile,
      theme: themeKey
    };
    onProfileChange(updatedProfile);
    if (auth.currentUser) {
      debouncedSyncToFirestore(auth.currentUser.uid, 'profile', updatedProfile);
    }
  };

  const toggleAllowCompletedDeletion = () => {
    const updatedProfile = {
      ...profile,
      allowCompletedDeletion: !profile.allowCompletedDeletion
    };
    onProfileChange(updatedProfile);
    if (auth.currentUser) {
      debouncedSyncToFirestore(auth.currentUser.uid, 'profile', updatedProfile);
    }
  };

  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    await requestNotificationPermission();
    setNotifLoading(false);
    alert('Notification settings updated.');
  };

  const handleExport = () => {
    const data = {
      logs,
      habits,
      goals,
      challenges,
      profile
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zentask-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.logs) onLogsUpdate(data.logs);
        if (data.habits) onHabitsUpdate(data.habits);
        if (data.goals) onGoalsUpdate(data.goals);
        if (data.challenges) onChallengesUpdate(data.challenges);
        if (data.profile) onProfileChange(data.profile);
        
        // Sync imported data to Firestore if user is authenticated
        if (auth.currentUser) {
          try {
            await syncAllDataToFirestore(auth.currentUser.uid, {
              logs: data.logs || logs,
              habits: data.habits || habits,
              goals: data.goals || goals,
              challenges: data.challenges || challenges,
              profile: data.profile || profile
            });
            console.log('✅ Imported data synced to Firestore');
          } catch (syncErr) {
            console.error('⚠️ Data imported but failed to sync to Firestore:', syncErr);
            setNotification({ message: 'Data imported locally, but failed to sync to Firestore', type: 'warning' });
          }
        }
        
        setNotification({ message: 'Data imported successfully!', type: 'success' });
      } catch (err) {
        setNotification({ message: 'Failed to import data. Invalid JSON file.', type: 'error' });
        console.error(err);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 transition-colors">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Your Profile</h2>
          <p className="text-slate-500 dark:text-slate-400">Customize your space and see your journey</p>
        </div>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isGuest ? 'Log Out Guest' : 'Logout Account'}
        </button>
      </header>

      {isGuest && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">Guest Mode Active</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">Data is saved locally. Log in to sync across devices.</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative group shrink-0">
            <img
              src={isEditing ? editedAvatar : profile.avatarUrl}
              alt="Avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 object-cover transition-colors bg-slate-100 dark:bg-slate-800"
            />
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            {isEditing ? (
              <div className="space-y-6 max-w-lg">
                <div className="space-y-4">
                  <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full text-3xl font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-b-2 border-indigo-200 dark:border-indigo-600 focus:outline-none focus:border-indigo-600 px-2 py-1 rounded-t-lg transition-colors" placeholder="Name" />
                  <input type="text" value={editedBio} onChange={e => setEditedBio(e.target.value)} placeholder="Short bio..." className="w-full text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 focus:outline-none px-2 py-1 transition-colors" />
                  <div>
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={e => {
                        setEditedUsername(e.target.value);
                        setUsernameError('');
                      }}
                      placeholder="Username (for login)..."
                      className={`w-full text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-b transition-colors focus:outline-none px-2 py-1 ${usernameError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600'}`}
                    />
                    {usernameError && <p className="text-red-500 text-xs mt-1 font-bold">{usernameError}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Create Your Own</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSeed}
                      onChange={(e) => setCustomSeed(e.target.value)}
                      placeholder="Type a word..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {AVATAR_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <button
                      onClick={applyCustomAvatar}
                      className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Or Choose Preset</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {AVATAR_PRESETS.map((url) => (
                      <button
                        key={url}
                        onClick={() => setEditedAvatar(url)}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all bg-slate-100 dark:bg-slate-800 ${editedAvatar === url ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      >
                        <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-center md:justify-start pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all">Save Profile</button>
                  <button onClick={handleCancel} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2 transition-colors">{profile.name}</h3>
                {profile.username && <p className="text-slate-400 dark:text-slate-500 text-sm mb-2 font-mono">@{profile.username}</p>}
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-6 transition-colors">{profile.bio}</p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-indigo-700 dark:text-indigo-300 transition-colors">
                  <span className="text-sm font-black uppercase tracking-widest italic">"{profile.productivityMantra}"</span>
                  <button onClick={startEditing} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-lg transition-colors" title="Edit Profile">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100">{totalTasksCompleted}</p>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Total Tasks Done</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100">{totalHabitDays}</p>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Habit Completions</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100">{totalGoalsCompleted}</p>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Goals Mastered</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Appearance & Experience</h3>
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors">
              <div className="mb-4">
                <p className="font-bold text-slate-700 dark:text-slate-200">Color Theme</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Customize the application palette</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.keys(THEMES).map((themeKey) => {
                  const themeData = THEMES[themeKey];
                  const isActive = (profile.theme || 'indigo') === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => changeTheme(themeKey)}
                      className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${isActive ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: themeData.primary[100] }}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themeData.primary[500] }} />
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-center mt-3 font-bold uppercase tracking-widest text-slate-400 capitalize">
                {(profile.theme || 'Indigo')} Mode
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Dark Mode</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Reduce eye strain at night</p>
              </div>
              <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${profile.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${profile.darkMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Enable Deletion of Completed Items</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Allow removal of already finished tasks and duels</p>
              </div>
              <button onClick={toggleAllowCompletedDeletion} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${profile.allowCompletedDeletion ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${profile.allowCompletedDeletion ? 'right-1' : 'left-1'}`} />
              </button>
            </div>


            {/* We will notification feature in future */}
            {/* <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Daily Notifications</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Get reminders via Firebase Messaging</p>
              </div>
              <button 
                onClick={handleEnableNotifications}
                disabled={notifLoading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all ${notifLoading ? 'opacity-50' : ''}`}
              >
                {notifLoading ? 'Requesting...' : 'Enable'}
              </button>
            </div> */}

          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors">Data Management</h3>
          <div className="space-y-4 flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
              {isGuest ? (
                "You are currently in Guest Mode. All your data is saved only in this browser's local storage."
              ) : (
                `Your ZenTask data is scoped to your account ID (${auth.currentUser?.uid?.slice(0, 8)}...).`
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={handleExport} className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            </div>

            {isGuest && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setIsConfirmingClear(true)} className="flex items-center justify-center gap-2 w-full py-3 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Local Guest Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isConfirmingClear}
        onCancel={() => setIsConfirmingClear(false)}
        onConfirm={async () => {
          const prefix = isGuest ? 'zentask_' : (auth.currentUser ? `${auth.currentUser.uid}_` : 'zentask_');
          localStorage.removeItem(`${prefix}logs`);
          localStorage.removeItem(`${prefix}habits`);
          localStorage.removeItem(`${prefix}goals`);
          localStorage.removeItem(`${prefix}challenges`);
          localStorage.removeItem(`${prefix}profile`);

          if (isGuest) {
            localStorage.removeItem('zentask_guest_mode');
            window.location.reload();
          } else {
            // For authenticated users, sign out first to ensure they return to Landing Page/Auth screen
            try {
              await auth.signOut();
            } catch (e) {
              console.error("Error signing out:", e);
            }
            window.location.reload();
          }
        }}
        title="Clear Data"
        message="This will remove all cached progress for this session on this device. This action cannot be undone."
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};
