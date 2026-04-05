/**
 * Dempster-Shafer Theory for Evidence Combination
 * Based on Shafer 1976 "A Mathematical Theory of Evidence" Princeton University Press
 * 
 * Combines conflicting evidence from multiple sources to decide whether to probe or respond
 * Handles uncertainty explicitly through belief functions
 */

export interface DSEvidence {
  source: string;
  massAssignments: Record<string, number>; // Key is subset of emotions (comma-separated)
}

export interface DSOutput {
  beliefs: Record<string, number>;
  plausibilities: Record<string, number>;
  uncertainties: Record<string, number>;
  conflictMass: number;
  shouldProbe: boolean;
  probeQuestion: string | null;
}

export class DempsterShafer {
  private frameOfDiscernment = ['anxious', 'frustrated', 'tired', 'confused', 'motivated', 'hopeless', 'confident', 'neutral'];
  
  /**
   * Create power set (all possible subsets) of emotions
   */
  private getPowerSet(): string[] {
    const powerSet: string[] = [];
    const n = this.frameOfDiscernment.length;
    
    for (let i = 0; i < (1 << n); i++) {
      const subset: string[] = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          subset.push(this.frameOfDiscernment[j]);
        }
      }
      if (subset.length > 0) {
        powerSet.push(subset.join(','));
      }
    }
    
    return powerSet;
  }

  /**
   * Parse subset string to array
   */
  private parseSubset(subset: string): string[] {
    return subset.split(',').filter(s => s.length > 0);
  }

  /**
   * Check if emotion is in subset
   */
  private isInSubset(emotion: string, subset: string): boolean {
    return this.parseSubset(subset).includes(emotion);
  }

  /**
   * Calculate intersection of two subsets
   */
  private intersection(subset1: string, subset2: string): string {
    const set1 = new Set(this.parseSubset(subset1));
    const set2 = new Set(this.parseSubset(subset2));
    const intersection = [...set1].filter(x => set2.has(x));
    return intersection.join(',');
  }

  /**
   * Extract keyword evidence from message text
   */
  private extractKeywordEvidence(message: string): DSEvidence {
    const text = message.toLowerCase();
    const massAssignments: Record<string, number> = {};
    
    // Strong evidence for specific emotions from keywords
    if (text.includes('anxious') || text.includes('panic') || text.includes('overwhelm')) {
      massAssignments['anxious'] = 0.6;
      massAssignments['anxious,frustrated'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2; // Uncertainty
    } else if (text.includes('frustrat') || text.includes('stuck') || text.includes('annoying')) {
      massAssignments['frustrated'] = 0.5;
      massAssignments['frustrated,confused'] = 0.3;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else if (text.includes('tired') || text.includes('exhaust') || text.includes('fatigue')) {
      massAssignments['tired'] = 0.7;
      massAssignments['tired,hopeless'] = 0.1;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else if (text.includes('confus') || text.includes('lost') || text.includes('unclear')) {
      massAssignments['confused'] = 0.6;
      massAssignments['confused,anxious'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else if (text.includes('motivat') || text.includes('energ') || text.includes('ready')) {
      massAssignments['motivated'] = 0.7;
      massAssignments['motivated,confident'] = 0.1;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else if (text.includes('hopeless') || text.includes('give up') || text.includes('impossible')) {
      massAssignments['hopeless'] = 0.6;
      massAssignments['hopeless,tired'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else if (text.includes('confident') || text.includes('sure') || text.includes('know')) {
      massAssignments['confident'] = 0.6;
      massAssignments['confident,motivated'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.2;
    } else {
      // Weak evidence - assign to larger subsets
      massAssignments['anxious,confused,tired'] = 0.3;
      massAssignments['motivated,confident'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.5;
    }
    
    return {
      source: 'keyword',
      massAssignments
    };
  }

  /**
   * Extract behavioral evidence from session data
   */
  private extractBehavioralEvidence(sessionData: any): DSEvidence {
    const massAssignments: Record<string, number> = {};
    
    // Evidence from session length
    if (sessionData.sessionMinutes > 120) {
      massAssignments['tired'] = 0.4;
      massAssignments['frustrated'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.4;
    } else if (sessionData.sessionMinutes < 30) {
      massAssignments['hopeless'] = 0.3;
      massAssignments['confused'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.5;
    } else {
      massAssignments['motivated'] = 0.3;
      massAssignments['neutral'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.5;
    }
    
    // Evidence from session count
    if (sessionData.sessionsToday > 5) {
      massAssignments['tired'] = Math.max(massAssignments['tired'] || 0, 0.3);
      massAssignments['fatigue'] = 0.4;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.3;
    }
    
    return {
      source: 'behavioral',
      massAssignments
    };
  }

  /**
   * Extract temporal evidence from time and exam proximity
   */
  private extractTemporalEvidence(examProximity: string, currentHour: number): DSEvidence {
    const massAssignments: Record<string, number> = {};
    
    // Evidence from exam proximity
    if (examProximity === 'today' || examProximity === 'tomorrow') {
      massAssignments['anxious'] = 0.5;
      massAssignments['stressed'] = 0.3;
      massAssignments['anxious,frustrated'] = 0.1;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.1;
    } else if (examProximity === 'this_week') {
      massAssignments['motivated'] = 0.3;
      massAssignments['anxious'] = 0.2;
      massAssignments['neutral'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.3;
    } else {
      massAssignments['neutral'] = 0.4;
      massAssignments['motivated'] = 0.2;
      massAssignments[this.frameOfDiscernment.join(',')] = 0.4;
    }
    
    // Evidence from time of day
    if (currentHour >= 22 || currentHour <= 6) {
      massAssignments['tired'] = Math.max(massAssignments['tired'] || 0, 0.4);
      massAssignments['fatigue'] = 0.3;
    } else if (currentHour >= 14 && currentHour <= 16) {
      massAssignments['tired'] = Math.max(massAssignments['tired'] || 0, 0.2);
      massAssignments['afternoon_slump'] = 0.3;
    }
    
    return {
      source: 'temporal',
      massAssignments
    };
  }

  /**
   * Dempster's combination rule
   */
  private combineEvidence(evidence1: DSEvidence, evidence2: DSEvidence): DSEvidence {
    const combinedMass: Record<string, number> = {};
    let conflictMass = 0;
    let totalMass = 0;
    
    // Get all subsets from both evidence sources
    const subsets1 = Object.keys(evidence1.massAssignments);
    const subsets2 = Object.keys(evidence2.massAssignments);
    
    // Combine all pairs of subsets
    for (const subset1 of subsets1) {
      for (const subset2 of subsets2) {
        const mass1 = evidence1.massAssignments[subset1];
        const mass2 = evidence2.massAssignments[subset2];
        
        const intersection = this.intersection(subset1, subset2);
        
        if (intersection.length === 0) {
          // Conflict - add to conflict mass
          conflictMass += mass1 * mass2;
        } else {
          // Non-conflicting intersection
          if (!combinedMass[intersection]) {
            combinedMass[intersection] = 0;
          }
          combinedMass[intersection] += mass1 * mass2;
          totalMass += mass1 * mass2;
        }
      }
    }
    
    // Normalize by removing conflict mass
    const normalizationFactor = 1 - conflictMass;
    if (normalizationFactor > 0) {
      for (const subset of Object.keys(combinedMass)) {
        combinedMass[subset] /= normalizationFactor;
      }
    }
    
    return {
      source: 'combined',
      massAssignments: combinedMass
    };
  }

  /**
   * Calculate belief, plausibility, and uncertainty for each emotion
   */
  private calculateBeliefPlausibility(massAssignments: Record<string, number>): {
    beliefs: Record<string, number>;
    plausibilities: Record<string, number>;
    uncertainties: Record<string, number>;
  } {
    const beliefs: Record<string, number> = {};
    const plausibilities: Record<string, number> = {};
    const uncertainties: Record<string, number> = {};
    
    for (const emotion of this.frameOfDiscernment) {
      let belief = 0;
      let plausibility = 0;
      
      // Belief: sum of masses of subsets containing the emotion
      for (const [subset, mass] of Object.entries(massAssignments)) {
        if (this.isInSubset(emotion, subset)) {
          belief += mass;
        }
        // Check if subset intersects with emotion (always true for singletons)
        if (subset === emotion || this.intersection(subset, emotion).length > 0) {
          plausibility += mass;
        }
      }
      
      beliefs[emotion] = belief;
      plausibilities[emotion] = plausibility;
      uncertainties[emotion] = plausibility - belief;
    }
    
    return { beliefs, plausibilities, uncertainties };
  }

  /**
   * Generate probe question if uncertainty is high
   */
  private generateProbeQuestion(uncertainties: Record<string, number>, beliefs: Record<string, number>): string | null {
    // Find emotion with highest uncertainty
    let maxUncertainty = 0;
    let mostUncertainEmotion = '';
    
    for (const [emotion, uncertainty] of Object.entries(uncertainties)) {
      if (uncertainty > maxUncertainty) {
        maxUncertainty = uncertainty;
        mostUncertainEmotion = emotion;
      }
    }
    
    // If uncertainty gap is too large, generate probe
    if (maxUncertainty > 0.4) {
      switch (mostUncertainEmotion) {
        case 'anxious':
          return "Are you feeling anxious about the exam specifically, or is something else worrying you?";
        case 'frustrated':
          return "Is the frustration with the topic itself, or with how you're trying to study it?";
        case 'tired':
          return "Are you physically tired from studying, or mentally exhausted?";
        case 'confused':
          return "Are you confused about the concepts, or about how to approach studying?";
        case 'motivated':
          return "What's driving your motivation right now - is it excitement or pressure?";
        case 'hopeless':
          return "Do you feel hopeless about this specific topic, or about the exam in general?";
        case 'confident':
          return "Is your confidence about this material, or about your preparation overall?";
        default:
          return "Can you tell me more about how you're feeling right now?";
      }
    }
    
    return null;
  }

  /**
   * Main Dempster-Shafer processing
   */
  public processEvidence(
    message: string,
    sessionData: any,
    examProximity: string,
    currentHour: number
  ): DSOutput {
    // Extract evidence from three sources
    const keywordEvidence = this.extractKeywordEvidence(message);
    const behavioralEvidence = this.extractBehavioralEvidence(sessionData);
    const temporalEvidence = this.extractTemporalEvidence(examProximity, currentHour);
    
    // Combine evidence using Dempster's rule
    let combined = this.combineEvidence(keywordEvidence, behavioralEvidence);
    combined = this.combineEvidence(combined, temporalEvidence);
    
    // Calculate belief, plausibility, and uncertainty
    const { beliefs, plausibilities, uncertainties } = this.calculateBeliefPlausibility(combined.massAssignments);
    
    // Calculate total conflict mass
    let conflictMass = 0;
    const subsets = Object.keys(combined.massAssignments);
    for (let i = 0; i < subsets.length; i++) {
      for (let j = i + 1; j < subsets.length; j++) {
        if (this.intersection(subsets[i], subsets[j]).length === 0) {
          conflictMass += combined.massAssignments[subsets[i]] * combined.massAssignments[subsets[j]];
        }
      }
    }
    
    // Determine if probing is needed
    const probeQuestion = this.generateProbeQuestion(uncertainties, beliefs);
    const shouldProbe = probeQuestion !== null;
    
    return {
      beliefs,
      plausibilities,
      uncertainties,
      conflictMass,
      shouldProbe,
      probeQuestion
    };
  }
}
