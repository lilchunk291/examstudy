// Emotion lexicon for CSP-based emotion detection
const EMOTION_LEXICON = {
  anxious: {
    words: ['worried', 'nervous', 'anxious', 'stressed', 'overwhelmed', 'panic', 'afraid', 'scared', 'tense', 'uneasy'],
    weight: 0.8
  },
  frustrated: {
    words: ['frustrated', 'annoyed', 'irritated', 'angry', 'mad', 'upset', 'bored', 'stuck', 'confused', 'lost'],
    weight: 0.7
  },
  tired: {
    words: ['tired', 'exhausted', 'fatigued', 'sleepy', 'drained', 'burnout', 'weary', 'energy', 'motivation'],
    weight: 0.6
  },
  confused: {
    words: ['confused', 'lost', 'unclear', 'don\'t understand', 'puzzled', 'bewildered', 'unsure', 'uncertain'],
    weight: 0.7
  },
  motivated: {
    words: ['motivated', 'excited', 'ready', 'energetic', 'enthusiastic', 'determined', 'focused', 'driven'],
    weight: 0.8
  },
  hopeless: {
    words: ['hopeless', 'giving up', 'quit', 'can\'t do this', 'impossible', 'useless', 'failure', 'fail'],
    weight: 0.9
  },
  confident: {
    words: ['confident', 'sure', 'certain', 'know', 'understand', 'ready', 'prepared', 'good'],
    weight: 0.7
  },
  neutral: {
    words: ['ok', 'fine', 'normal', 'regular', 'usual', 'typical'],
    weight: 0.5
  }
};

// Emotion constraints and relationships
const EMOTION_CONSTRAINTS = {
  // Mutually exclusive emotions
  mutually_exclusive: [
    ['motivated', 'hopeless'],
    ['confident', 'anxious'],
    ['confident', 'confused']
  ],
  
  // Co-occurring emotions (can appear together)
  co_occurring: [
    ['anxious', 'tired'],
    ['frustrated', 'confused'],
    ['tired', 'hopeless']
  ],
  
  // Intensity ranges (min, max)
  intensity_ranges: {
    anxious: [0.3, 1.0],
    frustrated: [0.2, 0.9],
    tired: [0.1, 0.8],
    confused: [0.2, 0.8],
    motivated: [0.3, 1.0],
    hopeless: [0.4, 1.0],
    confident: [0.3, 0.9],
    neutral: [0.0, 0.4]
  }
};

export class EmotionDetector {
  /**
   * Detect primary emotion using CSP constraint propagation
   */
  detectEmotion(text: string): string {
    // Normalize text
    const normalizedText = text.toLowerCase();
    
    // Initial emotion scores
    const initialScores = this.calculateInitialScores(normalizedText);
    
    // Apply constraint propagation
    const constrainedScores = this.applyConstraints(initialScores);
    
    // Resolve contradictions
    const resolvedScores = this.resolveContradictions(constrainedScores);
    
    // Find primary emotion
    const primaryEmotion = this.findPrimaryEmotion(resolvedScores);
    
    return primaryEmotion;
  }

  /**
   * Calculate initial emotion scores based on lexicon
   */
  private calculateInitialScores(text: string): Map<string, number> {
    const scores = new Map<string, number>();
    
    for (const [emotion, data] of Object.entries(EMOTION_LEXICON)) {
      let score = 0;
      let wordCount = 0;
      
      for (const word of data.words) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length * data.weight;
          wordCount += matches.length;
        }
      }
      
      // Normalize by text length
      const normalizedScore = wordCount > 0 ? score / Math.sqrt(text.split(' ').length) : 0;
      scores.set(emotion, Math.min(normalizedScore, 1.0));
    }
    
    return scores;
  }

  /**
   * Apply CSP constraints to emotion scores
   */
  private applyConstraints(scores: Map<string, number>): Map<string, number> {
    const constrainedScores = new Map(scores);
    
    // Apply intensity range constraints
    for (const [emotion, score] of constrainedScores.entries()) {
      const range = EMOTION_CONSTRAINTS.intensity_ranges[emotion as keyof typeof EMOTION_CONSTRAINTS.intensity_ranges];
      if (range) {
        const [min, max] = range;
        if (score < min) constrainedScores.set(emotion, min);
        if (score > max) constrainedScores.set(emotion, max);
      }
    }
    
    // Apply mutually exclusive constraints
    for (const exclusive of EMOTION_CONSTRAINTS.mutually_exclusive) {
      const [emotion1, emotion2] = exclusive;
      const score1 = constrainedScores.get(emotion1) || 0;
      const score2 = constrainedScores.get(emotion2) || 0;
      
      if (score1 > 0.3 && score2 > 0.3) {
        // Reduce the lower score
        if (score1 > score2) {
          constrainedScores.set(emotion2, Math.max(score2 * 0.3, 0.1));
        } else {
          constrainedScores.set(emotion1, Math.max(score1 * 0.3, 0.1));
        }
      }
    }
    
    // Apply co-occurring constraints (boost compatible emotions)
    for (const cooccurring of EMOTION_CONSTRAINTS.co_occurring) {
      const [emotion1, emotion2] = cooccurring;
      const score1 = constrainedScores.get(emotion1) || 0;
      const score2 = constrainedScores.get(emotion2) || 0;
      
      if (score1 > 0.2 && score2 > 0.2) {
        // Boost both emotions slightly
        constrainedScores.set(emotion1, Math.min(score1 * 1.2, 1.0));
        constrainedScores.set(emotion2, Math.min(score2 * 1.2, 1.0));
      }
    }
    
    return constrainedScores;
  }

  /**
   * Resolve contradictions using arc consistency
   */
  private resolveContradictions(scores: Map<string, number>): Map<string, number> {
    const resolvedScores = new Map(scores);
    let changed = true;
    let iterations = 0;
    const maxIterations = 10;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      // Check for contradictions and resolve
      for (const exclusive of EMOTION_CONSTRAINTS.mutually_exclusive) {
        const [emotion1, emotion2] = exclusive;
        const score1 = resolvedScores.get(emotion1) || 0;
        const score2 = resolvedScores.get(emotion2) || 0;
        
        // If both are high, reduce the one with less evidence
        if (score1 > 0.4 && score2 > 0.4) {
          const evidence1 = this.getEmotionEvidence(emotion1, scores);
          const evidence2 = this.getEmotionEvidence(emotion2, scores);
          
          if (evidence1 < evidence2) {
            resolvedScores.set(emotion1, Math.max(score1 * 0.5, 0.2));
            changed = true;
          } else {
            resolvedScores.set(emotion2, Math.max(score2 * 0.5, 0.2));
            changed = true;
          }
        }
      }
    }
    
    return resolvedScores;
  }

  /**
   * Get evidence strength for an emotion
   */
  private getEmotionEvidence(emotion: string, scores: Map<string, number>): number {
    return scores.get(emotion) || 0;
  }

  /**
   * Find the primary emotion from resolved scores
   */
  private findPrimaryEmotion(scores: Map<string, number>): string {
    let maxScore = 0;
    let primaryEmotion = 'neutral';
    
    for (const [emotion, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }
    
    // If no strong emotion detected, return neutral
    if (maxScore < 0.2) {
      return 'neutral';
    }
    
    return primaryEmotion;
  }

  /**
   * Get emotion intensity (0-1)
   */
  getEmotionIntensity(text: string, emotion: string): number {
    const scores = this.calculateInitialScores(text.toLowerCase());
    const constrained = this.applyConstraints(scores);
    const resolved = this.resolveContradictions(constrained);
    
    return resolved.get(emotion) || 0;
  }

  /**
   * Get all detected emotions with intensities
   */
  getAllEmotions(text: string): Map<string, number> {
    const normalizedText = text.toLowerCase();
    const initialScores = this.calculateInitialScores(normalizedText);
    const constrainedScores = this.applyConstraints(initialScores);
    const resolvedScores = this.resolveContradictions(constrainedScores);
    
    // Filter out very low scores
    const filteredScores = new Map<string, number>();
    for (const [emotion, score] of resolvedScores.entries()) {
      if (score > 0.1) {
        filteredScores.set(emotion, score);
      }
    }
    
    return filteredScores;
  }
}

export const emotionDetector = new EmotionDetector();
