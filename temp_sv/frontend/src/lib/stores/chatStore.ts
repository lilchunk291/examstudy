import { writable, derived } from 'svelte/store';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  metadata?: {
    connectorId?: string;
    contextUsed?: boolean;
    suggestions?: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    connectorId?: string;
    topic?: string;
  };
}

interface ChatState {
  conversations: Conversation[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

function createChatStore() {
  const initialState: ChatState = {
    conversations: [],
    currentChatId: null,
    isLoading: false,
    error: null
  };

  const { subscribe, set, update } = writable<ChatState>(initialState);

  // Load conversations from IndexedDB on init
  async function loadConversations() {
    try {
      const conversations = await getConversationsFromDB();
      update(state => ({ ...state, conversations }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  // Get current conversation
  const currentChat = derived(
    { subscribe },
    ($state: ChatState) => {
      if (!$state.currentChatId) return null;
      return $state.conversations.find(c => c.id === $state.currentChatId) || null;
    }
  );

  // Create new conversation
  function newChat() {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    update(state => ({
      ...state,
      conversations: [newConversation, ...state.conversations],
      currentChatId: newConversation.id
    }));

    saveConversationToDB(newConversation);
  }

  // Set current conversation
  function setCurrentChat(chatId: string) {
    update(state => ({ ...state, currentChatId: chatId }));
  }

  // Add message to current conversation
  function addMessage(message: Omit<Message, 'id' | 'timestamp'>): string {
    let newId = generateId();
    
    update(state => {
      if (!state.currentChatId) return state;

      const newMessage: Message = {
        ...message,
        id: newId,
        timestamp: Date.now()
      };

      const updatedConversations = state.conversations.map(conv => {
        if (conv.id === state.currentChatId) {
          const updatedMessages = [...conv.messages, newMessage];
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            updatedAt: Date.now()
          };

          // Auto-generate title from first user message
          if (conv.messages.length === 0 && message.role === 'user') {
            updatedConv.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          }

          saveConversationToDB(updatedConv);
          return updatedConv;
        }
        return conv;
      });

      return {
        ...state,
        conversations: updatedConversations
      };
    });
    
    return newId;
  }

  // Update message (for streaming)
  function updateMessage(messageId: string, updates: Partial<Message>) {
    update(state => {
      if (!state.currentChatId) return state;

      const updatedConversations = state.conversations.map(conv => {
        if (conv.id === state.currentChatId) {
          const updatedMessages = conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            updatedAt: Date.now()
          };

          saveConversationToDB(updatedConv);
          return updatedConv;
        }
        return conv;
      });

      return {
        ...state,
        conversations: updatedConversations
      };
    });
  }

  // Delete conversation
  function deleteConversation(chatId: string) {
    update(state => {
      const updatedConversations = state.conversations.filter(c => c.id !== chatId);
      
      if (state.currentChatId === chatId) {
        // Set to next available conversation or null
        const nextChat = updatedConversations[0] || null;
        return {
          ...state,
          conversations: updatedConversations,
          currentChatId: nextChat?.id || null
        };
      }

      return {
        ...state,
        conversations: updatedConversations
      };
    });

    deleteConversationFromDB(chatId);
  }

  // Clear current conversation
  function clearChat() {
    update(state => {
      if (!state.currentChatId) return state;

      const updatedConversations = state.conversations.map(conv => {
        if (conv.id === state.currentChatId) {
          const clearedConv = {
            ...conv,
            messages: [],
            title: 'New Chat',
            updatedAt: Date.now()
          };

          saveConversationToDB(clearedConv);
          return clearedConv;
        }
        return conv;
      });

      return {
        ...state,
        conversations: updatedConversations
      };
    });
  }

  // Send message (will be handled by chatbot engine)
  async function sendMessage(content: string) {
    addMessage({
      role: 'user',
      content
    });

    // The actual response will be handled by the chatbot engine
    // This just adds the user message to the store
  }

  // Initialize without authentication for direct access
  async function initializeWithoutAuth() {
    try {
      // Load conversations from IndexedDB (works without auth)
      await loadConversations();
      
      // Get current state to check if conversations exist
      let currentState: ChatState = initialState;
      subscribe(state => {
        currentState = state;
        return () => {};
      })();
      
      // Create default chat if none exists
      if (currentState.conversations.length === 0) {
        newChat();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize chat without auth:', error);
      // Still create a new chat even if DB fails
      newChat();
      return false;
    }
  }

  return {
    subscribe,
    loadConversations,
    currentChat,
    newChat,
    setCurrentChat,
    addMessage,
    updateMessage,
    deleteConversation,
    clearChat,
    sendMessage,
    initializeWithoutAuth
  };
}

// IndexedDB helpers
async function getConversationsFromDB(): Promise<Conversation[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultChat', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' });
      }
    };
  });
}

async function saveConversationToDB(conversation: Conversation): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultChat', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const putRequest = store.put(conversation);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

async function deleteConversationFromDB(chatId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyVaultChat', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const deleteRequest = store.delete(chatId);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Utility function
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const chatStore = createChatStore();
