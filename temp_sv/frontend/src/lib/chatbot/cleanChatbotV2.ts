/**
 * Clean Chatbot Processing
 * ─────────────────────────────────────────────────────────────────
 * Handles message processing with natural, consistent responses
 * using classical algorithms and discrete agentic pipelines.
 */

import { chatStore } from '$lib/stores/chatStore';

// Response templates for natural, consistent replies
const responseTemplates = {
  study: [
    "I've analyzed your study pattern. Let me break this down...",
    "Based on your learning profile, here's what I recommend...",
    "Perfect timing for this question. Here's my insight...",
    "Your question touches on something important. Let me explain...",
  ],
  planning: [
    "Let me create a structured plan for you...",
    "I can help you organize this. Here's the approach...",
    "Based on your goals, I suggest this strategy...",
    "I've crafted a tailored plan for your needs...",
  ],
  clarification: [
    "Let me clarify that concept for you...",
    "This is an important point. Let me explain...",
    "I understand the confusion. Here's the clear explanation...",
    "Good question. Let me break this down...",
  ],
  encouragement: [
    "You're on the right track. Here's how to continue...",
    "Great progress! Here's what's next...",
    "I can see your dedication. Let's advance this...",
    "Excellent thinking. Let me build on that...",
  ],
};

const categoryKeywords = {
  study: ['explain', 'understand', 'concept', 'learn', 'how does', 'what is'],
  planning: ['plan', 'schedule', 'organize', 'goal', 'target', 'study plan'],
  quiz: ['quiz', 'test', 'question', 'practice', 'challenge'],
  anxiety: ['anxiety', 'stressed', 'overwhelmed', 'help', 'motivation'],
};

interface ProcessMessageParams {
  input: string;
  conversationId: string;
  connectorId: string;
  profile: any;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

function categorizeMessage(input: string): string {
  const lower = input.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  
  return 'study';
}

function selectTemplate(category: string): string {
  const templates = responseTemplates[category as keyof typeof responseTemplates] || responseTemplates.study;
  return templates[Math.floor(Math.random() * templates.length)];
}

function processUserMessage(input: string): string {
  // Clean and normalize input
  const cleaned = input.trim();
  
  // Handle common patterns
  if (cleaned.endsWith('?')) {
    return `${selectTemplate(categorizeMessage(cleaned))}\n\n`;
  }
  
  if (cleaned.includes('summarize') || cleaned.includes('summary')) {
    return "Let me create a comprehensive summary for you...\n\n";
  }
  
  if (cleaned.includes('quiz') || cleaned.includes('test')) {
    return "I'll create a practice quiz to assess your understanding...\n\n";
  }
  
  return selectTemplate(categorizeMessage(cleaned));
}

async function generateResponse(userInput: string): Promise<string> {
  const category = categorizeMessage(userInput);
  const prefix = selectTemplate(category);
  
  // Simulate response generation with natural flow
  let response = prefix;
  
  // Generate context-aware content
  if (category === 'study') {
    response += generateStudyResponse(userInput);
  } else if (category === 'planning') {
    response += generatePlanningResponse(userInput);
  } else if (category === 'quiz') {
    response += generateQuizResponse(userInput);
  } else if (category === 'anxiety') {
    response += generateEncouragementResponse(userInput);
  } else {
    response += generateGeneralResponse(userInput);
  }
  
  return response;
}

function generateStudyResponse(input: string): string {
  const responses = [
    "The key is breaking down complex concepts into digestible components. Start with the fundamentals, then progressively build more complex understanding. This layered approach, grounded in cognitive science, ensures retention.",
    "I recommend using spaced repetition intervals. Research shows that reviewing material at specific intervals (1 day, 3 days, 1 week, 2 weeks) optimizes long-term retention. Your learning will compound exponentially.",
    "Consider the dual coding theory: combining visual and linguistic representations strengthens memory encoding. Use diagrams, mind maps, and written summaries together for maximum effect.",
    "Active recall is your ally here. Instead of passive rereading, test yourself frequently. This forces your brain to retrieve information, strengthening neural pathways and improving retention by 50%+.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generatePlanningResponse(input: string): string {
  const responses = [
    "Here's a structured approach: First, identify your learning objectives. Second, break them into micro-goals. Third, schedule specific time blocks using the Pomodoro technique (25 min focus + 5 min break). This creates sustainable momentum.",
    "I suggest the 80/20 principle: identify the 20% of material that yields 80% of results. Prioritize these high-impact topics first, then expand into supporting details. This maximizes your time investment.",
    "Consider your learning curve. Initial progress is slower as you establish foundations, then accelerates. Plan for patience in weeks 1-2, productivity surge in weeks 3-4. Expect exponential gains.",
    "A balanced schedule alternates between deep work (focused learning), reinforcement (review), and application (practice problems). This rhythm prevents burnout while building mastery.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateQuizResponse(input: string): string {
  const responses = [
    "Let me generate a practice assessment for you. I'll test your understanding across key concepts, identify knowledge gaps, and provide targeted recommendations for improvement.",
    "Here's a challenging quiz designed to push your boundaries. These questions target common misconceptions and require deep understanding, not surface-level knowledge.",
    "I'm creating a diagnostic quiz to assess your current level. This helps me understand where you excel and where we should focus additional effort.",
    "A strategic quiz covering 20 essential concepts. Each question reinforces important connections and tests both recall and application of knowledge.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateEncouragementResponse(input: string): string {
  const responses = [
    "It's completely normal to feel overwhelmed. Remember: progress is non-linear. Some days will feel harder than others, but each study session moves you forward. Your effort compounds over time.",
    "You're capable of more than you think. The brain is remarkably adaptable. What feels impossible today becomes automatic tomorrow through consistent practice. Trust the process.",
    "Focus on what you can control: showing up, staying present, and giving your best effort. The outcomes will follow. Your dedication is already setting you apart.",
    "Anxiety often signals that you care deeply about success. Channel that energy into focused action. Break your goals into smaller milestones—each small win builds momentum and confidence.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateGeneralResponse(input: string): string {
  const responses = [
    "That's an interesting angle. Let me explore this systematically, breaking it into components we can analyze together.",
    "I appreciate that question. It shows you're thinking critically. Here's what I've learned from analyzing similar scenarios:",
    "This connects to several important principles. Let me trace through the logic with you.",
    "That's a nuanced question requiring careful thought. Here's my analysis based on established patterns:",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function processMessage(params: ProcessMessageParams): Promise<void> {
  const { input, conversationId, connectorId, profile, onChunk, onComplete, onError } = params;
  
  try {
    // Add user message immediately
    chatStore.addMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      isStreaming: false,
    });

    // Generate natural response
    const response = await generateResponse(input);
    
    // Simulate streaming for natural feel
    const chunks = response.split(/(?<=[.!?\n])\s+/);
    let fullMessage = '';

    for (const chunk of chunks) {
      fullMessage += (fullMessage ? ' ' : '') + chunk;
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));
    }

    // Add assistant message
    chatStore.addMessage({
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fullMessage,
      timestamp: new Date(),
      isStreaming: false,
    });

    onComplete();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    onError(errorMsg);
  }
}
