/**
 * Multi-Armed Bandit Agent for Content Preference Learning
 * Learns whether a student prefers visual, text, or example-based content
 * Runs entirely client-side for privacy
 */

export type ContentType = 'visual' | 'text' | 'example';

export interface BanditArm {
  type: ContentType;
  successes: number;
  trials: number;
}

export class MultiArmedBandit {
  private arms: BanditArm[];
  private epsilon: number;

  constructor(epsilon = 0.1) {
    this.epsilon = epsilon;
    this.arms = [
      { type: 'visual', successes: 1, trials: 2 },
      { type: 'text', successes: 1, trials: 2 },
      { type: 'example', successes: 1, trials: 2 }
    ];
  }

  /**
   * Thompson Sampling - choose content type based on Beta distribution
   */
  public chooseContentType(): ContentType {
    if (Math.random() < this.epsilon) {
      // Explore randomly
      const idx = Math.floor(Math.random() * this.arms.length);
      return this.arms[idx].type;
    }

    // Thompson Sampling: sample from Beta(successes, failures) for each arm
    let bestArm = this.arms[0];
    let bestSample = -Infinity;

    for (const arm of this.arms) {
      const failures = arm.trials - arm.successes;
      const sample = this.sampleBeta(arm.successes + 1, failures + 1);
      if (sample > bestSample) {
        bestSample = sample;
        bestArm = arm;
      }
    }

    return bestArm.type;
  }

  /**
   * Update arm based on reward (retention score)
   */
  public update(contentType: ContentType, retentionScore: number): void {
    const arm = this.arms.find(a => a.type === contentType);
    if (!arm) return;

    arm.trials += 1;
    // Consider retention > 6 as success
    if (retentionScore >= 6) {
      arm.successes += 1;
    }
  }

  /**
   * Get current preference probabilities
   */
  public getPreferences(): Record<ContentType, number> {
    const total = this.arms.reduce((sum, arm) => sum + arm.successes, 0);
    return {
      visual: this.arms[0].successes / total,
      text: this.arms[1].successes / total,
      example: this.arms[2].successes / total
    };
  }

  /**
   * Get the most preferred content type
   */
  public getPreferredType(): ContentType {
    return this.arms.reduce((best, arm) =>
      arm.successes / arm.trials > best.successes / best.trials ? arm : best
    ).type;
  }

  /**
   * Approximate Beta distribution sampling using Gamma distribution
   */
  private sampleBeta(alpha: number, beta: number): number {
    const x = this.sampleGamma(alpha);
    const y = this.sampleGamma(beta);
    return x / (x + y);
  }

  private sampleGamma(shape: number): number {
    // Marsaglia and Tsang's method
    if (shape < 1) {
      return this.sampleGamma(1 + shape) * Math.pow(Math.random(), 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x: number, v: number;
      do {
        x = this.normalRandom();
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  private normalRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  public save(userId: string): void {
    localStorage.setItem(`bandit_${userId}`, JSON.stringify(this.arms));
  }

  public load(userId: string): void {
    const data = localStorage.getItem(`bandit_${userId}`);
    if (data) {
      try {
        this.arms = JSON.parse(data);
      } catch {
        // Keep defaults
      }
    }
  }
}

export const contentBandit = new MultiArmedBandit();
