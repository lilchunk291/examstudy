// Dunning-Kruger Diagnostic - Section 3.6
// Trigger before generating any study plan for the first time per subject.

export interface DiagnosticQuestion {
  id: string;
  topicArea: string;
  question: string;
  type: 'concept' | 'application' | 'edge_case';
  expectedAnswer: string;
  scoringGuide: string;
}

export interface DiagnosticResult {
  subject: string;
  topic: string;
  selfReportedCoverage: number;
  actualDiagnosticScore: number;
  calibrationGap: number;
  dunningKrugerFlag: boolean;
  recommendations: string[];
}

export interface DiagnosticSession {
  subject: string;
  questions: DiagnosticQuestion[];
  currentQuestionIndex: number;
  answers: string[];
  startTime: Date;
}

// Pre-built diagnostic questions for common subjects
const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  'Computer Science': [
    {
      id: 'cs_1',
      topicArea: 'Algorithms',
      question: 'Explain what a binary search algorithm does in your own words, not by reciting the definition.',
      type: 'concept',
      expectedAnswer: 'Should explain dividing search space in half repeatedly',
      scoringGuide: '0=No understanding, 0.2=Vague, 0.5=Partial, 0.9=Correct explanation'
    },
    {
      id: 'cs_2', 
      topicArea: 'Algorithms',
      question: 'Given an unsorted array of numbers [5, 2, 8, 1, 9], how would you find the largest number? Walk through the steps.',
      type: 'application',
      expectedAnswer: 'Iterate through array, track maximum found so far',
      scoringGuide: '0=Wrong approach, 0.2=Partially correct, 0.5=Correct approach, 0.9=Optimal solution'
    },
    {
      id: 'cs_3',
      topicArea: 'Data Structures',
      question: 'When would a linked list be better than an array, and when would it break down?',
      type: 'edge_case',
      expectedAnswer: 'Good for frequent insertions/deletions, bad for random access',
      scoringGuide: '0=No understanding, 0.2=One aspect correct, 0.5=Both aspects, 0.9=Complete with examples'
    }
  ],
  'Mathematics': [
    {
      id: 'math_1',
      topicArea: 'Calculus',
      question: 'Explain what a derivative represents in your own words, not the formal definition.',
      type: 'concept',
      expectedAnswer: 'Rate of change, slope of tangent line',
      scoringGuide: '0=No understanding, 0.2=Vague, 0.5=Partial, 0.9=Clear explanation'
    },
    {
      id: 'math_2',
      topicArea: 'Calculus',
      question: 'A car travels 60 miles in 2 hours, then stops for 30 minutes, then travels 30 miles in 1 hour. What is its average speed for the entire trip?',
      type: 'application',
      expectedAnswer: 'Total distance (90 miles) / total time (3.5 hours) = 25.7 mph',
      scoringGuide: '0=Wrong calculation, 0.2=Wrong approach, 0.5=Correct approach, 0.9=Correct answer'
    },
    {
      id: 'math_3',
      topicArea: 'Algebra',
      question: 'When does the quadratic formula fail or become unnecessary?',
      type: 'edge_case',
      expectedAnswer: 'When discriminant is negative (no real roots) or when equation is easily factorable',
      scoringGuide: '0=No understanding, 0.2=One condition, 0.5=Both conditions, 0.9=Complete explanation'
    }
  ]
};

export class DiagnosticEngine {
  private currentSession: DiagnosticSession | null = null;
  
  // Start diagnostic session for a subject
  startDiagnostic(subject: string): DiagnosticSession {
    const questions = DIAGNOSTIC_QUESTIONS[subject] || this.generateGenericQuestions(subject);
    
    this.currentSession = {
      subject,
      questions: this.shuffleArray(questions).slice(0, 3), // Use 3 questions
      currentQuestionIndex: 0,
      answers: [],
      startTime: new Date()
    };
    
    return this.currentSession;
  }
  
  // Get current question
  getCurrentQuestion(): DiagnosticQuestion | null {
    if (!this.currentSession) return null;
    if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
      return null;
    }
    
    return this.currentSession.questions[this.currentSession.currentQuestionIndex];
  }
  
  // Submit answer and move to next question
  submitAnswer(answer: string): boolean {
    if (!this.currentSession) return false;
    
    this.currentSession.answers.push(answer);
    this.currentSession.currentQuestionIndex++;
    
    // Check if diagnostic is complete
    return this.currentSession.currentQuestionIndex >= this.currentSession.questions.length;
  }
  
  // Calculate diagnostic results
  calculateResults(selfReportedCoverage: number): DiagnosticResult {
    if (!this.currentSession) {
      throw new Error('No active diagnostic session');
    }
    
    const actualScore = this.calculateActualScore();
    const calibrationGap = Math.abs(selfReportedCoverage - actualScore);
    const dunningKrugerFlag = calibrationGap > 0.3;
    
    const result: DiagnosticResult = {
      subject: this.currentSession.subject,
      topic: 'Overall understanding',
      selfReportedCoverage,
      actualDiagnosticScore: actualScore,
      calibrationGap,
      dunningKrugerFlag,
      recommendations: this.generateRecommendations(actualScore, dunningKrugerFlag, calibrationGap)
    };
    
    // Reset session
    this.currentSession = null;
    
    return result;
  }
  
  // Calculate actual score from answers
  private calculateActualScore(): number {
    if (!this.currentSession) return 0;
    
    let totalScore = 0;
    
    for (let i = 0; i < this.currentSession.answers.length; i++) {
      const answer = this.currentSession.answers[i];
      const question = this.currentSession.questions[i];
      
      const score = this.scoreAnswer(answer, question);
      totalScore += score;
    }
    
    return totalScore / this.currentSession.questions.length;
  }
  
  // Score individual answer
  private scoreAnswer(answer: string, question: DiagnosticQuestion): number {
    const normalizedAnswer = answer.toLowerCase().trim();
    
    // Simple scoring - in production would use NLP/similarity algorithms
    if (question.type === 'concept') {
      if (normalizedAnswer.includes(question.expectedAnswer.toLowerCase().split(' ')[0])) {
        return 0.9;
      } else if (normalizedAnswer.length > 20) {
        return 0.5;
      } else {
        return 0.2;
      }
    } else if (question.type === 'application') {
      if (normalizedAnswer.includes('step') || normalizedAnswer.includes('process')) {
        return 0.5;
      } else if (normalizedAnswer.includes(question.expectedAnswer.toLowerCase().split(' ')[0])) {
        return 0.9;
      } else {
        return 0.2;
      }
    } else { // edge_case
      if (normalizedAnswer.includes('when') && normalizedAnswer.length > 30) {
        return 0.5;
      } else if (normalizedAnswer.includes('break') || normalizedAnswer.includes('fail')) {
        return 0.9;
      } else {
        return 0.2;
      }
    }
  }
  
  // Generate recommendations based on results
  private generateRecommendations(actualScore: number, dunningKrugerFlag: boolean, calibrationGap: number): string[] {
    const recommendations: string[] = [];
    
    if (dunningKrugerFlag) {
      if (actualScore < 0.5) {
        recommendations.push('Your answers suggest you know less than you think. Focus on fundamentals before advanced topics.');
        recommendations.push('Practice retrieval - write down everything you know about a topic without looking at notes.');
        recommendations.push('The plan will focus on building strong foundations, not advanced concepts.');
      } else {
        recommendations.push('You know more than you think. Anxiety may be distorting your self-assessment.');
        recommendations.push('Focus on application and practice problems rather than re-reading material.');
        recommendations.push('The plan will focus on applying what you already know, not starting from scratch.');
      }
    } else {
      recommendations.push('Your self-assessment matches your actual knowledge well.');
      recommendations.push('Continue with your current approach, focusing on weaker areas identified.');
    }
    
    if (actualScore < 0.3) {
      recommendations.push('Start with basic concepts and build up gradually.');
    } else if (actualScore > 0.7) {
      recommendations.push('Focus on practice problems and application.');
    }
    
    return recommendations;
  }
  
  // Generate generic questions for subjects without predefined questions
  private generateGenericQuestions(subject: string): DiagnosticQuestion[] {
    return [
      {
        id: `${subject.toLowerCase()}_1`,
        topicArea: 'Core Concepts',
        question: `Explain the most important concept in ${subject} in your own words.`,
        type: 'concept',
        expectedAnswer: 'Should demonstrate understanding of fundamental principles',
        scoringGuide: '0=No understanding, 0.2=Vague, 0.5=Partial, 0.9=Clear explanation'
      },
      {
        id: `${subject.toLowerCase()}_2`,
        topicArea: 'Application',
        question: `How would you apply what you've learned in ${subject} to solve a practical problem?`,
        type: 'application',
        expectedAnswer: 'Should show practical application of knowledge',
        scoringGuide: '0=No application, 0.2=Vague, 0.5=Partial, 0.9=Clear application'
      },
      {
        id: `${subject.toLowerCase()}_3`,
        topicArea: 'Limitations',
        question: `When do the concepts you've learned in ${subject} break down or not apply?`,
        type: 'edge_case',
        expectedAnswer: 'Should understand limitations and edge cases',
        scoringGuide: '0=No understanding, 0.2=One limitation, 0.5=Multiple, 0.9=Complete understanding'
      }
    ];
  }
  
  // Utility function to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Get diagnostic introduction message
  getDiagnosticIntroduction(): string {
    return `Before I build your plan, I need to see where you actually are — not where you think you are. Three quick questions.

These are not graded.

This helps me create a study plan that matches your actual level, not your perceived level.`;
  }
  
  // Check if diagnostic should be triggered
  shouldTriggerDiagnostic(subject: string, previousDiagnostics: string[]): boolean {
    return !previousDiagnostics.includes(subject);
  }
}

// Export singleton instance
export const diagnosticEngine = new DiagnosticEngine();
