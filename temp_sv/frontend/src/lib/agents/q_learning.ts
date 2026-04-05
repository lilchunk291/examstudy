/**
 * Q-Learning Agent for Learning Optimization
 * Runs entirely client-side to maintain privacy.
 *
 * The agent learns to optimize study schedules based on:
 * - Cognitive Load
 * - Exam Proximity
 * - Subject Weakness
 * - Retention Scores
 */

export interface AgentState {
  cognitiveLoad: number;    // 1-10
  examProximity: number;    // 0-1 (1 = today, 0 = >30 days)
  subjectWeakness: number;  // 0-1 (1 = very weak, 0 = mastered)
  timeOfDay: number;        // 0-23
}

export enum StudyAction {
  RECAP = 0,
  NEW_CONTENT = 1,
  DEEP_WORK = 2,
  PRACTICE_TEST = 3,
  REST = 4
}

export class QLearningAgent {
  private qTable: Map<string, number[]>;
  private learningRate: number;
  private discountFactor: number;
  private epsilon: number; // Exploration rate
  private actions: StudyAction[];

  constructor(
    learningRate = 0.1,
    discountFactor = 0.9,
    epsilon = 0.1
  ) {
    this.qTable = new Map();
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.epsilon = epsilon;
    this.actions = [
      StudyAction.RECAP,
      StudyAction.NEW_CONTENT,
      StudyAction.DEEP_WORK,
      StudyAction.PRACTICE_TEST,
      StudyAction.REST
    ];
  }

  /**
   * Discretize state for Q-Table key
   */
  private getStateKey(state: AgentState): string {
    // Rounding to reduce state space complexity
    const discLoad = Math.round(state.cognitiveLoad / 2); // 0-5
    const discProx = Math.round(state.examProximity * 4); // 0-4
    const discWeak = Math.round(state.subjectWeakness * 4); // 0-4
    const discTime = Math.floor(state.timeOfDay / 4); // 0-5

    return `${discLoad}-${discProx}-${discWeak}-${discTime}`;
  }

  private getQValues(stateKey: string): number[] {
    if (!this.qTable.has(stateKey)) {
      // Initialize with small random values
      this.qTable.set(stateKey, new Array(this.actions.length).fill(0).map(() => Math.random() * 0.1));
    }
    return this.qTable.get(stateKey)!;
  }

  /**
   * Choose an action based on Epsilon-Greedy policy
   */
  public chooseAction(state: AgentState): StudyAction {
    if (Math.random() < this.epsilon) {
      // Explore
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }

    // Exploit
    const stateKey = this.getStateKey(state);
    const qValues = this.getQValues(stateKey);
    const maxQ = Math.max(...qValues);
    return qValues.indexOf(maxQ);
  }

  /**
   * Update Q-Table based on reward
   */
  public update(
    state: AgentState,
    action: StudyAction,
    reward: number,
    nextState: AgentState
  ): void {
    const stateKey = this.getStateKey(state);
    const nextStateKey = this.getStateKey(nextState);

    const currentQValues = this.getQValues(stateKey);
    const nextQValues = this.getQValues(nextStateKey);

    const maxNextQ = Math.max(...nextQValues);

    // Q-Learning Formula: Q(s,a) = Q(s,a) + alpha * [reward + gamma * max(Q(s',a')) - Q(s,a)]
    currentQValues[action] += this.learningRate * (
      reward + (this.discountFactor * maxNextQ) - currentQValues[action]
    );

    this.qTable.set(stateKey, currentQValues);
  }

  /**
   * Calculate reward based on session outcome
   */
  public calculateReward(
    retentionScore: number,
    cognitiveFatigueDelta: number,
    isExamApproaching: boolean
  ): number {
    let reward = 0;

    // Positive reinforcement for high retention
    reward += retentionScore * 10;

    // Negative reinforcement for excessive fatigue
    if (cognitiveFatigueDelta > 3) {
      reward -= 5;
    }

    // Higher weight for retention if exam is close
    if (isExamApproaching && retentionScore < 0.6) {
      reward -= 10;
    }

    return reward;
  }

  /**
   * Save the model to local storage
   */
  public saveModel(userId: string): void {
    const data = JSON.stringify(Array.from(this.qTable.entries()));
    localStorage.setItem(`rl_agent_model_${userId}`, data);
  }

  /**
   * Load the model from local storage
   */
  public loadModel(userId: string): void {
    const data = localStorage.getItem(`rl_agent_model_${userId}`);
    if (data) {
      try {
        const entries = JSON.parse(data);
        this.qTable = new Map(entries);
      } catch (e) {
        console.error("Failed to load RL model:", e);
      }
    }
  }
}

export const studyAgent = new QLearningAgent();
