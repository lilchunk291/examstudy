/**
 * Case-Based Reasoning System
 * Based on Aamodt and Plaza 1994 "Case-Based Reasoning Foundational Issues" AI Communications Volume 7
 * 
 * Implements the CBR cycle: Retrieve, Reuse, Revise, Retain
 * Retrieves most similar past cases and adapts them to current situation
 */

import caseLibrary from '../data/initialCaseLibrary.json';

export interface Case {
  id: string;
  problem: {
    emotion: string;
    intent: string;
    examProximity: string;
    learnerType: string;
    sessionMinutes: number;
    topicDifficulty: number;
    winningClaims: string[];
  };
  solution: {
    strategy: string;
    tone: string;
    responseTemplate: string;
    followUpQuestion: string | null;
  };
  outcome: {
    studentRating: number;
    retentionImprovement: number;
    sessionContinued: boolean;
  };
}

export interface CBROutput {
  adaptedResponse: string;
  caseId: string;
  similarityScore: number;
  wasExactMatch: boolean;
}

export class CaseBasedReasoning {
  private caseLibrary: Case[] = [];
  private studentCases: Case[] = []; // Cases retained from student interactions

  /**
   * Initialize CBR system with initial case library
   */
  constructor() {
    this.caseLibrary = caseLibrary as Case[];
    console.log(`[CBR] loaded ${this.caseLibrary.length} cases`);
  }

  /**
   * RETRIEVE phase: Find most similar cases
   */
  private retrieveSimilarCases(currentProblem: Case['problem']): Case[] {
    const allCases = [...this.caseLibrary, ...this.studentCases];
    
    // Calculate similarity scores for all cases
    const casesWithSimilarity = allCases.map(caseItem => ({
      case: caseItem,
      similarity: this.calculateSimilarity(currentProblem, caseItem.problem)
    }));

    // Sort by similarity (highest first) and return top 3
    // Filter by minimum similarity threshold (0.25 = 25%)
    const filteredCases = casesWithSimilarity
      .filter(item => item.similarity >= 0.25)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.case);
    
    return filteredCases;
  }

  /**
   * Main CBR processing method
   */
  public async process(
    currentProblem: Case['problem'],
    studentContext: any,
    userInput?: string
  ): Promise<CBROutput> {
    try {
      // RETRIEVE phase
      const similarCases = this.retrieveSimilarCases(currentProblem);
      
      if (similarCases.length === 0) {
        return {
          adaptedResponse: this.buildFallbackResponse(userInput || ""),
          caseId: 'fallback_' + Date.now(),
          similarityScore: 0,
          wasExactMatch: false
        };
      }
      
      const retrievedCase = similarCases[0];
      const similarityScore = this.calculateSimilarity(currentProblem, retrievedCase.problem);
      
      // REUSE phase
      const adaptedResponse = this.adaptCaseSolution(retrievedCase, currentProblem, studentContext);
      
      return {
        adaptedResponse,
        caseId: retrievedCase.id,
        similarityScore,
        wasExactMatch: similarityScore > 0.9
      };
    } catch (error) {
      console.error('[CBR] Critical error:', error);
      return {
        adaptedResponse: this.buildFallbackResponse(userInput || ""),
        caseId: 'error_fallback_' + Date.now(),
        similarityScore: 0,
        wasExactMatch: false
      };
    }
  }

  /**
   * Build fallback response when no cases match
   */
  private buildFallbackResponse(message: string): string {
    const m = message.toLowerCase()
    if (m.includes('plan') || m.includes('schedule'))
        return "What subject and when is your exam? I can build your plan from there."
    if (m.includes('help') || m.includes('stuck') || m.includes('understand'))
        return "Tell me the specific topic you are stuck on and I will give you a concrete approach."
    if (m.includes('stress') || m.includes('panic') || m.includes('fail'))
        return "Okay. What is your exam and when is it? That is all I need right now."
    if (m.includes('tired') || m.includes('motivat') || m.includes('give up'))
        return "Got it. What subject? I will give you the smallest possible session that still moves the needle."
    return "What are you studying and what do you need help with right now?"
  }

  /**
   * Calculate similarity between two problem descriptions
   */
  private calculateSimilarity(problem1: Case['problem'], problem2: Case['problem']): number {
    let score = 0;
    
    // Emotion match (30%)
    if (problem1.emotion === problem2.emotion) score += 0.3;
    
    // Intent match (25%)
    if (problem1.intent === problem2.intent) score += 0.25;
    
    // Exam proximity match (20%)
    if (problem1.examProximity === problem2.examProximity) score += 0.2;
    
    // Learner type match (15%)
    if (problem1.learnerType === problem2.learnerType) score += 0.15;
    
    // Session minutes similarity (10%)
    const minutesDiff = Math.abs(problem1.sessionMinutes - problem2.sessionMinutes);
    const minutesSimilarity = Math.max(0, 1 - minutesDiff / 180); // 3 hours = full similarity
    score += minutesSimilarity * 0.1;
    
    return score;
  }

  /**
   * REUSE phase: Adapt case solution to current situation
   */
  private adaptCaseSolution(
    retrievedCase: Case,
    currentProblem: Case['problem'],
    studentContext: any
  ): string {
    let adaptedResponse = retrievedCase.solution.responseTemplate;
    
    // Replace dynamic slots with current context
    adaptedResponse = this.replaceTemplateSlots(adaptedResponse, currentProblem, studentContext);
    
    // Apply natural language processing
    adaptedResponse = this.applyNaturalLanguageLayer(adaptedResponse, retrievedCase.solution.tone);
    
    return adaptedResponse;
  }

  /**
   * Replace template slots with actual values
   */
  private replaceTemplateSlots(
    template: string,
    currentProblem: Case['problem'],
    studentContext: any
  ): string {
    let result = template;
    
    // Replace common slots
    result = result.replace(/{emotion}/g, currentProblem.emotion);
    result = result.replace(/{intent}/g, currentProblem.intent);
    result = result.replace(/{exam_proximity}/g, currentProblem.examProximity);
    result = result.replace(/{learner_type}/g, currentProblem.learnerType);
    result = result.replace(/{session_minutes}/g, currentProblem.sessionMinutes.toString());
    result = result.replace(/{topic_difficulty}/g, currentProblem.topicDifficulty.toString());
    result = result.replace(/{weak_subject}/g, studentContext.weakSubject || 'your weakest subject');
    result = result.replace(/{recommended_minutes}/g, studentContext.recommendedMinutes || '30');
    result = result.replace(/{concept}/g, studentContext.currentTopic || 'this concept');
    result = result.replace(/{visual_metaphor}/g, 'a complex machine with interlocking gears');
    result = result.replace(/{key_component}/g, 'core mechanism');
    result = result.replace(/{metaphor_component}/g, 'primary gear');
    result = result.replace(/{flow_description}/g, 'how information travels through each layer of the system');
    
    return result;
  }

  /**
   * Apply natural language processing layer
   */
  private applyNaturalLanguageLayer(text: string, tone: string): string {
    let result = text;
    
    // Add emotional opening based on tone
    if (tone === 'warm') {
      const openings = [
        "I understand this is stressful. ",
        "That sounds really challenging. ",
        "I can see why you'd feel that way. "
      ];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      result = opening + result;
    }
    
    if (tone === 'direct') {
      const openings = [
        "Here's what we need to do. ",
        "Let's be direct about this. ",
        "Time to focus on what works. "
      ];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      result = opening + result;
    }
    
    if (tone === 'calm') {
      const openings = [
        "Let's approach this systematically. ",
        "Here's a calm way forward. ",
        "Take a breath and consider this. "
      ];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      result = opening + result;
    }
    
    if (tone === 'energetic') {
      const openings = [
        "Great! Let's tackle this head-on. ",
        "Perfect timing for this. ",
        "Let's make real progress. "
      ];
      const opening = openings[Math.floor(Math.random() * openings.length)];
      result = opening + result;
    }
    
    return result;
  }

  /**
   * RETAIN phase: Store successful case for future use
   */
  public async retainCase(
    problem: Case['problem'],
    solution: Case['solution'],
    outcome: Case['outcome']
  ): Promise<void> {
    const newCase: Case = {
      id: 'student_' + Date.now(),
      problem,
      solution,
      outcome
    };
    
    this.studentCases.push(newCase);
    console.log(`[CBR] retained new case: ${newCase.id}`);
  }

  /**
   * Get library statistics
   */
  public getLibraryStats(): {
    totalCases: number;
    studentCases: number;
    initialCases: number;
  } {
    return {
      totalCases: this.caseLibrary.length + this.studentCases.length,
      studentCases: this.studentCases.length,
      initialCases: this.caseLibrary.length
    };
  }
}

// Export singleton instance
export const caseBasedReasoning = new CaseBasedReasoning();
