// Behavioral Emotion Inference - Section 3.2
// Infer emotional state from behavior. Never ask. Never display to student.
// Use only to adjust response tone internally.

export interface BehavioralSignals {
  sessionStartHour: number;            // 0-23
  examProximityHours: number;
  messageLength: number;               // character count
  messageWords: string[];
  abandonedSessionsToday: number;
  rescheduleCount: number;
  appOpenCount: number;
  lastStudySessionHoursAgo: number;
}

export interface InferredState {
  stressLevel: number;     // 0 to 1
  fatigueLevel: number;    // 0 to 1
  motivationLevel: number; // 0 to 1
}

export function inferBehavioralState(signals: BehavioralSignals): InferredState {
  const stressLevel = calculateStressLevel(signals);
  const fatigueLevel = calculateFatigueLevel(signals);
  const motivationLevel = calculateMotivationLevel(signals);
  
  return {
    stressLevel,
    fatigueLevel,
    motivationLevel
  };
}

function calculateStressLevel(signals: BehavioralSignals): number {
  let stressScore = 0;
  
  // High stress signals
  if (signals.sessionStartHour > 22) stressScore += 0.3;
  if (signals.examProximityHours < 24) stressScore += 0.4;
  if (signals.examProximityHours < 3) stressScore += 0.2;
  if (signals.messageLength < 20) stressScore += 0.1;
  if (signals.appOpenCount > 6 && signals.abandonedSessionsToday > 3) stressScore += 0.3;
  
  // Additional stress indicators from message content
  const stressWords = ['stressed', 'anxious', 'overwhelmed', 'panic', 'worried', 'freaking', 'cant', 'can\'t'];
  const stressWordCount = signals.messageWords.filter(word => 
    stressWords.some(stressWord => word.toLowerCase().includes(stressWord))
  ).length;
  stressScore += Math.min(stressWordCount * 0.1, 0.3);
  
  return Math.min(stressScore, 1.0);
}

function calculateFatigueLevel(signals: BehavioralSignals): number {
  let fatigueScore = 0;
  
  // High fatigue signals
  if (signals.sessionStartHour > 1) fatigueScore += 0.4;
  if (signals.lastStudySessionHoursAgo > 8) fatigueScore += 0.2;
  if (signals.lastStudySessionHoursAgo > 24) fatigueScore += 0.3;
  
  // Fatigue indicators from message content
  const fatigueWords = ['tired', 'exhausted', 'burnt', 'burned', 'sleepy', 'drained', 'blank'];
  const fatigueWordCount = signals.messageWords.filter(word => 
    fatigueWords.some(fatigueWord => word.toLowerCase().includes(fatigueWord))
  ).length;
  fatigueScore += Math.min(fatigueWordCount * 0.15, 0.4);
  
  return Math.min(fatigueScore, 1.0);
}

function calculateMotivationLevel(signals: BehavioralSignals): number {
  let motivationScore = 1.0; // Start with high motivation
  
  // Low motivation signals (subtract from score)
  if (signals.abandonedSessionsToday > 2) motivationScore -= 0.3;
  if (signals.rescheduleCount > 3) motivationScore -= 0.2;
  if (signals.abandonedSessionsToday > 5) motivationScore -= 0.2;
  
  // Motivation indicators from message content
  const lowMotivationWords = ['pointless', 'useless', 'doesn\'t matter', 'waste', 'give up', 'quit'];
  const lowMotivationWordCount = signals.messageWords.filter(word => 
    lowMotivationWords.some(lowWord => word.toLowerCase().includes(lowWord))
  ).length;
  motivationScore -= Math.min(lowMotivationWordCount * 0.2, 0.5);
  
  return Math.max(motivationScore, 0.0);
}

// Tone adjustment based on stress level - Section 3.3
export interface ToneGuidelines {
  maxLength: number;        // maximum sentences per response
  maxOptions: number;       // maximum strategy options to offer
  explanationLevel: 'full' | 'medium' | 'minimal';
  responseStyle: 'conversational' | 'direct' | 'terse';
}

export function getToneGuidelines(inferredState: InferredState): ToneGuidelines {
  const { stressLevel } = inferredState;
  
  if (stressLevel < 0.3) {
    // Low stress: Full explanations, multiple options
    return {
      maxLength: 8,
      maxOptions: 3,
      explanationLevel: 'full',
      responseStyle: 'conversational'
    };
  } else if (stressLevel < 0.6) {
    // Medium stress: Focused, structured, limited options
    return {
      maxLength: 5,
      maxOptions: 2,
      explanationLevel: 'medium',
      responseStyle: 'direct'
    };
  } else if (stressLevel < 0.8) {
    // High stress: Short sentences, one instruction at a time
    return {
      maxLength: 3,
      maxOptions: 1,
      explanationLevel: 'minimal',
      responseStyle: 'direct'
    };
  } else {
    // Very high stress: Three sentences maximum, single instruction
    return {
      maxLength: 3,
      maxOptions: 1,
      explanationLevel: 'minimal',
      responseStyle: 'terse'
    };
  }
}

// Helper function to extract behavioral signals from current context
export function extractBehavioralSignals(context: any): BehavioralSignals {
  const now = new Date();
  const currentHour = now.getHours();
  
  return {
    sessionStartHour: currentHour,
    examProximityHours: context.examHoursRemaining || 168, // Default to 1 week
    messageLength: context.currentMessage?.length || 0,
    messageWords: context.currentMessage?.split(/\s+/) || [],
    abandonedSessionsToday: context.abandonedSessionsCount || 0,
    rescheduleCount: context.rescheduleCount || 0,
    appOpenCount: context.appOpenCount || 1,
    lastStudySessionHoursAgo: context.lastStudySession ? 
      (now.getTime() - new Date(context.lastStudySession).getTime()) / (1000 * 60 * 60) : 24
  };
}

// Apply tone guidelines to response
export function applyToneGuidelines(response: string, guidelines: ToneGuidelines): string {
  let sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Limit sentence count
  if (sentences.length > guidelines.maxLength) {
    sentences = sentences.slice(0, guidelines.maxLength);
    response = sentences.join('. ') + '.';
  }
  
  // Adjust explanation level
  if (guidelines.explanationLevel === 'minimal') {
    // Remove explanatory phrases
    response = response
      .replace(/this is because|the reason is|in other words|to put it simply/gi, '')
      .replace(/which means|that is|essentially/gi, '');
  } else if (guidelines.explanationLevel === 'medium') {
    // Keep some explanation but trim
    response = response
      .replace(/in other words|to put it another way|for example/gi, '')
      .replace(/\([^)]*\)/g, ''); // Remove parenthetical explanations
  }
  
  // Adjust response style
  if (guidelines.responseStyle === 'terse') {
    // Make sentences very direct
    response = response
      .replace(/I think|I believe|I would suggest/gi, '')
      .replace(/you might want to|perhaps you could/gi, '')
      .replace(/it would be helpful to/gi, '');
  }
  
  return response.trim();
}
