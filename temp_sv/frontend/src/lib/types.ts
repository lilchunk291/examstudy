export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: {
    connectorId?: string;
    contextUsed?: boolean;
    suggestions?: string[];
  };
}

export interface StudentContext {
  learnerProfile: {
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

export interface ConnectorResponse {
  content: string;
  isStreaming?: boolean;
  metadata?: {
    algorithm?: string;
    confidence?: number;
    reasoning?: string;
  };
}
