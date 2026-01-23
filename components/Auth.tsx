
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onContinueAsGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onContinueAsGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=User');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Support both email and username login
        let loginEmail = email;

        // Check if input is a username (doesn't contain @)
        if (!email.includes('@')) {
          // Query Firestore to find user by username
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', email.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
              setError('No account found with this username. Please check and try again.');
              setLoading(false);
              return;
            }

            const userData = querySnapshot.docs[0].data();
            loginEmail = userData.email;

            if (!userData.email) {
              setError('User account is missing email information. Please contact support.');
              setLoading(false);
              return;
            }
          } catch (err: any) {
            console.error('Error querying username:', err);
            setError('Unable to verify username. Please try logging in with your email instead.');
            setLoading(false);
            return;
          }
        }

        await signInWithEmailAndPassword(auth, loginEmail, password);
      } else {
        // Registration
        if (!username.trim()) {
          setError('Please enter a username.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name.trim() || username.trim();
        await updateProfile(userCredential.user, { displayName });

        // Store complete user profile in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          displayName: displayName,
          avatarUrl: selectedAvatar,
          bio: 'Finding focus and flow every day.',
          slogan: slogan.trim() || 'Stay focused, stay productive',
          darkMode: false,
          theme: 'indigo',
          allowCompletedDeletion: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        await sendEmailVerification(userCredential.user);
        setMessage('Registration successful! Please check your email for verification.');
      }
    } catch (err: any) {
      // Handle specific Firebase errors
      if (err.code === 'auth/network-request-failed' || err.message === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.code === 'auth/user-not-found' || err.message === 'auth/user-not-found') {
        setError('No account found with this email or username.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">ZenTask <span className="text-indigo-600"></span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{isLogin ? 'Welcome back to your focus' : 'Begin your journey to discipline'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="zenmaster"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">Your Slogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Stay focused, stay productive"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">Choose Avatar</label>
                <div className="flex gap-2 flex-wrap justify-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  {['User', 'Felix', 'Aneka', 'Oliver', 'Sasha', 'Nala'].map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatar(avatarUrl)}
                        className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all ${selectedAvatar === avatarUrl
                            ? 'border-indigo-600 scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                          }`}
                      >
                        <img src={avatarUrl} alt={seed} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">{isLogin ? 'Email or Username' : 'Email Address'}</label>
            <input
              type={isLogin ? "text" : "email"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? "email@example.com or username" : "you@example.com"}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center px-2">{error}</p>}
          {message && <p className="text-emerald-500 text-xs font-bold text-center px-2">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600">OR</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>

          <button
            onClick={onContinueAsGuest}
            className="text-sm font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
