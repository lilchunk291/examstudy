// Maladaptive Pattern Detection - Section 3.7
// Detect from IndexedDB behavioral signals

export interface BehavioralSignals {
  sessionHistory: Array<{
    date: string;
    startTime: string;
    duration: number;
    topic: string;
    completed: boolean;
    type: string;
  }>;
  appOpenCount: number;
  abandonedSessionsToday: number;
  rescheduleCount: number;
  lastStudySession: string | null;
  currentTopic: string;
  planningRevisions: number;
  messageHistory: Array<{
    timestamp: string;
    content: string;
    type: string;
  }>;
}

export interface PatternDetection {
  patternType: string;
  confidence: number;
  intervention: string;
  description: string;
}

export class PatternDetector {
  
  detectPatterns(signals: BehavioralSignals): PatternDetection[] {
    const patterns: PatternDetection[] = [];
    
    // Check each maladaptive pattern
    patterns.push(this.detectArousalProcrastinator(signals));
    patterns.push(this.detectAvoidanceProcrastinator(signals));
    patterns.push(this.detectPerfectionistProcrastinator(signals));
    patterns.push(this.detectDecisionalProcrastinator(signals));
    patterns.push(this.detectBoomBust(signals));
    patterns.push(this.detectPseudoStudying(signals));
    patterns.push(this.detectAnxietyParalysis(signals));
    patterns.push(this.detectPlanningAddiction(signals));
    patterns.push(this.detectLearnedHelplessness(signals));
    patterns.push(this.detectFalseConfidence(signals));
    
    // Filter out patterns with low confidence
    return patterns.filter(pattern => pattern.confidence >= 0.6);
  }
  
  // 1. Arousal Procrastinator
  private detectArousalProcrastinator(signals: BehavioralSignals): PatternDetection {
    const recentSessions = this.getRecentSessions(signals.sessionHistory, 48); // Last 48 hours
    const deadlineSessions = this.getDeadlineSessions(recentSessions);
    
    const confidence = deadlineSessions.length >= 3 ? 0.8 : 0.3;
    
    return {
      patternType: 'arousal_procrastinator',
      confidence,
      intervention: 'Work with it. Compressed 3-day plan with hard trip-wire. If not started by trip-wire date, crisis mode activates automatically.',
      description: 'Sessions cluster within 48h of deadlines. Adequate results despite late start.'
    };
  }
  
  // 2. Avoidance Procrastinator
  private detectAvoidanceProcrastinator(signals: BehavioralSignals): PatternDetection {
    const topicReschedules = this.countTopicReschedules(signals.sessionHistory, signals.currentTopic);
    const dreadLanguage = this.detectDreadLanguage(signals.messageHistory, signals.currentTopic);
    
    const confidence = (topicReschedules >= 3 && dreadLanguage) ? 0.9 : 
                     (topicReschedules >= 2 || dreadLanguage) ? 0.6 : 0.2;
    
    return {
      patternType: 'avoidance_procrastinator',
      confidence,
      intervention: '5-minute entry point only. Show only next single step. "You don\'t have to study X today. Just open your notes and read the first page. Set a timer for 5 minutes. You can stop after that."',
      description: 'Same topic rescheduled 3+ times. Dread language about that topic.'
    };
  }
  
  // 3. Perfectionist Procrastinator
  private detectPerfectionistProcrastinator(signals: BehavioralSignals): PatternDetection {
    const setupOnlySessions = signals.sessionHistory.filter(s => 
      s.type === 'setup' || s.duration < 10
    ).length;
    
    const retrievalPractice = signals.sessionHistory.filter(s => 
      s.type === 'retrieval' || s.type === 'practice'
    ).length;
    
    const methodQuestions = this.countMethodQuestions(signals.messageHistory);
    
    const confidence = (setupOnlySessions >= 5 && retrievalPractice === 0 && methodQuestions >= 3) ? 0.9 : 0.3;
    
    return {
      patternType: 'perfectionist_procrastinator',
      confidence,
      intervention: 'Remove all options. One specific instruction. No alternatives. "You are not choosing the method. Here is the only thing you are doing for the next 25 minutes: [exact task]"',
      description: 'Logs show setup only. Zero retrieval practice. Asks about best method repeatedly.'
    };
  }
  
  // 4. Decisional Procrastinator
  private detectDecisionalProcrastinator(signals: BehavioralSignals): PatternDetection {
    const whatShouldIStudy = this.countPhraseOccurrences(signals.messageHistory, 'what should i study');
    const topicOrderChanges = this.countTopicOrderChanges(signals.sessionHistory);
    
    const confidence = (whatShouldIStudy >= 3 && topicOrderChanges >= 3) ? 0.8 : 0.3;
    
    return {
      patternType: 'decisional_procrastinator',
      confidence,
      intervention: 'Lock the order permanently. No more revision allowed. "You are not choosing the order anymore. The system decided. [Topic X] first. Not [Y]. Not [Z]. Order is locked."',
      description: 'Asks "what should I study first" 3+ times. Changes topic order frequently.'
    };
  }
  
  // 5. Boom Bust
  private detectBoomBust(signals: BehavioralSignals): PatternDetection {
    const last7Days = this.getRecentSessions(signals.sessionHistory, 168); // 7 days
    const dailyHours = this.calculateDailyHours(last7Days);
    const variance = this.calculateVariance(dailyHours);
    
    const confidence = variance > 4 ? 0.8 : 0.3;
    
    return {
      patternType: 'boom_bust',
      confidence,
      intervention: 'Cap sessions at 3 hours. Enforce strictly. When student exceeds 3h: "You have hit your daily limit. Stop now. Tomorrow depends on how well you rest tonight."',
      description: 'Study hours variance > 4x across 7 days. Zero days follow 6+ hour days.'
    };
  }
  
  // 6. Pseudo Studying
  private detectPseudoStudying(signals: BehavioralSignals): PatternDetection {
    const longSessions = signals.sessionHistory.filter(s => s.duration >= 60);
    const practiceSessions = signals.sessionHistory.filter(s => 
      s.type === 'practice' || s.type === 'retrieval' || s.type === 'past_paper'
    );
    
    const confidence = (longSessions.length >= 3 && practiceSessions.length === 0) ? 0.9 : 0.3;
    
    return {
      patternType: 'pseudo_studying',
      confidence,
      intervention: 'Ban passive methods. "Reading your notes again will not help. You have read them. Close everything. Open a blank page. Write everything you know about [topic] from memory."',
      description: 'Long sessions (60+ min). Diagnostic scores not improving. Session type always reading/watching. Never practice/testing.'
    };
  }
  
  // 7. Anxiety Paralysis
  private detectAnxietyParalysis(signals: BehavioralSignals): PatternDetection {
    const distressedMessages = signals.messageHistory.filter(m => 
      this.containsDistressLanguage(m.content)
    );
    
    const confidence = (signals.appOpenCount >= 5 && distressedMessages.length >= 2 && signals.abandonedSessionsToday >= 5) ? 0.9 : 0.3;
    
    return {
      patternType: 'anxiety_paralysis',
      confidence,
      intervention: 'Physiological regulation before study content. "Try this first. Breathe in for 4 counts. Hold for 7. Out for 8. Do it 4 times. It directly reduces cortisol. Then one small topic. 20 minutes only."',
      description: 'App opened 5+ times in one day. No sessions started. Short distressed messages.'
    };
  }
  
  // 8. Planning Addiction
  private detectPlanningAddiction(signals: BehavioralSignals): PatternDetection {
    const confidence = (signals.planningRevisions >= 3 && signals.abandonedSessionsToday === 0) ? 0.8 : 0.3;
    
    return {
      patternType: 'planning_addiction',
      confidence,
      intervention: 'Lock plan for 24 hours. Disable revision feature. "You are not revising the plan today. Open your notes. Start."',
      description: 'Plan revised 3+ times in one day. High open time. Very low session log rate.'
    };
  }
  
  // 9. Learned Helplessness
  private detectLearnedHelplessness(signals: BehavioralSignals): PatternDetection {
    const helplessLanguage = this.countHelplessLanguage(signals.messageHistory);
    const confidence = helplessLanguage >= 3 ? 0.8 : 0.3;
    
    return {
      patternType: 'learned_helplessness',
      confidence,
      intervention: 'Do not argue. Do not reassure. Show contradicting evidence. "You said you can\'t understand algorithms. You answered the graph traversal question correctly. That is an algorithm. Here is what your actual data shows:" [show their correct answers]',
      description: 'Language: "always fail" "can\'t" "pointless" "doesn\'t matter"'
    };
  }
  
  // 10. False Confidence
  private detectFalseConfidence(signals: BehavioralSignals): PatternDetection {
    const daysSinceLastSession = signals.lastStudySession ? 
      this.calculateDaysSince(new Date(signals.lastStudySession)) : 999;
    
    const confidence = (daysSinceLastSession >= 5 && signals.abandonedSessionsToday === 0) ? 0.7 : 0.3;
    
    return {
      patternType: 'false_confidence',
      confidence,
      intervention: 'Trigger diagnostic immediately. "Before we finalize your plan, three quick calibration questions."',
      description: 'Self-reported coverage high. Practice attempts zero. Past paper attempts zero. Last session 5+ days ago.'
    };
  }
  
  // Helper methods
  private getRecentSessions(sessions: any[], hours: number): any[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return sessions.filter(s => new Date(s.date) >= cutoff);
  }
  
  private getDeadlineSessions(sessions: any[]): any[] {
    // Simplified - in production would check actual deadlines
    return sessions.filter(s => s.completed && s.duration > 30);
  }
  
  private countTopicReschedules(sessions: any[], topic: string): number {
    return sessions.filter(s => s.topic === topic && !s.completed).length;
  }
  
  private detectDreadLanguage(messages: any[], topic: string): boolean {
    const dreadWords = ['hate', 'dread', 'avoid', 'can\'t stand', 'terrible'];
    return messages.some(m => 
      m.content.toLowerCase().includes(topic.toLowerCase()) &&
      dreadWords.some(word => m.content.toLowerCase().includes(word))
    );
  }
  
  private countMethodQuestions(messages: any[]): number {
    const methodPhrases = ['best method', 'how should i', 'what method', 'which approach'];
    return messages.filter(m => 
      methodPhrases.some(phrase => m.content.toLowerCase().includes(phrase))
    ).length;
  }
  
  private countPhraseOccurrences(messages: any[], phrase: string): number {
    return messages.filter(m => m.content.toLowerCase().includes(phrase)).length;
  }
  
  private countTopicOrderChanges(sessions: any[]): number {
    // Simplified - would track actual topic sequence changes
    return Math.floor(sessions.length / 3);
  }
  
  private calculateDailyHours(sessions: any[]): number[] {
    const dailyMap = new Map<string, number>();
    
    sessions.forEach(session => {
      const date = session.date.split('T')[0];
      const hours = (session.duration || 0) / 60;
      dailyMap.set(date, (dailyMap.get(date) || 0) + hours);
    });
    
    return Array.from(dailyMap.values());
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return Math.sqrt(variance);
  }
  
  private containsDistressLanguage(content: string): boolean {
    const distressWords = ['can\'t', 'stuck', 'lost', 'overwhelmed', 'panic', 'freaking'];
    return distressWords.some(word => content.toLowerCase().includes(word));
  }
  
  private countHelplessLanguage(messages: any[]): number {
    const helplessPhrases = ['always fail', 'can\'t', 'pointless', 'doesn\'t matter', 'never work'];
    return messages.filter(m => 
      helplessPhrases.some(phrase => m.content.toLowerCase().includes(phrase))
    ).length;
  }
  
  private calculateDaysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
export const patternDetector = new PatternDetector();
