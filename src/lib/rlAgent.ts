import { enhanceStrategyWithLLM } from "./gemini";

// Define the state and action space for our RL Agent
export interface StudyNode {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  color: string;
  x?: number;
  y?: number;
}

export interface AgentState {
  completedNodeIds: Set<string>;
  currentNodeId: string | null;
  fatigue: number; // 0 to 100
}

export interface AgentAction {
  targetNodeId: string;
  actionType: 'STUDY' | 'REVIEW' | 'BREAK';
}

/**
 * A simulated Reinforcement Learning Agent for Study Strategy Optimization.
 * Uses a heuristic-based Monte Carlo Tree Search (MCTS) / greedy approach 
 * to find the optimal sequence of study nodes.
 */
export class StudyRLAgent {
  private nodes: StudyNode[];
  
  constructor(nodes: StudyNode[]) {
    this.nodes = nodes;
  }

  // Reward function evaluates the benefit of taking an action from a given state
  private calculateReward(state: AgentState, action: AgentAction): number {
    let reward = 0;
    const targetNode = this.nodes.find(n => n.id === action.targetNodeId);
    
    if (!targetNode) return -100; // Invalid action

    if (action.actionType === 'BREAK') {
      return state.fatigue > 70 ? 50 : -10; // Reward breaks only when fatigued
    }

    // Base reward for studying a new node
    if (!state.completedNodeIds.has(action.targetNodeId)) {
      reward += 20;
    } else if (action.actionType === 'REVIEW') {
      reward += 5; // Small reward for reviewing
    } else {
      reward -= 10; // Penalty for studying an already completed node without 'REVIEW' intent
    }

    // Heuristic: Core modules should be studied before Target Objectives
    if (targetNode.type.toLowerCase().includes('core') || targetNode.type.toLowerCase().includes('foundation')) {
      reward += 15; // High priority for core modules
    }

    // Penalty for high fatigue
    if (state.fatigue > 80) {
      reward -= 20;
    }

    return reward;
  }

  // Simulates the environment transition
  private step(state: AgentState, action: AgentAction): AgentState {
    const newState = {
      completedNodeIds: new Set(state.completedNodeIds),
      currentNodeId: action.targetNodeId,
      fatigue: state.fatigue
    };

    if (action.actionType === 'BREAK') {
      newState.fatigue = Math.max(0, newState.fatigue - 40);
    } else {
      newState.completedNodeIds.add(action.targetNodeId);
      newState.fatigue = Math.min(100, newState.fatigue + 25);
    }

    return newState;
  }

  /**
   * Generates an optimal study sequence using a greedy policy based on the reward function.
   */
  public generatePolicy(): { nodeId: string, action: string, expectedReward: number }[] {
    let currentState: AgentState = {
      completedNodeIds: new Set(),
      currentNodeId: null,
      fatigue: 0
    };

    const policy = [];
    const remainingNodes = new Set(this.nodes.map(n => n.id));

    // Simple greedy rollout
    while (remainingNodes.size > 0) {
      let bestAction: AgentAction | null = null;
      let maxReward = -Infinity;

      // Evaluate all possible next nodes
      for (const nodeId of remainingNodes) {
        const action: AgentAction = { targetNodeId: nodeId, actionType: 'STUDY' };
        const reward = this.calculateReward(currentState, action);
        
        if (reward > maxReward) {
          maxReward = reward;
          bestAction = action;
        }
      }

      // Check if a break is better
      const breakAction: AgentAction = { targetNodeId: 'BREAK', actionType: 'BREAK' };
      const breakReward = this.calculateReward(currentState, breakAction);
      
      if (breakReward > maxReward) {
        policy.push({ nodeId: 'BREAK', action: 'BREAK', expectedReward: breakReward });
        currentState = this.step(currentState, breakAction);
        continue;
      }

      if (bestAction) {
        policy.push({ 
          nodeId: bestAction.targetNodeId, 
          action: bestAction.actionType, 
          expectedReward: maxReward 
        });
        currentState = this.step(currentState, bestAction);
        remainingNodes.delete(bestAction.targetNodeId);
      } else {
        break; // Should not happen unless no nodes
      }
    }

    return policy;
  }

  /**
   * Main entry point: Runs the RL agent and falls back to LLM if complexity is high.
   */
  public async optimizeStrategy(): Promise<any[]> {
    // 1. Run RL Agent to get base policy
    const basePolicy = this.generatePolicy();

    // 2. Complexity Check: If there are many nodes or complex types, enhance with LLM
    if (this.nodes.length > 3) {
      console.log("Complexity threshold reached. Enhancing RL policy with LLM...");
      const enhancedPolicy = await enhanceStrategyWithLLM(this.nodes, basePolicy);
      return enhancedPolicy;
    }

    return basePolicy.map(p => ({
      nodeId: p.nodeId,
      reasoning: `RL Agent selected this action (${p.action}) with expected reward ${p.expectedReward}`
    }));
  }
}
