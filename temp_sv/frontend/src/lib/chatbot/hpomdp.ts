/**
 * Hierarchical Partially Observable Markov Decision Process
 * Based on Kaelbling, Littman, Cassandra 1998 "Planning and Acting in Partially Observable Stochastic Domains"
 * Artificial Intelligence Journal Volume 101
 * 
 * Two-level POMDP: response level and session level
 * Maintains belief state over hidden student states and handles partial observability
 */

export interface BeliefState {
  state: string;
  probability: number;
}

export interface POMDPOutput {
  responseBeliefState: BeliefState[];
  sessionBeliefState: BeliefState[];
  selectedAction: any;
  actionConfidence: number;
  updatedBeliefs: {
    response: BeliefState[];
    session: BeliefState[];
  };
}

export class HPOMDP {
  // Response level hidden states
  private responseStates = [
    'genuinely_understanding',
    'faking_understanding', 
    'completely_lost',
    'partially_grasping',
    'burnt_out_but_pushing',
    'secretly_anxious',
    'confidently_wrong'
  ];

  // Session level hidden states
  private sessionStates = [
    'productive_session',
    'struggling_session', 
    'giving_up_session',
    'breakthrough_session',
    'plateau_session'
  ];

  // Response level actions
  private responseActions = [
    'explain_deeply',
    'check_understanding',
    'provide_encouragement',
    'suggest_break',
    'challenge_student',
    'simplify_concept',
    'give_example',
    'ask_clarifying_question'
  ];

  // Session level actions
  private sessionActions = [
    'increase_difficulty',
    'decrease_difficulty',
    'change_topic',
    'take_break',
    'review_progress',
    'adjust_pace'
  ];

  // Observation model: maps student responses to hidden state probabilities
  private observationModel: Record<string, Record<string, number>> = {
    // Response level observations
    'i understand': {
      'genuinely_understanding': 0.7,
      'faking_understanding': 0.2,
      'partially_grasping': 0.08,
      'confidently_wrong': 0.02
    },
    'i dont get it': {
      'completely_lost': 0.6,
      'partially_grasping': 0.3,
      'secretly_anxious': 0.1
    },
    'ok': {
      'faking_understanding': 0.4,
      'secretly_anxious': 0.3,
      'partially_grasping': 0.2,
      'burnt_out_but_pushing': 0.1
    },
    'wow that helps': {
      'genuinely_understanding': 0.8,
      'breakthrough_session': 0.15,
      'partially_grasping': 0.05
    },
    'that makes sense': {
      'genuinely_understanding': 0.5,
      'partially_grasping': 0.3,
      'faking_understanding': 0.2
    },
    'im confused': {
      'completely_lost': 0.5,
      'secretly_anxious': 0.3,
      'partially_grasping': 0.2
    },
    'let me try': {
      'genuinely_understanding': 0.3,
      'partially_grasping': 0.4,
      'burnt_out_but_pushing': 0.3
    },
    'i think so': {
      'faking_understanding': 0.3,
      'partially_grasping': 0.4,
      'confidently_wrong': 0.3
    }
  };

  // Transition model: probability of moving between states given actions
  private transitionModel: Record<string, Record<string, number>> = {
    // Response level transitions
    'explain_deeply': {
      'completely_lost': 0.1,
      'partially_grasping': 0.3,
      'genuinely_understanding': 0.6
    },
    'check_understanding': {
      'faking_understanding': 0.2,
      'genuinely_understanding': 0.4,
      'confidently_wrong': 0.4
    },
    'provide_encouragement': {
      'burnt_out_but_pushing': 0.2,
      'secretly_anxious': 0.3,
      'genuinely_understanding': 0.3,
      'partially_grasping': 0.2
    },
    'suggest_break': {
      'burnt_out_but_pushing': 0.1,
      'genuinely_understanding': 0.3,
      'partially_grasping': 0.6
    },
    'challenge_student': {
      'confidently_wrong': 0.3,
      'genuinely_understanding': 0.4,
      'completely_lost': 0.3
    },
    'simplify_concept': {
      'completely_lost': 0.2,
      'partially_grasping': 0.5,
      'genuinely_understanding': 0.3
    }
  };

  // Reward function for response level
  private responseRewards: Record<string, Record<string, number>> = {
    'genuinely_understanding': {
      'explain_deeply': 0.8,
      'challenge_student': 1.0,
      'check_understanding': 0.6,
      'give_example': 0.7
    },
    'faking_understanding': {
      'check_understanding': 0.9,
      'ask_clarifying_question': 0.8,
      'simplify_concept': 0.5
    },
    'completely_lost': {
      'explain_deeply': 0.3,
      'simplify_concept': 0.9,
      'give_example': 0.8,
      'provide_encouragement': 0.4
    },
    'partially_grasping': {
      'explain_deeply': 0.7,
      'give_example': 0.8,
      'check_understanding': 0.6
    },
    'burnt_out_but_pushing': {
      'suggest_break': 1.0,
      'provide_encouragement': 0.7,
      'simplify_concept': 0.5
    },
    'secretly_anxious': {
      'provide_encouragement': 0.9,
      'check_understanding': 0.5,
      'simplify_concept': 0.6
    },
    'confidently_wrong': {
      'check_understanding': 0.8,
      'explain_deeply': 0.4,
      'challenge_student': 0.3
    }
  };

  // Session level rewards
  private sessionRewards: Record<string, Record<string, number>> = {
    'productive_session': {
      'increase_difficulty': 0.8,
      'review_progress': 0.6,
      'adjust_pace': 0.5
    },
    'struggling_session': {
      'decrease_difficulty': 0.9,
      'change_topic': 0.7,
      'take_break': 0.6
    },
    'giving_up_session': {
      'provide_encouragement': 1.0,
      'decrease_difficulty': 0.8,
      'take_break': 0.7
    },
    'breakthrough_session': {
      'increase_difficulty': 0.9,
      'challenge_student': 0.8,
      'review_progress': 0.6
    },
    'plateau_session': {
      'change_topic': 0.8,
      'adjust_pace': 0.7,
      'increase_difficulty': 0.5
    }
  };

  /**
   * Initialize uniform belief states
   */
  private initializeBeliefState(states: string[]): BeliefState[] {
    const probability = 1.0 / states.length;
    return states.map(state => ({
      state,
      probability
    }));
  }

  /**
   * Update belief state using Bayes rule
   */
  private updateBeliefState(
    currentBelief: BeliefState[],
    observation: string,
    action: string,
    level: 'response' | 'session'
  ): BeliefState[] {
    const newBelief: BeliefState[] = [];
    const states = level === 'response' ? this.responseStates : this.sessionStates;
    
    for (const state of states) {
      // Get current belief probability for this state
      const currentProb = currentBelief.find(b => b.state === state)?.probability || 0;
      
      // Get observation probability P(observation|state)
      const obsProb = this.observationModel[observation]?.[state] || 0.01; // Small default probability
      
      // Get transition probability P(state'|state, action)
      const transProb = this.transitionModel[action]?.[state] || 0.1;
      
      // Bayes rule: P(state'|observation, action) ∝ P(observation|state') * P(state'|state, action) * P(state)
      const unnormalizedProb = obsProb * transProb * currentProb;
      
      newBelief.push({
        state,
        probability: unnormalizedProb
      });
    }
    
    // Normalize probabilities
    const totalProb = newBelief.reduce((sum, b) => sum + b.probability, 0);
    return newBelief.map(b => ({
      ...b,
      probability: totalProb > 0 ? b.probability / totalProb : 1.0 / states.length
    }));
  }

  /**
   * Select action with maximum expected value
   */
  private selectAction(
    beliefState: BeliefState[],
    availableActions: string[],
    rewardFunction: Record<string, Record<string, number>>,
    htnConstraints: any[] = []
  ): { action: string; confidence: number } {
    let bestAction = availableActions[0];
    let bestValue = -Infinity;
    let totalValue = 0;
    
    for (const action of availableActions) {
      // Skip actions not allowed by HTN constraints
      if (htnConstraints.length > 0 && !htnConstraints.includes(action)) {
        continue;
      }
      
      // Calculate expected value: sum over states of belief * reward
      let expectedValue = 0;
      for (const belief of beliefState) {
        const reward = rewardFunction[belief.state]?.[action] || 0;
        expectedValue += belief.probability * reward;
      }
      
      totalValue += Math.max(0, expectedValue);
      
      if (expectedValue > bestValue) {
        bestValue = expectedValue;
        bestAction = action;
      }
    }
    
    // Calculate confidence as normalized expected value
    const confidence = totalValue > 0 ? bestValue / totalValue : 0.5;
    
    return { action: bestAction, confidence };
  }

  /**
   * Extract observation from student message
   */
  private extractObservation(message: string): string {
    const text = message.toLowerCase().trim();
    
    // Direct matches
    for (const [observation] of Object.entries(this.observationModel)) {
      if (text.includes(observation)) {
        return observation;
      }
    }
    
    // Semantic matches
    if (text.includes('understand') || text.includes('get it') || text.includes('makes sense')) {
      return 'i understand';
    } else if (text.includes('confused') || text.includes('lost') || text.includes('dont get')) {
      return 'i dont get it';
    } else if (text.includes('help') || text.includes('explain')) {
      return 'im confused';
    } else if (text.includes('try') || text.includes('attempt') || text.includes('let me')) {
      return 'let me try';
    } else if (text.includes('thanks') || text.includes('good') || text.includes('helpful')) {
      return 'wow that helps';
    }
    
    return 'ok'; // Default observation
  }

  /**
   * Update session level belief based on response level patterns
   */
  private updateSessionBelief(
    sessionBelief: BeliefState[],
    responseBelief: BeliefState[],
    sessionData: any
  ): BeliefState[] {
    const newBelief = [...sessionBelief];
    
    // Look for patterns in response beliefs over time
    const genuinelyUnderstandingProb = responseBelief.find(b => b.state === 'genuinely_understanding')?.probability || 0;
    const completelyLostProb = responseBelief.find(b => b.state === 'completely_lost')?.probability || 0;
    const burntOutProb = responseBelief.find(b => b.state === 'burnt_out_but_pushing')?.probability || 0;
    
    // Update session beliefs based on patterns
    if (genuinelyUnderstandingProb > 0.6) {
      // Increase productive_session probability
      const productiveIndex = newBelief.findIndex(b => b.state === 'productive_session');
      if (productiveIndex >= 0) {
        newBelief[productiveIndex].probability = Math.min(0.9, newBelief[productiveIndex].probability + 0.1);
      }
    }
    
    if (completelyLostProb > 0.5) {
      // Increase struggling_session probability
      const strugglingIndex = newBelief.findIndex(b => b.state === 'struggling_session');
      if (strugglingIndex >= 0) {
        newBelief[strugglingIndex].probability = Math.min(0.9, newBelief[strugglingIndex].probability + 0.1);
      }
    }
    
    if (burntOutProb > 0.4) {
      // Increase giving_up_session probability
      const givingUpIndex = newBelief.findIndex(b => b.state === 'giving_up_session');
      if (givingUpIndex >= 0) {
        newBelief[givingUpIndex].probability = Math.min(0.8, newBelief[givingUpIndex].probability + 0.15);
      }
    }
    
    // Consider session duration and topic completion
    if (sessionData.sessionMinutes > 90 && sessionData.topicsCompleted > 2) {
      // Likely productive session
      const productiveIndex = newBelief.findIndex(b => b.state === 'productive_session');
      if (productiveIndex >= 0) {
        newBelief[productiveIndex].probability = Math.min(0.95, newBelief[productiveIndex].probability + 0.2);
      }
    }
    
    // Normalize
    const totalProb = newBelief.reduce((sum, b) => sum + b.probability, 0);
    return newBelief.map(b => ({
      ...b,
      probability: totalProb > 0 ? b.probability / totalProb : 1.0 / this.sessionStates.length
    }));
  }

  /**
   * Main HPOMDP processing method
   */
  public process(
    studentMessage: string,
    previousResponseBelief: BeliefState[],
    previousSessionBelief: BeliefState[],
    htnPlan: any[],
    sessionData: any
  ): POMDPOutput {
    // Initialize belief states if not provided
    const responseBelief = previousResponseBelief.length > 0 
      ? previousResponseBelief 
      : this.initializeBeliefState(this.responseStates);
    
    const sessionBelief = previousSessionBelief.length > 0
      ? previousSessionBelief
      : this.initializeBeliefState(this.sessionStates);

    // Extract observation from student message
    const observation = this.extractObservation(studentMessage);

    // Get last action from HTN plan (or use default)
    const lastAction = htnPlan.length > 0 ? htnPlan[htnPlan.length - 1].type : 'explain_deeply';

    // Update response level belief state
    const updatedResponseBelief = this.updateBeliefState(
      responseBelief,
      observation,
      lastAction,
      'response'
    );

    // Update session level belief state
    const updatedSessionBelief = this.updateSessionBelief(
      sessionBelief,
      updatedResponseBelief,
      sessionData
    );

    // Get available actions from HTN plan
    const availableActions = htnPlan.map((task: any) => task.type);
    const constrainedActions = availableActions.length > 0 ? availableActions : this.responseActions;

    // Select action at response level
    const { action: selectedAction, confidence } = this.selectAction(
      updatedResponseBelief,
      constrainedActions,
      this.responseRewards,
      htnPlan.map((task: any) => task.type)
    );

    // Cross-level communication: adjust action based on session belief
    let finalAction = selectedAction;
    const givingUpProb = updatedSessionBelief.find(b => b.state === 'giving_up_session')?.probability || 0;
    
    if (givingUpProb > 0.6) {
      // Prioritize encourage and simplify actions
      if (selectedAction !== 'provide_encouragement' && selectedAction !== 'simplify_concept') {
        finalAction = 'provide_encouragement';
      }
    }

    return {
      responseBeliefState: updatedResponseBelief,
      sessionBeliefState: updatedSessionBelief,
      selectedAction: {
        type: finalAction,
        parameters: {},
        description: `Selected action based on POMDP analysis with confidence ${confidence.toFixed(2)}`
      },
      actionConfidence: confidence,
      updatedBeliefs: {
        response: updatedResponseBelief,
        session: updatedSessionBelief
      }
    };
  }
}
