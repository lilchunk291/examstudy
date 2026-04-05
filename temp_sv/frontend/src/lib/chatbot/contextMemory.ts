import type { Message } from '$lib/stores/chatStore';

interface ContextMemoryData {
  subjectMentions: Map<string, number>;
  examProximityStatements: number[];
  repeatedConcerns: Map<string, number>;
  conversationTurns: number;
  lastTopics: string[];
}

export class ContextMemory {
  private memory: ContextMemoryData = {
    subjectMentions: new Map(),
    examProximityStatements: [],
    repeatedConcerns: new Map(),
    conversationTurns: 0,
    lastTopics: []
  };

  /**
   * Update memory with new message
   */
  updateMemory(message: Message): void {
    this.conversationTurns++;
    
    // Extract subject mentions
    this.extractSubjectMentions(message.content);
    
    // Track exam proximity statements
    this.trackExamProximity(message.content);
    
    // Track repeated concerns
    this.trackRepeatedConcerns(message.content);
    
    // Update last topics
    this.updateLastTopics(message.content);
  }

  /**
   * Extract and track subject mentions
   */
  private extractSubjectMentions(content: string): void {
    const subjects = [
      'math', 'calculus', 'algebra', 'geometry', 'statistics',
      'physics', 'chemistry', 'biology', 'science',
      'computer science', 'programming', 'coding', 'algorithms', 'data structures',
      'history', 'english', 'literature', 'writing',
      'economics', 'psychology', 'sociology',
      'art', 'music', 'physical education'
    ];

    const normalizedContent = content.toLowerCase();
    
    for (const subject of subjects) {
      if (normalizedContent.includes(subject)) {
        const currentCount = this.memory.subjectMentions.get(subject) || 0;
        this.memory.subjectMentions.set(subject, currentCount + 1);
      }
    }
  }

  /**
   * Track exam proximity statements
   */
  private trackExamProximity(content: string): void {
    const examPatterns = [
      /(\d+)\s*(days?|weeks?)\s*(until|before|till|to)\s*(exam|test|final|midterm)/gi,
      /exam\s*(is|in|coming)\s*(\d+)\s*(days?|weeks?)/gi,
      /(\d+)\s*(days?|weeks?)\s*(left|remaining)\s*(for|until)\s*(exam|test)/gi
    ];

    for (const pattern of examPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const numberMatch = match.match(/(\d+)/);
          if (numberMatch) {
            const days = parseInt(numberMatch[1]);
            this.memory.examProximityStatements.push(days);
          }
        }
      }
    }
  }

  /**
   * Track repeated concerns
   */
  private trackRepeatedConcerns(content: string): void {
    const concernPatterns = [
      { pattern: /can't|cannot|unable to/g, concern: 'inability' },
      { pattern: /don't understand|confused|lost/g, concern: 'confusion' },
      { pattern: /too much|overwhelmed|stressed/g, concern: 'overwhelm' },
      { pattern: /procrastinate|putting off|delay/g, concern: 'procrastination' },
      { pattern: /anxious|worried|nervous/g, concern: 'anxiety' },
      { pattern: /tired|exhausted|burnout/g, concern: 'fatigue' },
      { pattern: /motivation|motivated/g, concern: 'motivation' },
      { pattern: /time|schedule|planning/g, concern: 'time_management' }
    ];

    for (const { pattern, concern } of concernPatterns) {
      if (pattern.test(content)) {
        const currentCount = this.memory.repeatedConcerns.get(concern) || 0;
        this.memory.repeatedConcerns.set(concern, currentCount + 1);
      }
    }
  }

  /**
   * Update last topics mentioned
   */
  private updateLastTopics(content: string): void {
    // Extract key topics (simplified - in production would use NLP)
    const topics = this.extractTopics(content);
    
    // Add to last topics (keep last 10)
    this.memory.lastTopics = [...this.memory.lastTopics, ...topics].slice(-10);
  }

  /**
   * Extract topics from content (simplified)
   */
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    
    // Look for topic indicators
    const topicIndicators = [
      'about', 'regarding', 'concerning', 'related to',
      'studying', 'learning', 'working on', 'focusing on',
      'help with', 'need help', 'struggling with'
    ];

    const words = content.toLowerCase().split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check if this is a topic indicator
      if (topicIndicators.includes(word)) {
        // Get the next few words as the topic
        const topicWords = words.slice(i + 1, i + 4).join(' ');
        if (topicWords.length > 2) {
          topics.push(topicWords);
        }
      }
    }

    return topics;
  }

  /**
   * Detect if a concern has been repeated 3+ times
   */
  detectRepeatedConcern(): string | null {
    for (const [concern, count] of this.memory.repeatedConcerns.entries()) {
      if (count >= 3) {
        return concern;
      }
    }
    return null;
  }

  /**
   * Generate natural reference to past conversation
   */
  addContextReferences(response: string, conversationHistory: Message[]): string {
    let enhancedResponse = response;

    // Check for repeated concerns
    const repeatedConcern = this.detectRepeatedConcern();
    if (repeatedConcern) {
      enhancedResponse = this.addRepeatedConcernReference(enhancedResponse, repeatedConcern);
    }

    // Add subject continuity
    enhancedResponse = this.addSubjectContinuity(enhancedResponse);

    // Add exam proximity reference
    enhancedResponse = this.addExamProximityReference(enhancedResponse);

    return enhancedResponse;
  }

  /**
   * Add reference to repeated concern
   */
  private addRepeatedConcernReference(response: string, concern: string): string {
    const references = {
      inability: "I've noticed you've mentioned feeling stuck a few times. Let's try a different approach this time.",
      confusion: "This seems to be a recurring theme of confusion. Let me try explaining it in a completely different way.",
      overwhelm: "I sense you've been feeling overwhelmed in our conversations. Let's break this down into very small, manageable steps.",
      procrastination: "I know procrastination has come up before. Let's focus on one tiny action you can take right now.",
      anxiety: "I can see anxiety has been a theme in our conversations. Let's work with that feeling rather than against it.",
      fatigue: "You've mentioned feeling tired several times. Let's make sure we're not adding to your mental load.",
      motivation: "I notice motivation comes up often. Let's reconnect with what matters to you about this subject.",
      time_management: "Time management seems to be an ongoing challenge. Let's find a solution that actually works for your schedule."
    };

    const reference = references[concern as keyof typeof references];
    if (reference && Math.random() > 0.5) { // Only add 50% of the time
      return `${reference} ${response}`;
    }

    return response;
  }

  /**
   * Add subject continuity reference
   */
  private addSubjectContinuity(response: string): string {
    const topSubjects = Array.from(this.memory.subjectMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topSubjects.length > 0 && Math.random() > 0.6) { // Only add 40% of the time
      const topSubject = topSubjects[0][0];
      return `${response} Since we've been discussing ${topSubject} quite a bit, let's build on that foundation.`;
    }

    return response;
  }

  /**
   * Add exam proximity reference
   */
  private addExamProximityReference(response: string): string {
    if (this.memory.examProximityStatements.length > 0 && Math.random() > 0.7) { // Only add 30% of the time
      const avgDays = this.memory.examProximityStatements.reduce((a, b) => a + b, 0) / this.memory.examProximityStatements.length;
      
      if (avgDays < 7) {
        return `${response} With your exam being so close, let's focus on what will give you the biggest return on your time.`;
      } else if (avgDays < 14) {
        return `${response} Given your exam is coming up, let's make sure we're using our time efficiently.`;
      }
    }

    return response;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): any {
    return {
      conversationTurns: this.memory.conversationTurns,
      topSubjects: Array.from(this.memory.subjectMentions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topConcerns: Array.from(this.memory.repeatedConcerns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      avgExamProximity: this.memory.examProximityStatements.length > 0 
        ? this.memory.examProximityStatements.reduce((a, b) => a + b, 0) / this.memory.examProximityStatements.length
        : null,
      recentTopics: this.memory.lastTopics.slice(-5)
    };
  }

  /**
   * Clear memory (for new conversations)
   */
  clearMemory(): void {
    this.memory = {
      subjectMentions: new Map(),
      examProximityStatements: [],
      repeatedConcerns: new Map(),
      conversationTurns: 0,
      lastTopics: []
    };
  }

  /**
   * Save memory to IndexedDB
   */
  async saveMemory(conversationId: string): Promise<void> {
    // Implementation would save to IndexedDB
    // For now, just log
    console.log(`Saving memory for conversation ${conversationId}:`, this.getMemoryStats());
  }

  /**
   * Load memory from IndexedDB
   */
  async loadMemory(conversationId: string): Promise<void> {
    // Implementation would load from IndexedDB
    // For now, just log
    console.log(`Loading memory for conversation ${conversationId}`);
  }
}

export const contextMemory = new ContextMemory();
