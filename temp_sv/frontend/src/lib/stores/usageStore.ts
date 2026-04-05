// Usage Tracking Store - Section 5.1
// Memory-only tracking with daily reset

import { writable, derived } from 'svelte/store';

interface UsageState {
  dailyChatMinutes: number;
  dailyAppOpens: number;
  dailyPlanRevisions: number;
  lastSessionLogged: Date | null;
  chatSessionStartTime: Date | null;
  overlay45MinShown: boolean;
  overlay8OpensShown: boolean;
}

function createUsageStore() {
  // Simple memory store to replace localStorage
  const memoryStore: { [key: string]: string } = {};

  const memoryStoreInterface = {
    getItem: (key: string): string | null => memoryStore[key] || null,
    setItem: (key: string, value: string): void => { memoryStore[key] = value; },
    removeItem: (key: string): void => { delete memoryStore[key]; },
    clear: (): void => { Object.keys(memoryStore).forEach(key => delete memoryStore[key]); }
  };

  // Check if it's a new day and reset counters (memory-only)
  const isNewDay = () => {
    const now = new Date();
    const lastReset = memoryStoreInterface.getItem('usage_last_reset');
    const today = now.toDateString();
    
    if (lastReset !== today) {
      memoryStoreInterface.setItem('usage_last_reset', today);
      return true;
    }
    return false;
  };

  const initialState: UsageState = {
    dailyChatMinutes: 0,
    dailyAppOpens: 0,
    dailyPlanRevisions: 0,
    lastSessionLogged: null,
    chatSessionStartTime: null,
    overlay45MinShown: false,
    overlay8OpensShown: false
  };

  const { subscribe, set, update } = writable<UsageState>(
    isNewDay() ? initialState : { ...initialState }
  );

  return {
    subscribe,

    // Track app opens
    trackAppOpen: () => {
      update(state => {
        if (isNewDay()) {
          return { ...initialState, dailyAppOpens: 1 };
        }
        return { ...state, dailyAppOpens: state.dailyAppOpens + 1 };
      });
    },

    // Start chat session timer
    startChatSession: () => {
      update(state => ({ ...state, chatSessionStartTime: new Date() }));
    },

    // End chat session and add minutes
    endChatSession: () => {
      update(state => {
        if (state.chatSessionStartTime) {
          const duration = new Date().getTime() - state.chatSessionStartTime.getTime();
          const minutes = Math.floor(duration / (1000 * 60));
          
          if (isNewDay()) {
            return { 
              ...initialState, 
              dailyChatMinutes: minutes,
              chatSessionStartTime: null 
            };
          }
          
          return { 
            ...state, 
            dailyChatMinutes: state.dailyChatMinutes + minutes,
            chatSessionStartTime: null 
          };
        }
        return state;
      });
    },

    // Track plan revisions
    trackPlanRevision: () => {
      update(state => {
        if (isNewDay()) {
          return { ...initialState, dailyPlanRevisions: 1 };
        }
        return { ...state, dailyPlanRevisions: state.dailyPlanRevisions + 1 };
      });
    },

    // Log a study session
    logSession: () => {
      update(state => ({ ...state, lastSessionLogged: new Date() }));
    },

    // Show 45-minute overlay
    show45MinOverlay: () => {
      update(state => ({ ...state, overlay45MinShown: true }));
    },

    // Show 8-opens overlay
    show8OpensOverlay: () => {
      update(state => ({ ...state, overlay8OpensShown: true }));
    },

    // Reset overlays (for new day)
    resetOverlays: () => {
      update(state => ({ 
        ...state, 
        overlay45MinShown: false, 
        overlay8OpensShown: false 
      }));
    },

    // Get current state
    getState: () => {
      let currentState: UsageState = initialState;
      const unsubscribe = subscribe(state => { currentState = state; });
      unsubscribe();
      return currentState;
    }
  };
}

export const usageStore = createUsageStore();

// Derived stores for UI
export const shouldShow45MinOverlay = derived(
  usageStore,
  $usage => $usage.dailyChatMinutes >= 45 && !$usage.overlay45MinShown
);

export const shouldShow8OpensOverlay = derived(
  usageStore,
  $usage => $usage.dailyAppOpens >= 8 && !$usage.overlay8OpensShown && $usage.lastSessionLogged === null
);

export const usageProgress = derived(
  usageStore,
  $usage => Math.min(($usage.dailyChatMinutes / 45) * 100, 100)
);

// Track app opens on mount
if (typeof window !== 'undefined') {
  // Track initial app open
  usageStore.trackAppOpen();
  
  // Track page visibility changes (app focus/blur)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      usageStore.trackAppOpen();
    }
  });
  
  // Reset at midnight
  const checkMidnightReset = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      usageStore.resetOverlays();
    }
  };
  
  setInterval(checkMidnightReset, 60000); // Check every minute
}
