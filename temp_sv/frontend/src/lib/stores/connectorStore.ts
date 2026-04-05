import { writable, derived } from 'svelte/store';

export interface Connector {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'ai' | 'study' | 'note' | 'doc';
  type: 'builtin' | 'api' | 'oauth' | 'local';
  isConnected: boolean;
  isActive: boolean;
  config?: {
    apiKey?: string;
    endpoint?: string;
    model?: string;
    [key: string]: any;
  };
}

export interface ContextData {
  learnerProfile?: {
    learningStyle: string;
    personalityType: string;
    examProximity: number;
    weakAreas: string[];
  };
  currentSubject?: {
    name: string;
    topics: Array<{
      name: string;
      weight: number;
      status: string;
      hoursSpent: number;
    }>;
  };
  todaysSchedule?: Array<{
    time: string;
    activity: string;
    duration: number;
  }>;
  recentPerformance?: {
    sessionsThisWeek: number;
    retentionRate: number;
    streak: number;
  };
}

interface ConnectorState {
  connectors: Connector[];
  activeConnectorId: string | null;
  contextData: ContextData;
  isLoading: boolean;
  error: string | null;
}

function createConnectorStore() {
  const initialState: ConnectorState = {
    connectors: [
      {
        id: 'studyvault',
        name: 'StudyVault AI',
        description: 'Built-in AI assistant for study planning',
        icon: '🧠',
        category: 'ai',
        type: 'builtin',
        isConnected: true,
        isActive: true
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Google\'s advanced AI model',
        icon: '✦',
        category: 'ai',
        type: 'api',
        isConnected: false,
        isActive: false
      },
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        description: 'OpenAI\'s GPT model',
        icon: '🤖',
        category: 'ai',
        type: 'api',
        isConnected: false,
        isActive: false
      },
      {
        id: 'claude',
        name: 'Claude',
        description: 'Anthropic\'s AI assistant',
        icon: '◆',
        category: 'ai',
        type: 'api',
        isConnected: false,
        isActive: false
      },
      {
        id: 'notebooklm',
        name: 'NotebookLM',
        description: 'Google\'s AI research assistant',
        icon: '📓',
        category: 'study',
        type: 'oauth',
        isConnected: false,
        isActive: false
      },
      {
        id: 'anki',
        name: 'Anki',
        description: 'Spaced repetition flashcards',
        icon: '🔄',
        category: 'study',
        type: 'local',
        isConnected: false,
        isActive: false
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'All-in-one workspace',
        icon: '📝',
        category: 'note',
        type: 'oauth',
        isConnected: false,
        isActive: false
      },
      {
        id: 'obsidian',
        name: 'Obsidian',
        description: 'Knowledge management',
        icon: '🔮',
        category: 'note',
        type: 'local',
        isConnected: false,
        isActive: false
      },
      {
        id: 'googledrive',
        name: 'Google Drive',
        description: 'Cloud file storage',
        icon: '☁️',
        category: 'doc',
        type: 'oauth',
        isConnected: false,
        isActive: false
      }
    ],
    activeConnectorId: 'studyvault',
    contextData: {
      learnerProfile: {
        learningStyle: 'visual',
        personalityType: 'anxious_visual_achiever',
        examProximity: 14,
        weakAreas: ['Calculus', 'Physics', 'Chemistry']
      },
      currentSubject: {
        name: 'Computer Science',
        topics: [
          { name: 'Data Structures', weight: 9, status: 'in_progress', hoursSpent: 12 },
          { name: 'Algorithms', weight: 8, status: 'not_started', hoursSpent: 0 },
          { name: 'Machine Learning', weight: 7, status: 'in_progress', hoursSpent: 8 },
          { name: 'Web Development', weight: 6, status: 'completed', hoursSpent: 20 }
        ]
      },
      todaysSchedule: [
        { time: '09:00', activity: 'Study Data Structures', duration: 90 },
        { time: '11:00', activity: 'Break', duration: 30 },
        { time: '11:30', activity: 'Practice Algorithms', duration: 60 },
        { time: '14:00', activity: 'ML Concepts', duration: 45 }
      ],
      recentPerformance: {
        sessionsThisWeek: 12,
        retentionRate: 78,
        streak: 5
      }
    },
    isLoading: false,
    error: null
  };

  const { subscribe, set, update } = writable<ConnectorState>(initialState);

  // Get active connector
  const activeConnector = derived(
    { subscribe },
    ($state: ConnectorState) => {
      if (!$state.activeConnectorId) return null;
      return $state.connectors.find(c => c.id === $state.activeConnectorId) || null;
    }
  );

  // Get connectors by category
  const connectorsByCategory = derived(
    { subscribe },
    ($state: ConnectorState) => {
      const categories = {
        ai: $state.connectors.filter(c => c.category === 'ai'),
        study: $state.connectors.filter(c => c.category === 'study'),
        note: $state.connectors.filter(c => c.category === 'note'),
        doc: $state.connectors.filter(c => c.category === 'doc')
      };
      return categories;
    }
  );

  // Get current connector ID
  const currentConnectorId = derived(
    { subscribe },
    ($state: ConnectorState) => $state.activeConnectorId
  );

  // Set active connector
  function setActiveConnector(connectorId: string) {
    update(state => {
      const updatedConnectors = state.connectors.map(connector => ({
        ...connector,
        isActive: connector.id === connectorId
      }));

      return {
        ...state,
        connectors: updatedConnectors,
        activeConnectorId: connectorId
      };
    });

    saveConnectorState();
  }

  // Connect connector
  async function connectConnector(connectorId: string, config?: any) {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));

      update(state => {
        const updatedConnectors = state.connectors.map(connector => {
          if (connector.id === connectorId) {
            return {
              ...connector,
              isConnected: true,
              config: { ...connector.config, ...config }
            };
          }
          return connector;
        });

        return {
          ...state,
          connectors: updatedConnectors,
          isLoading: false
        };
      });

      saveConnectorState();
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
    }
  }

  // Disconnect connector
  function disconnectConnector(connectorId: string) {
    update(state => {
      const updatedConnectors = state.connectors.map(connector => {
        if (connector.id === connectorId) {
          return {
            ...connector,
            isConnected: false,
            isActive: false,
            config: undefined
          };
        }
        return connector;
      });

      // If disconnecting the active connector, switch to StudyVault
      const newActiveId = state.activeConnectorId === connectorId ? 'studyvault' : state.activeConnectorId;

      return {
        ...state,
        connectors: updatedConnectors.map(c => ({
          ...c,
          isActive: c.id === newActiveId
        })),
        activeConnectorId: newActiveId
      };
    });

    saveConnectorState();
  }

  // Update context data
  function updateContextData(contextData: Partial<ContextData>) {
    update(state => ({
      ...state,
      contextData: { ...state.contextData, ...contextData }
    }));

    saveContextData();
  }

  // Load connector state from IndexedDB
  async function loadConnectorState() {
    try {
      const savedState = await getConnectorStateFromDB();
      if (savedState) {
        update(state => ({
          ...state,
          connectors: savedState.connectors || state.connectors,
          activeConnectorId: savedState.activeConnectorId || state.activeConnectorId
        }));
      }

      const savedContext = await getContextDataFromDB();
      if (savedContext) {
        update(state => ({
          ...state,
          contextData: savedContext
        }));
      }
    } catch (error) {
      console.error('Failed to load connector state:', error);
    }
  }

  // Initialize without authentication for direct access
  async function initializeWithoutAuth() {
    try {
      // Set StudyVault AI as active connector by default
      setActiveConnector('studyvault');
      
      // Load any saved context data (works without auth)
      await loadConnectorState();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize connector without auth:', error);
      // Still set StudyVault AI as active even if loading fails
      setActiveConnector('studyvault');
      return false;
    }
  }

  // Helper to get current state (for saving)
  function get(): ConnectorState {
    let state: ConnectorState;
    const unsubscribe = subscribe(s => state = s);
    unsubscribe();
    return state!;
  }

  return {
    subscribe,
    activeConnector,
    connectorsByCategory,
    currentConnectorId,
    setActiveConnector,
    connectConnector,
    disconnectConnector,
    updateContextData,
    loadConnectorState,
    initializeWithoutAuth
  };
}

// IndexedDB helpers
async function getConnectorStateFromDB(): Promise<{ connectors: Connector[], activeConnectorId: string } | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['state'], 'readonly');
      const store = transaction.objectStore('state');
      const getRequest = store.get('connectors');

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state');
      }
    };
  });
}

async function saveConnectorState(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['state'], 'readwrite');
      const store = transaction.objectStore('state');
      
      // Get current state from store
      let currentState: ConnectorState = {} as ConnectorState;
      const unsubscribe = connectorStore.subscribe(s => currentState = s);
      unsubscribe();
      
      const stateToSave = {
        connectors: currentState.connectors,
        activeConnectorId: currentState.activeConnectorId
      };

      const putRequest = store.put(stateToSave, 'connectors');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

async function getContextDataFromDB(): Promise<ContextData | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['state'], 'readonly');
      const store = transaction.objectStore('state');
      const getRequest = store.get('context');

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

async function saveContextData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['state'], 'readwrite');
      const store = transaction.objectStore('state');
      
      // Get current state from store
      let currentState: ConnectorState = {} as ConnectorState;
      const unsubscribe = connectorStore.subscribe(s => currentState = s);
      unsubscribe();
      
      const putRequest = store.put(currentState.contextData, 'context');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

// API Key Management Functions
async function saveConnectorKey(connectorId: string, apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');
      
      const putRequest = store.put(apiKey, `connector_key_${connectorId}`);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
  });
}

async function getConnectorKey(connectorId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['keys'], 'readonly');
      const store = transaction.objectStore('keys');
      const getRequest = store.get(`connector_key_${connectorId}`);

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
  });
}

async function deleteConnectorKey(connectorId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultConnectors', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');
      
      const deleteRequest = store.delete(`connector_key_${connectorId}`);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

export async function validateAndConnectConnector(connectorId: string, apiKey: string): Promise<void> {
  // Import validation function based on connector type
  let validateKey: (key: string) => Promise<boolean>;
  
  switch (connectorId) {
    case 'claude':
      const { validateClaudeKey } = await import('$lib/connectors/aiConnectors/claude');
      validateKey = validateClaudeKey;
      break;
    case 'gemini':
      const { validateGeminiKey } = await import('$lib/connectors/aiConnectors/gemini');
      validateKey = validateGeminiKey;
      break;
    case 'chatgpt':
      const { validateChatGPTKey } = await import('$lib/connectors/aiConnectors/chatgpt');
      validateKey = validateChatGPTKey;
      break;
    case 'notebooklm':
      const { validateNotebookLMKey } = await import('$lib/connectors/aiConnectors/notebooklm');
      validateKey = validateNotebookLMKey;
      break;
    case 'perplexity':
      const { validatePerplexityKey } = await import('$lib/connectors/aiConnectors/perplexity');
      validateKey = validatePerplexityKey;
      break;
    case 'obsidian':
      const { validateObsidianKey } = await import('$lib/connectors/noteConnectors/obsidian');
      validateKey = validateObsidianKey;
      break;
    case 'notion':
      const { validateNotionKey } = await import('$lib/connectors/noteConnectors/notion');
      validateKey = validateNotionKey;
      break;
    // Add other connectors here
    default:
      throw new Error('Unknown connector type');
  }

  const isValid = await validateKey(apiKey);
  if (!isValid) {
    throw new Error('Invalid API key. Please check your key and try again.');
  }

  // Save the encrypted key
  await saveConnectorKey(connectorId, apiKey);
  
  // Update connector state using the store
  connectorStore.connectConnector(connectorId, { apiKey: '***' });
}

export async function disconnectConnector(connectorId: string): Promise<void> {
  // Delete the key from IndexedDB
  await deleteConnectorKey(connectorId);
  
  // Update connector state using the store
  connectorStore.disconnectConnector(connectorId);
}

export { getConnectorKey };

export const connectorStore = createConnectorStore();
