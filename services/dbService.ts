
import { UserProfile, InterviewSession } from '../types';

const USER_KEY = 'hirevision_db_user';
const SESSIONS_KEY = 'hirevision_db_sessions';

/**
 * DBMS Service
 * Simulates an asynchronous cloud database (Firestore/MongoDB style)
 */
export const dbService = {
  // Simulate network latency
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  async saveUser(user: UserProfile): Promise<void> {
    await this.delay(800);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('[DBMS] User profile backed up to cloud.');
  },

  async getUser(): Promise<UserProfile | null> {
    await this.delay(500);
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async saveSession(session: InterviewSession): Promise<void> {
    await this.delay(1000);
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    let updated;
    if (index >= 0) {
      updated = [...sessions];
      updated[index] = { ...session, lastSynced: new Date().toISOString() };
    } else {
      updated = [{ ...session, lastSynced: new Date().toISOString() }, ...sessions];
    }
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    console.log(`[DBMS] Session ${session.id} synced with backup server.`);
  },

  async getSessions(): Promise<InterviewSession[]> {
    await this.delay(600);
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  }
};
