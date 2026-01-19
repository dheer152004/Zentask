
export type Category = 'Work' | 'Personal' | 'Health' | 'Urgent' | 'Other';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  createdAt: string; // ISO String
  completedAt?: string; // ISO String
  dueDate?: string; // YYYY-MM-DD
  subtasks: Subtask[];
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  tasks: Task[];
}

export interface MonthlyHabit {
  id: string;
  text: string;
  category: Category;
  completions: string[]; // Array of YYYY-MM-DD strings
  createdAt: string;
}

export interface Goal {
  id: string;
  text: string;
  description?: string;
  type: 'monthly' | 'yearly';
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
}

export interface ChallengeCompletion {
  date: string;
  progress: number; // 0 to 100
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  startDate: string;
  completions: ChallengeCompletion[]; // Updated to track percentage progress per day
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  subtasks: Subtask[];
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  productivityMantra: string;
  darkMode: boolean;
  theme: string; // 'indigo', 'pink', 'rose', 'amber', 'emerald', 'sky', 'zinc'
  allowCompletedDeletion: boolean;
  username?: string; // Optional username for login
}

export interface MonthlyStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  categoryBreakdown: Record<Category, number>;
  dailyCompletion: { date: string; count: number }[];
}

export interface AIInsights {
  summary: string;
  recommendations: string[];
  productivityScore: number;
}

// Color Palettes Definition
export const THEMES: Record<string, { primary: Record<number, string>, neutral: Record<number, string> }> = {
  indigo: {
    primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
    neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' } // Slate
  },
  pink: { // Vivid Pink Theme
    primary: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
    neutral: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' } // Stone
  },
  rose: { // Reddish Pink Theme
    primary: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
    neutral: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' } // Stone (Warm Grey)
  },
  amber: { // Brown/Autumn Theme
    primary: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
    neutral: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' } // Stone
  },
  emerald: { // Nature Theme
    primary: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
    neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' } // Zinc
  },
  sky: { // Ocean Theme
    primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
    neutral: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' } // Slate
  },
  zinc: { // Monochrome/Grey Theme
    primary: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
    neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' }
  }
};
