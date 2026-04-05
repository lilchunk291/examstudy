import { writable } from 'svelte/store';

export interface Session {
  access_token: string;
  user_id?: string;
  email?: string;
}

// Initialize from localStorage if available
function createSessionStore() {
  let initialSession: Session | null = null;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('session');
    if (stored) {
      try {
        initialSession = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse session from localStorage:', e);
      }
    }
  }

  const { subscribe, set, update } = writable<Session | null>(initialSession);

  return {
    subscribe,
    set: (value: Session | null) => {
      if (value) {
        localStorage.setItem('session', JSON.stringify(value));
      } else {
        localStorage.removeItem('session');
      }
      set(value);
    },
    update,
    clear: () => {
      localStorage.removeItem('session');
      set(null);
    },
  };
}

export const sessionStore = createSessionStore();
