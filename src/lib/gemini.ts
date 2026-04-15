import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: In a real app, this should be called from a backend route to protect the API key.
// For this demo, we use it directly if available.
export const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not found. LLM enhancements will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceStrategyWithLLM = async (nodes: any[], currentPlan: any[]) => {
  const ai = getGeminiClient();
  if (!ai) return currentPlan; // Fallback to RL plan if no API key

  try {
    const prompt = `
      I have a study plan with the following nodes:
      ${JSON.stringify(nodes, null, 2)}
      
      An RL agent has proposed the following sequence:
      ${JSON.stringify(currentPlan, null, 2)}
      
      Please review this sequence. If it makes logical sense (e.g., core modules before advanced topics), return it as is. 
      If it can be improved, reorder the nodes and provide a brief 'reasoning' for each node's placement.
      Return ONLY a valid JSON array of objects, where each object has 'nodeId' and 'reasoning'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      const refinedPlan = JSON.parse(response.text);
      return refinedPlan;
    }
  } catch (error) {
    console.error("LLM Enhancement failed:", error);
  }
  
  return currentPlan;
};
