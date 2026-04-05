/**
 * Fuzzy Logic Emotion Assessment
 * Based on Zadeh 1965 "Fuzzy Sets" Information and Control Volume 8
 * 
 * Implements trapezoidal membership functions for emotion assessment
 * with continuous degrees 0 to 1, never binary classification.
 */

export interface FuzzyOutput {
  emotionVector: Record<string, number>;
  primaryEmotion: string;
  primaryIntensity: number;
  suggestedStrategy: string;
  confidence: number;
}

export interface FuzzyRule {
  conditions: Array<{ variable: string; set: string }>;
  conclusion: { strategy: string; weight: number };
}

export class FuzzyLogic {
  private emotions = ['anxious', 'frustrated', 'tired', 'confused', 'motivated', 'hopeless', 'confident', 'neutral'];
  
  private membershipFunctions: Record<string, Record<string, (x: number) => number>> = {
    // Input variables: stress (0-1), confusion (0-1), fatigue (0-1), motivation (0-1), time_pressure (0-1)
    stress: {
      low: (x: number) => this.trapezoid(x, 0, 0, 0.2, 0.4),
      medium: (x: number) => this.trapezoid(x, 0.2, 0.4, 0.6, 0.8),
      high: (x: number) => this.trapezoid(x, 0.6, 0.8, 1, 1)
    },
    confusion: {
      low: (x: number) => this.trapezoid(x, 0, 0, 0.3, 0.5),
      medium: (x: number) => this.trapezoid(x, 0.3, 0.5, 0.7, 0.9),
      high: (x: number) => this.trapezoid(x, 0.7, 0.9, 1, 1)
    },
    fatigue: {
      low: (x: number) => this.trapezoid(x, 0, 0, 0.25, 0.5),
      medium: (x: number) => this.trapezoid(x, 0.25, 0.5, 0.75, 0.9),
      high: (x: number) => this.trapezoid(x, 0.75, 0.9, 1, 1)
    },
    motivation: {
      low: (x: number) => this.trapezoid(x, 0, 0, 0.3, 0.5),
      medium: (x: number) => this.trapezoid(x, 0.3, 0.5, 0.7, 0.85),
      high: (x: number) => this.trapezoid(x, 0.7, 0.85, 1, 1)
    },
    time_pressure: {
      low: (x: number) => this.trapezoid(x, 0, 0, 0.2, 0.4),
      medium: (x: number) => this.trapezoid(x, 0.2, 0.4, 0.6, 0.8),
      high: (x: number) => this.trapezoid(x, 0.6, 0.8, 1, 1)
    }
  };

  private fuzzyRules: FuzzyRule[] = [
    // Rule 1: High stress + high time pressure -> reassure
    {
      conditions: [{ variable: 'stress', set: 'high' }, { variable: 'time_pressure', set: 'high' }],
      conclusion: { strategy: 'reassure', weight: 0.8 }
    },
    // Rule 2: High confusion + sufficient time -> explain deeply
    {
      conditions: [{ variable: 'confusion', set: 'high' }, { variable: 'time_pressure', set: 'low' }],
      conclusion: { strategy: 'explain_deeply', weight: 0.9 }
    },
    // Rule 3: High fatigue -> suggest break
    {
      conditions: [{ variable: 'fatigue', set: 'high' }],
      conclusion: { strategy: 'suggest_break', weight: 0.7 }
    },
    // Rule 4: High motivation + sufficient time -> challenge
    {
      conditions: [{ variable: 'motivation', set: 'high' }, { variable: 'time_pressure', set: 'low' }],
      conclusion: { strategy: 'challenge', weight: 0.75 }
    },
    // Rule 5: High stress + low motivation -> reframe
    {
      conditions: [{ variable: 'stress', set: 'high' }, { variable: 'motivation', set: 'low' }],
      conclusion: { strategy: 'reframe', weight: 0.85 }
    },
    // Rule 6: Medium confusion + medium stress -> simplify
    {
      conditions: [{ variable: 'confusion', set: 'medium' }, { variable: 'stress', set: 'medium' }],
      conclusion: { strategy: 'simplify', weight: 0.8 }
    },
    // Rule 7: Low motivation + high fatigue -> gentle encouragement
    {
      conditions: [{ variable: 'motivation', set: 'low' }, { variable: 'fatigue', set: 'high' }],
      conclusion: { strategy: 'gentle_encourage', weight: 0.7 }
    },
    // Rule 8: High motivation + low stress -> direct action
    {
      conditions: [{ variable: 'motivation', set: 'high' }, { variable: 'stress', set: 'low' }],
      conclusion: { strategy: 'direct_action', weight: 0.8 }
    }
  ];

  /**
   * Trapezoidal membership function
   * Returns degree of membership (0 to 1) for value x
   */
  private trapezoid(x: number, a: number, b: number, c: number, d: number): number {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  /**
   * Extract fuzzy features from message text
   */
  private extractFeatures(message: string): Record<string, number> {
    const text = message.toLowerCase();
    
    // Stress indicators
    const stressKeywords = ['overwhelm', 'stress', 'anxious', 'panic', 'worried', 'nervous'];
    const stressScore = Math.min(this.keywordScore(text, stressKeywords), 1.0);
    
    // Confusion indicators
    const confusionKeywords = ['confus', 'dont understand', 'lost', 'unclear', 'what', 'how'];
    const confusionScore = Math.min(this.keywordScore(text, confusionKeywords), 1.0);
    
    // Fatigue indicators
    const fatigueKeywords = ['tired', 'exhaust', 'fatigue', 'sleepy', 'burnout', 'drain'];
    const fatigueScore = Math.min(this.keywordScore(text, fatigueKeywords), 1.0);
    
    // Motivation indicators
    const motivationKeywords = ['motivat', 'energ', 'ready', 'excit', 'focus', 'determin'];
    const motivationScore = Math.min(this.keywordScore(text, motivationKeywords), 1.0);
    
    // Hopelessness indicators
    const hopelessKeywords = ['hopeless', 'give up', 'quit', 'impossible', 'cant', 'never'];
    const hopelessScore = Math.min(this.keywordScore(text, hopelessKeywords), 1.0);
    
    // Confidence indicators
    const confidenceKeywords = ['confident', 'sure', 'know', 'understand', 'get it', 'clear'];
    const confidenceScore = Math.min(this.keywordScore(text, confidenceKeywords), 1.0);
    
    return {
      stress: stressScore,
      confusion: confusionScore,
      fatigue: fatigueScore,
      motivation: motivationScore,
      hopeless: hopelessScore,
      confidence: confidenceScore
    };
  }

  /**
   * Calculate keyword density score
   */
  private keywordScore(text: string, keywords: string[]): number {
    let score = 0;
    const words = text.split(/\s+/);
    
    for (const keyword of keywords) {
      const matches = words.filter(word => word.includes(keyword)).length;
      score += matches * 0.3; // Each keyword contributes 0.3 to score
    }
    
    return score;
  }

  /**
   * Compute emotion vector using fuzzy inference
   */
  private computeEmotionVector(features: Record<string, number>): Record<string, number> {
    const vector: Record<string, number> = {};
    
    // Anxious: high stress + low confidence
    vector.anxious = Math.min(features.stress * 0.7 + (1 - features.confidence) * 0.3, 1.0);
    
    // Frustrated: high stress + high confusion + high motivation
    vector.frustrated = Math.min(features.stress * 0.4 + features.confusion * 0.4 + features.motivation * 0.2, 1.0);
    
    // Tired: high fatigue + low motivation
    vector.tired = Math.min(features.fatigue * 0.8 + (1 - features.motivation) * 0.2, 1.0);
    
    // Confused: high confusion + low confidence
    vector.confused = Math.min(features.confusion * 0.7 + (1 - features.confidence) * 0.3, 1.0);
    
    // Motivated: high motivation + low stress
    vector.motivated = Math.min(features.motivation * 0.8 + (1 - features.stress) * 0.2, 1.0);
    
    // Hopeless: high hopeless + low motivation + high stress
    vector.hopeless = Math.min(features.hopeless * 0.5 + (1 - features.motivation) * 0.3 + features.stress * 0.2, 1.0);
    
    // Confident: high confidence + low stress
    vector.confident = Math.min(features.confidence * 0.7 + (1 - features.stress) * 0.3, 1.0);
    
    // Neutral: low intensity across all emotions
    const avgIntensity = Object.values(vector).reduce((sum, val) => sum + val, 0) / Object.keys(vector).length;
    vector.neutral = Math.max(0, 1 - avgIntensity);
    
    return vector;
  }

  /**
   * Apply fuzzy rules using minimum operator for AND
   */
  private applyRules(features: Record<string, number>): Record<string, number> {
    const strategyStrengths: Record<string, number> = {};
    
    for (const rule of this.fuzzyRules) {
      // Minimum operator for AND conditions
      let conditionStrength = 1.0;
      for (const condition of rule.conditions) {
        const membership = this.membershipFunctions[condition.variable]?.[condition.set];
        if (membership) {
          const strength = membership(features[condition.variable] || 0);
          conditionStrength = Math.min(conditionStrength, strength);
        }
      }
      
      // Product operator for rule strength
      const ruleStrength = conditionStrength * rule.conclusion.weight;
      
      // Weighted sum aggregation
      if (!strategyStrengths[rule.conclusion.strategy]) {
        strategyStrengths[rule.conclusion.strategy] = 0;
      }
      strategyStrengths[rule.conclusion.strategy] = Math.max(
        strategyStrengths[rule.conclusion.strategy],
        ruleStrength
      );
    }
    
    return strategyStrengths;
  }

  /**
   * Defuzzification using centroid method
   */
  private defuzzify(strategyStrengths: Record<string, number>): { strategy: string; confidence: number } {
    if (Object.keys(strategyStrengths).length === 0) {
      return { strategy: 'neutral', confidence: 0.5 };
    }
    
    // Find strategy with maximum strength
    let maxStrategy = 'neutral';
    let maxStrength = 0;
    
    for (const [strategy, strength] of Object.entries(strategyStrengths)) {
      if (strength > maxStrength) {
        maxStrength = strength;
        maxStrategy = strategy;
      }
    }
    
    return { strategy: maxStrategy, confidence: maxStrength };
  }

  /**
   * Main fuzzy logic processing
   */
  public assessEmotion(message: string, timePressure: number = 0.5): FuzzyOutput {
    // Extract features from message
    const features = this.extractFeatures(message);
    features.time_pressure = timePressure;
    
    // Compute emotion vector
    const emotionVector = this.computeEmotionVector(features);
    
    // Find primary emotion
    let primaryEmotion = 'neutral';
    let primaryIntensity = 0;
    
    for (const [emotion, intensity] of Object.entries(emotionVector)) {
      if (intensity > primaryIntensity) {
        primaryIntensity = intensity;
        primaryEmotion = emotion;
      }
    }
    
    // Apply fuzzy rules
    const strategyStrengths = this.applyRules(features);
    
    // Defuzzify to get crisp strategy
    const { strategy, confidence } = this.defuzzify(strategyStrengths);
    
    return {
      emotionVector,
      primaryEmotion,
      primaryIntensity,
      suggestedStrategy: strategy,
      confidence
    };
  }
}
