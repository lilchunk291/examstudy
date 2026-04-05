/**
 * Argumentation Theory Framework
 * Based on Dung 1995 "On the Acceptability of Arguments" Artificial Intelligence Journal Volume 77
 * 
 * Builds argument graphs from student messages and evaluates winning arguments
 * using preferred semantics to resolve conflicts between signals
 */

export interface Argument {
  id: string;
  claim: string;
  support: string[];
  strength: number;
  attacks: string[];
  defeaters: string[]; // Computed at runtime
}

export interface ArgumentationOutput {
  acceptedArguments: Argument[];
  rejectedArguments: Argument[];
  winningClaims: string[];
  reasoningTrace: string;
}

export class Argumentation {
  private arguments: Map<string, Argument> = new Map();
  private reasoningSteps: string[] = [];

  /**
   * Build argument graph from multiple evidence sources
   */
  public buildArgumentGraph(
    emotionVector: Record<string, number>,
    beliefs: Record<string, number>,
    uncertainties: Record<string, number>,
    sessionData: any,
    messageContent: string
  ): void {
    this.arguments.clear();
    this.reasoningSteps = [];
    
    // Build primary emotion arguments
    this.buildEmotionArguments(emotionVector, beliefs);
    
    // Build session behavior arguments
    this.buildSessionArguments(sessionData);
    
    // Build temporal context arguments
    this.buildTemporalArguments(sessionData);
    
    // Build content-based arguments
    this.buildContentArguments(messageContent);
    
    // Compute attack relationships
    this.computeAttackRelations();
    
    this.reasoningSteps.push(`Built argument graph with ${this.arguments.size} arguments`);
  }

  /**
   * Build arguments based on emotion vector and beliefs
   */
  private buildEmotionArguments(emotionVector: Record<string, number>, beliefs: Record<string, number>): void {
    // A1: Student is anxious
    if (emotionVector.anxious > 0.3) {
      this.addArgument({
        id: 'A1',
        claim: 'student_is_anxious',
        support: ['anxious_keywords', 'high_stress'],
        strength: emotionVector.anxious,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A1: Student is anxious (strength: ${emotionVector.anxious.toFixed(2)})`);
    }

    // A2: Student is frustrated
    if (emotionVector.frustrated > 0.3) {
      this.addArgument({
        id: 'A2',
        claim: 'student_is_frustrated',
        support: ['frustration_keywords', 'comprehension_issues'],
        strength: emotionVector.frustrated,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A2: Student is frustrated (strength: ${emotionVector.frustrated.toFixed(2)})`);
    }

    // A3: Student is tired
    if (emotionVector.tired > 0.3) {
      this.addArgument({
        id: 'A3',
        claim: 'student_is_fatigued',
        support: ['fatigue_keywords', 'low_energy'],
        strength: emotionVector.tired,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A3: Student is fatigued (strength: ${emotionVector.tired.toFixed(2)})`);
    }

    // A4: Student is confused
    if (emotionVector.confused > 0.3) {
      this.addArgument({
        id: 'A4',
        claim: 'student_is_confused',
        support: ['confusion_keywords', 'concept_gaps'],
        strength: emotionVector.confused,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A4: Student is confused (strength: ${emotionVector.confused.toFixed(2)})`);
    }

    // A5: Student is motivated
    if (emotionVector.motivated > 0.3) {
      this.addArgument({
        id: 'A5',
        claim: 'student_is_motivated',
        support: ['motivation_keywords', 'positive_energy'],
        strength: emotionVector.motivated,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A5: Student is motivated (strength: ${emotionVector.motivated.toFixed(2)})`);
    }

    // A6: Student is hopeless
    if (emotionVector.hopeless > 0.3) {
      this.addArgument({
        id: 'A6',
        claim: 'student_is_hopeless',
        support: ['hopeless_keywords', 'negative_outlook'],
        strength: emotionVector.hopeless,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A6: Student is hopeless (strength: ${emotionVector.hopeless.toFixed(2)})`);
    }

    // A7: Student is confident
    if (emotionVector.confident > 0.3) {
      this.addArgument({
        id: 'A7',
        claim: 'student_is_confident',
        support: ['confidence_keywords', 'clear_understanding'],
        strength: emotionVector.confident,
        attacks: [],
        defeaters: []
      });
      this.reasoningSteps.push(`A7: Student is confident (strength: ${emotionVector.confident.toFixed(2)})`);
    }
  }

  /**
   * Build arguments based on session data
   */
  private buildSessionArguments(sessionData: any): void {
    // B1: Student is productive (based on session count)
    if (sessionData.sessionsToday > 3) {
      this.addArgument({
        id: 'B1',
        claim: 'student_is_productive',
        support: ['multiple_sessions', 'consistent_effort'],
        strength: Math.min(sessionData.sessionsToday / 5, 1.0),
        attacks: ['A3', 'A6'], // Attacks fatigue and hopelessness
        defeaters: []
      });
      this.reasoningSteps.push(`B1: Student is productive (sessions: ${sessionData.sessionsToday})`);
    }

    // B2: Student needs break (based on session length)
    if (sessionData.sessionMinutes > 120) {
      this.addArgument({
        id: 'B2',
        claim: 'student_needs_break',
        support: ['long_session', 'diminishing_returns'],
        strength: Math.min(sessionData.sessionMinutes / 180, 1.0),
        attacks: ['A5'], // Attacks motivation (should rest)
        defeaters: []
      });
      this.reasoningSteps.push(`B2: Student needs break (session length: ${sessionData.sessionMinutes}min)`);
    }

    // B3: Student is making progress
    if (sessionData.topicsCompleted > 0) {
      this.addArgument({
        id: 'B3',
        claim: 'student_is_progressing',
        support: ['completed_topics', 'momentum'],
        strength: Math.min(sessionData.topicsCompleted / 3, 1.0),
        attacks: ['A6'], // Attacks hopelessness
        defeaters: []
      });
      this.reasoningSteps.push(`B3: Student is progressing (topics: ${sessionData.topicsCompleted})`);
    }
  }

  /**
   * Build arguments based on temporal context
   */
  private buildTemporalArguments(sessionData: any): void {
    // C1: Exam pressure is high
    if (sessionData.examProximity === 'today' || sessionData.examProximity === 'tomorrow') {
      this.addArgument({
        id: 'C1',
        claim: 'exam_pressure_high',
        support: ['imminent_exam', 'time_scarcity'],
        strength: sessionData.examProximity === 'today' ? 1.0 : 0.8,
        attacks: ['B2'], // Attacks need for break when exam is imminent
        defeaters: []
      });
      this.reasoningSteps.push(`C1: Exam pressure is high (proximity: ${sessionData.examProximity})`);
    }

    // C2: Time is sufficient
    if (sessionData.examProximity === 'next_week' || sessionData.examProximity === 'later') {
      this.addArgument({
        id: 'C2',
        claim: 'time_sufficient',
        support: ['adequate_time', 'strategic_planning_possible'],
        strength: sessionData.examProximity === 'next_week' ? 0.8 : 1.0,
        attacks: ['A1'], // Attacks anxiety when time is sufficient
        defeaters: []
      });
      this.reasoningSteps.push(`C2: Time is sufficient (proximity: ${sessionData.examProximity})`);
    }

    // C3: Late night studying
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 2) {
      this.addArgument({
        id: 'C3',
        claim: 'late_night_studying',
        support: ['unusual_hours', 'possible_fatigue'],
        strength: 0.7,
        attacks: ['A5'], // Attacks motivation (should rest)
        defeaters: []
      });
      this.reasoningSteps.push(`C3: Late night studying (hour: ${currentHour})`);
    }
  }

  /**
   * Build arguments based on message content
   */
  private buildContentArguments(messageContent: string): void {
    const text = messageContent.toLowerCase();

    // D1: Student requests help
    if (text.includes('help') || text.includes('explain') || text.includes('understand')) {
      this.addArgument({
        id: 'D1',
        claim: 'student_requests_help',
        support: ['explicit_request', 'learning_intent'],
        strength: 0.8,
        attacks: ['A6'], // Attacks hopelessness (seeking help is positive)
        defeaters: []
      });
      this.reasoningSteps.push('D1: Student requests help (explicit keywords)');
    }

    // D2: Student mentions specific topic
    const topicKeywords = ['algorithm', 'math', 'physics', 'chemistry', 'biology', 'history'];
    const hasTopic = topicKeywords.some(keyword => text.includes(keyword));
    
    if (hasTopic) {
      this.addArgument({
        id: 'D2',
        claim: 'student_has_specific_focus',
        support: ['topic_mentioned', 'targeted_learning'],
        strength: 0.6,
        attacks: ['A4'], // Attacks confusion (specific focus reduces confusion)
        defeaters: []
      });
      this.reasoningSteps.push('D2: Student has specific focus (topic mentioned)');
    }

    // D3: Student expresses understanding
    if (text.includes('get it') || text.includes('understand') || text.includes('makes sense')) {
      this.addArgument({
        id: 'D3',
        claim: 'student_shows_understanding',
        support: ['comprehension_indicators', 'positive_feedback'],
        strength: 0.7,
        attacks: ['A4', 'A6'], // Attacks confusion and hopelessness
        defeaters: []
      });
      this.reasoningSteps.push('D3: Student shows understanding (comprehension indicators)');
    }
  }

  /**
   * Add argument to the graph
   */
  private addArgument(argument: Argument): void {
    this.arguments.set(argument.id, argument);
  }

  /**
   * Compute attack relationships between arguments
   */
  private computeAttackRelations(): void {
    // Process explicit attacks defined in arguments
    for (const argument of this.arguments.values()) {
      argument.defeaters = [];
      for (const attackTarget of argument.attacks) {
        const target = this.arguments.get(attackTarget);
        if (target) {
          target.defeaters.push(argument.id);
        }
      }
    }

    // Add implicit attacks based on conflicting claims
    const conflictPairs = [
      ['A1', 'A5'], // anxious vs motivated
      ['A2', 'A7'], // frustrated vs confident
      ['A3', 'A5'], // tired vs motivated
      ['A4', 'A7'], // confused vs confident
      ['A6', 'A5'], // hopeless vs motivated
      ['A6', 'A7'], // hopeless vs confident
    ];

    for (const [arg1Id, arg2Id] of conflictPairs) {
      const arg1 = this.arguments.get(arg1Id);
      const arg2 = this.arguments.get(arg2Id);
      
      if (arg1 && arg2) {
        // Stronger argument attacks weaker one
        if (arg1.strength > arg2.strength) {
          if (!arg1.attacks.includes(arg2Id)) {
            arg1.attacks.push(arg2Id);
          }
          if (!arg2.defeaters.includes(arg1Id)) {
            arg2.defeaters.push(arg1Id);
          }
        } else if (arg2.strength > arg1.strength) {
          if (!arg2.attacks.includes(arg1Id)) {
            arg2.attacks.push(arg1Id);
          }
          if (!arg1.defeaters.includes(arg2Id)) {
            arg1.defeaters.push(arg2Id);
          }
        }
      }
    }

    this.reasoningSteps.push('Computed attack relationships between arguments');
  }

  /**
   * Evaluate arguments using preferred semantics
   * Preferred semantics: argument is accepted if it's not defeated by any accepted argument
   */
  private evaluatePreferredSemantics(): { accepted: Set<string>; rejected: Set<string> } {
    const accepted = new Set<string>();
    const rejected = new Set<string>();
    let changed = true;

    // Iterative algorithm until stable
    while (changed) {
      changed = false;
      
      for (const [id, argument] of this.arguments.entries()) {
        if (accepted.has(id) || rejected.has(id)) {
          continue; // Already evaluated
        }

        // Check if argument is defeated by any accepted argument
        const isDefeated = argument.defeaters.some(defeaterId => accepted.has(defeaterId));
        
        if (isDefeated) {
          rejected.add(id);
          changed = true;
          this.reasoningSteps.push(`Rejected ${id}: defeated by accepted argument`);
        } else {
          // Check if all defeaters are rejected
          const allDefeatersRejected = argument.defeaters.every(defeaterId => rejected.has(defeaterId));
          
          if (allDefeatersRejected) {
            accepted.add(id);
            changed = true;
            this.reasoningSteps.push(`Accepted ${id}: all defeaters rejected`);
          }
        }
      }
    }

    // Add undefeated arguments to accepted set
    for (const [id, argument] of this.arguments.entries()) {
      if (!accepted.has(id) && !rejected.has(id)) {
        const isDefeated = argument.defeaters.some(defeaterId => accepted.has(defeaterId));
        if (!isDefeated) {
          accepted.add(id);
          this.reasoningSteps.push(`Accepted ${id}: undefeated`);
        }
      }
    }

    return { accepted, rejected };
  }

  /**
   * Generate reasoning trace
   */
  private generateReasoningTrace(accepted: Set<string>, rejected: Set<string>): string {
    let trace = "ARGUMENTATION REASONING TRACE\n";
    trace += "============================\n\n";
    
    trace += "ARGUMENTS BUILT:\n";
    for (const step of this.reasoningSteps.filter(s => s.includes(':'))) {
      trace += `  • ${step}\n`;
    }
    
    trace += "\nATTACK RELATIONSHIPS:\n";
    for (const [id, argument] of this.arguments.entries()) {
      if (argument.attacks.length > 0) {
        trace += `  • ${id} attacks: ${argument.attacks.join(', ')}\n`;
      }
    }
    
    trace += "\nEVALUATION RESULTS:\n";
    trace += `  • Accepted arguments: ${accepted.size}\n`;
    trace += `  • Rejected arguments: ${rejected.size}\n`;
    
    trace += "\nACCEPTED ARGUMENTS:\n";
    for (const id of accepted) {
      const arg = this.arguments.get(id);
      if (arg) {
        trace += `  • ${id}: ${arg.claim} (strength: ${arg.strength.toFixed(2)})\n`;
      }
    }
    
    trace += "\nREJECTED ARGUMENTS:\n";
    for (const id of rejected) {
      const arg = this.arguments.get(id);
      if (arg) {
        trace += `  • ${id}: ${arg.claim} (strength: ${arg.strength.toFixed(2)})\n`;
      }
    }
    
    return trace;
  }

  /**
   * Main argumentation evaluation
   */
  public evaluateArguments(
    emotionVector: Record<string, number>,
    beliefs: Record<string, number>,
    uncertainties: Record<string, number>,
    sessionData: any,
    messageContent: string
  ): ArgumentationOutput {
    // Build argument graph
    this.buildArgumentGraph(emotionVector, beliefs, uncertainties, sessionData, messageContent);
    
    // Evaluate using preferred semantics
    const { accepted, rejected } = this.evaluatePreferredSemantics();
    
    // Extract accepted arguments and winning claims
    const acceptedArguments: Argument[] = [];
    const winningClaims: string[] = [];
    
    for (const id of accepted) {
      const argument = this.arguments.get(id);
      if (argument) {
        acceptedArguments.push(argument);
        winningClaims.push(argument.claim);
      }
    }
    
    // Extract rejected arguments
    const rejectedArguments: Argument[] = [];
    for (const id of rejected) {
      const argument = this.arguments.get(id);
      if (argument) {
        rejectedArguments.push(argument);
      }
    }
    
    // Generate reasoning trace
    const reasoningTrace = this.generateReasoningTrace(accepted, rejected);
    
    return {
      acceptedArguments,
      rejectedArguments,
      winningClaims,
      reasoningTrace
    };
  }
}
