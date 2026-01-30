import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    writeBatch,
    query,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { DayLog, MonthlyHabit, Goal, Challenge, UserProfile } from '../types';

export interface UserData {
    logs: Record<string, DayLog>;
    habits: MonthlyHabit[];
    goals: Goal[];
    challenges: Challenge[];
    profile: UserProfile;
}

/**
 * Load all user data from Firestore
 */
export async function loadUserDataFromFirestore(userId: string): Promise<Partial<UserData>> {
    try {
        const userData: Partial<UserData> = {};

        // Load profile
        const profileRef = doc(db, 'users', userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
            const data = profileSnap.data();
            userData.profile = {
                name: data.displayName || 'Zen User',
                bio: data.bio || 'Finding focus and flow every day.',
                avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                productivityMantra: data.slogan || 'Small steps, big impact.',
                darkMode: data.darkMode ?? false,
                theme: data.theme || 'indigo',
                allowCompletedDeletion: data.allowCompletedDeletion ?? false,
                username: data.username
            };
        }

        // Load logs
        const logsRef = collection(db, 'users', userId, 'logs');
        const logsSnap = await getDocs(logsRef);
        const logs: Record<string, DayLog> = {};
        logsSnap.forEach((doc) => {
            logs[doc.id] = doc.data() as DayLog;
        });
        userData.logs = logs;

        // Load habits
        const habitsRef = collection(db, 'users', userId, 'habits');
        const habitsSnap = await getDocs(habitsRef);
        const habits: MonthlyHabit[] = [];
        habitsSnap.forEach((doc) => {
            habits.push({ ...doc.data(), id: doc.id } as MonthlyHabit);
        });
        userData.habits = habits;

        // Load goals
        const goalsRef = collection(db, 'users', userId, 'goals');
        const goalsSnap = await getDocs(goalsRef);
        const goals: Goal[] = [];
        goalsSnap.forEach((doc) => {
            goals.push({ ...doc.data(), id: doc.id } as Goal);
        });
        userData.goals = goals;

        // Load challenges
        const challengesRef = collection(db, 'users', userId, 'challenges');
        const challengesSnap = await getDocs(challengesRef);
        const challenges: Challenge[] = [];
        challengesSnap.forEach((doc) => {
            challenges.push({ ...doc.data(), id: doc.id } as Challenge);
        });
        userData.challenges = challenges;

        console.log('✅ Loaded user data from Firestore');
        return userData;
    } catch (error) {
        console.error('❌ Error loading user data from Firestore:', error);
        return {};
    }
}

/**
 * Sync logs to Firestore
 */
export async function syncLogsToFirestore(userId: string, logs: Record<string, DayLog>): Promise<void> {
    try {
        // Skip if no logs to sync
        if (Object.keys(logs).length === 0) {
            console.log('⏭️ No logs to sync');
            return;
        }

        const batch = writeBatch(db);
        const logsRef = collection(db, 'users', userId, 'logs');

        Object.entries(logs).forEach(([date, dayLog]) => {
            const docRef = doc(logsRef, date);
            batch.set(docRef, dayLog, { merge: true });
        });

        await batch.commit();
        console.log('✅ Synced logs to Firestore');
    } catch (error) {
        console.error('❌ Error syncing logs:', error);
        throw error;
    }
}

/**
 * Sync habits to Firestore - with proper deletion support
 */
export async function syncHabitsToFirestore(userId: string, habits: MonthlyHabit[]): Promise<void> {
    try {
        const batch = writeBatch(db);
        const habitsRef = collection(db, 'users', userId, 'habits');

        // Get existing habits in Firestore
        const existingSnap = await getDocs(habitsRef);
        const existingIds = new Set(existingSnap.docs.map(d => d.id));
        const localIds = new Set(habits.map(h => h.id));

        // Delete habits that don't exist in local state
        existingSnap.docs.forEach((doc) => {
            if (!localIds.has(doc.id)) {
                batch.delete(doc.ref);
            }
        });

        // Write/update local habits
        habits.forEach((habit) => {
            const docRef = doc(habitsRef, habit.id);
            batch.set(docRef, habit, { merge: true });
        });

        await batch.commit();
        console.log('✅ Synced habits to Firestore');
    } catch (error) {
        console.error('❌ Error syncing habits:', error);
        throw error;
    }
}

/**
 * Sync goals to Firestore - with proper deletion support
 */
export async function syncGoalsToFirestore(userId: string, goals: Goal[]): Promise<void> {
    try {
        const batch = writeBatch(db);
        const goalsRef = collection(db, 'users', userId, 'goals');

        // Get existing goals in Firestore
        const existingSnap = await getDocs(goalsRef);
        const existingIds = new Set(existingSnap.docs.map(d => d.id));
        const localIds = new Set(goals.map(g => g.id));

        // Delete goals that don't exist in local state
        existingSnap.docs.forEach((doc) => {
            if (!localIds.has(doc.id)) {
                batch.delete(doc.ref);
            }
        });

        // Write/update local goals
        goals.forEach((goal) => {
            const docRef = doc(goalsRef, goal.id);
            batch.set(docRef, goal, { merge: true });
        });

        await batch.commit();
        console.log('✅ Synced goals to Firestore');
    } catch (error) {
        console.error('❌ Error syncing goals:', error);
        throw error;
    }
}

/**
 * Sync challenges to Firestore - with proper deletion support
 */
export async function syncChallengesToFirestore(userId: string, challenges: Challenge[]): Promise<void> {
    try {
        const batch = writeBatch(db);
        const challengesRef = collection(db, 'users', userId, 'challenges');

        // Get existing challenges in Firestore
        const existingSnap = await getDocs(challengesRef);
        const existingIds = new Set(existingSnap.docs.map(d => d.id));
        const localIds = new Set(challenges.map(c => c.id));

        // Delete challenges that don't exist in local state
        existingSnap.docs.forEach((doc) => {
            if (!localIds.has(doc.id)) {
                batch.delete(doc.ref);
            }
        });

        // Write/update local challenges
        challenges.forEach((challenge) => {
            const docRef = doc(challengesRef, challenge.id);
            batch.set(docRef, challenge, { merge: true });
        });

        await batch.commit();
        console.log('✅ Synced challenges to Firestore');
    } catch (error) {
        console.error('❌ Error syncing challenges:', error);
        throw error;
    }
}

/**
 * Sync profile preferences to Firestore
 */
export async function syncProfilePreferencesToFirestore(userId: string, profile: UserProfile): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        
        // Get existing document to preserve createdAt and email
        const existingDoc = await getDoc(userRef);
        const existingData = existingDoc.data() || {};
        
        await setDoc(userRef, {
            displayName: profile.name,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            username: profile.username || existingData.username || '',
            email: existingData.email || '',
            slogan: profile.productivityMantra,
            darkMode: profile.darkMode,
            theme: profile.theme,
            allowCompletedDeletion: profile.allowCompletedDeletion,
            createdAt: existingData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('✅ Synced profile preferences to Firestore');
    } catch (error) {
        console.error('❌ Error syncing profile preferences:', error);
        throw error;
    }
}

/**
 * Sync all user data to Firestore
 */
export async function syncAllDataToFirestore(
    userId: string,
    data: {
        logs: Record<string, DayLog>;
        habits: MonthlyHabit[];
        goals: Goal[];
        challenges: Challenge[];
        profile: UserProfile;
    }
): Promise<void> {
    try {
        await Promise.all([
            syncLogsToFirestore(userId, data.logs),
            syncHabitsToFirestore(userId, data.habits),
            syncGoalsToFirestore(userId, data.goals),
            syncChallengesToFirestore(userId, data.challenges),
            syncProfilePreferencesToFirestore(userId, data.profile)
        ]);
        console.log('✅ All data synced to Firestore');
    } catch (error) {
        console.error('❌ Error syncing all data:', error);
        throw error;
    }
}

/**
 * Debounced sync to avoid excessive Firestore writes
 * Each data type has its own debounce timer
 */
const syncTimeouts: Record<string, NodeJS.Timeout> = {};

export function debouncedSyncToFirestore(
    userId: string,
    dataType: 'logs' | 'habits' | 'goals' | 'challenges' | 'profile',
    data: any,
    delay: number = 2000
): void {
    const key = `${userId}_${dataType}`;
    
    // Clear existing timeout for this data type
    if (syncTimeouts[key]) {
        clearTimeout(syncTimeouts[key]);
    }

    // Set new timeout for this data type
    syncTimeouts[key] = setTimeout(async () => {
        try {
            console.log(`🔄 Syncing ${dataType} to Firestore...`);
            switch (dataType) {
                case 'logs':
                    await syncLogsToFirestore(userId, data);
                    break;
                case 'habits':
                    await syncHabitsToFirestore(userId, data);
                    break;
                case 'goals':
                    await syncGoalsToFirestore(userId, data);
                    break;
                case 'challenges':
                    await syncChallengesToFirestore(userId, data);
                    break;
                case 'profile':
                    await syncProfilePreferencesToFirestore(userId, data);
                    break;
            }
            console.log(`✅ Successfully synced ${dataType} to Firestore`);
            delete syncTimeouts[key];
        } catch (error) {
            console.error(`❌ Failed to sync ${dataType}:`, error);
        }
    }, delay);
}
