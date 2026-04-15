import { getGeminiClient } from "./gemini";

// Define the state and action space for our Chat RL Agent
export interface ChatState {
  intent: string;
  stress: number;
  motivation: number;
  fatigue: number;
  messageHistoryLength: number;
}

export type ChatStrategy = 
  | "EXPLAIN_CONCEPT" 
  | "OFFER_QUIZ" 
  | "PROVIDE_MOTIVATION" 
  | "SUGGEST_BREAK" 
  | "DIRECT_ANSWER" 
  | "ASK_CLARIFYING_QUESTION";

export interface ChatAction {
  strategy: ChatStrategy;
}

/**
 * A simulated Reinforcement Learning Agent for Chatbot Strategy Selection.
 * Uses heuristics to select the best conversational strategy based on the user's state.
 */
export class ChatRLAgent {
  
  // Reward function evaluates the benefit of taking an action from a given state
  private calculateReward(state: ChatState, action: ChatAction): number {
    let reward = 0;

    switch (action.strategy) {
      case "SUGGEST_BREAK":
        if (state.fatigue > 0.7) reward += 50;
        else reward -= 20;
        break;
      case "PROVIDE_MOTIVATION":
        if (state.stress > 0.6 || state.motivation < 0.4) reward += 40;
        else reward -= 10;
        break;
      case "OFFER_QUIZ":
        if (state.intent === "study" && state.fatigue < 0.5 && state.motivation > 0.5) reward += 30;
        else reward -= 10;
        break;
      case "EXPLAIN_CONCEPT":
        if (state.intent === "study") reward += 20;
        break;
      case "DIRECT_ANSWER":
        if (state.intent !== "study" && state.intent !== "anxiety") reward += 15;
        break;
      case "ASK_CLARIFYING_QUESTION":
        if (state.intent === "unknown") reward += 30;
        else reward -= 5;
        break;
    }

    return reward;
  }

  /**
   * Generates an optimal chat strategy using a greedy policy based on the reward function.
   */
  public generatePolicy(state: ChatState): { strategy: ChatStrategy, expectedReward: number } {
    const possibleStrategies: ChatStrategy[] = [
      "EXPLAIN_CONCEPT", 
      "OFFER_QUIZ", 
      "PROVIDE_MOTIVATION", 
      "SUGGEST_BREAK", 
      "DIRECT_ANSWER", 
      "ASK_CLARIFYING_QUESTION"
    ];

    let bestStrategy: ChatStrategy = "DIRECT_ANSWER";
    let maxReward = -Infinity;

    for (const strategy of possibleStrategies) {
      const action: ChatAction = { strategy };
      const reward = this.calculateReward(state, action);
      
      if (reward > maxReward) {
        maxReward = reward;
        bestStrategy = strategy;
      }
    }

    return { strategy: bestStrategy, expectedReward: maxReward };
  }

  /**
   * Main entry point: Runs the RL agent and falls back to LLM if complexity is high.
   */
  public async optimizeStrategy(state: ChatState, userMessage: string): Promise<string> {
    // 1. Run RL Agent to get base policy
    const { strategy } = this.generatePolicy(state);

    // 2. Complexity Check: If the conversation is long or intent is unknown, enhance with LLM
    if (state.messageHistoryLength > 10 || state.intent === "unknown") {
      console.log("Chat complexity threshold reached. Enhancing RL policy with LLM...");
      
      const ai = getGeminiClient();
      if (!ai) return strategy; // Fallback to RL strategy if no API key

      try {
        const prompt = `
          The user said: "${userMessage}"
          Current state: Intent=${state.intent}, Stress=${state.stress}, Motivation=${state.motivation}, Fatigue=${state.fatigue}.
          The RL agent suggested the strategy: "${strategy}".
          
          Does this strategy make sense? If there is a better strategy to handle this complex or unknown situation, please provide it. 
          Return ONLY the name of the best strategy (e.g., "GENTLE_PROBING", "DEEP_DIVE_EXPLANATION", "EMPATHETIC_LISTENING", or the original strategy).
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return `[LLM Enhanced] ${response.text.trim()}`;
        }
      } catch (error) {
        console.error("LLM Enhancement failed:", error);
      }
    }

    return strategy;
  }
}
