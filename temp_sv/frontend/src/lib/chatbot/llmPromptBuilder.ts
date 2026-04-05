// LLM Prompt Builder - Section 3.5
// Never forward raw student messages to Claude or Gemini.
// Always build an enriched prompt first incorporating context.

export interface PromptContext {
  questionType: string;
  topic: string;
  subject: string;
  examProximityDays: number;
  knownConcepts: string[];
  processingStyle: 'linear' | 'relational' | 'systemic';
  stressLevel: number;
  studentMessage: string;
  strategy: string;
}

export interface EnrichedPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: string;
}

export function buildEnrichedPrompt(context: PromptContext): EnrichedPrompt {
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(context);
  const contextString = buildContextString(context);
  
  return {
    systemPrompt,
    userPrompt,
    context: contextString
  };
}

function buildSystemPrompt(context: PromptContext): string {
  let prompt = `You are a study assistant helping a student prepare for exams. Your response should be:\n\n`;
  
  // Processing style instructions
  prompt += getProcessingStyleInstructions(context.processingStyle);
  
  // Urgency injection by exam proximity
  prompt += getUrgencyInstructions(context.examProximityDays);
  
  // Stress level considerations
  prompt += getStressLevelInstructions(context.stressLevel);
  
  // Question type guidance
  prompt += getQuestionTypeInstructions(context.questionType);
  
  // General constraints
  prompt += `\nAdditional guidelines:\n`;
  prompt += `- Be concise but thorough\n`;
  prompt += `- Use clear, simple language\n`;
  prompt += `- Focus on exam-relevant content\n`;
  prompt += `- Avoid jargon unless necessary\n`;
  prompt += `- Include practical examples when helpful\n`;
  
  return prompt;
}

function getProcessingStyleInstructions(style: 'linear' | 'relational' | 'systemic'): string {
  switch (style) {
    case 'linear':
      return `Processing Style: Linear learner\nPresent step by step. Complete each concept before moving to the next. Use numbered lists and clear progression.\n\n`;
    
    case 'relational':
      return `Processing Style: Relational learner\nConnect to concepts they already know. Use analogies and comparisons. Show how new ideas relate to existing knowledge.\n\n`;
    
    case 'systemic':
      return `Processing Style: Systemic learner\nBig picture first, then detail. Show where it fits in the overall system. Use frameworks and hierarchies.\n\n`;
    
    default:
      return '';
  }
}

function getUrgencyInstructions(days: number): string {
  if (days <= 1) {
    return `Urgency: Under 24 hours\nKey points only. No historical context. Focus on exam-critical information. Maximum 2-3 concepts per response.\n\n`;
  } else if (days <= 7) {
    return `Urgency: Under a week\nOne example maximum. Focus on high-yield topics. Prioritize frequently tested concepts.\n\n`;
  } else {
    return `Urgency: Time available\nFull explanation appropriate. Include context and connections. Multiple examples acceptable.\n\n`;
  }
}

function getStressLevelInstructions(level: number): string {
  if (level > 0.8) {
    return `Stress Level: High\nVery short sentences. Single instruction at a time. No options. Maximum 3 sentences total.\n\n`;
  } else if (level > 0.6) {
    return `Stress Level: Elevated\nShort sentences only. One instruction at a time. No explanation unless asked. No options.\n\n`;
  } else if (level > 0.3) {
    return `Stress Level: Moderate\nFocused and structured. Two options maximum. Medium length. Direct.\n\n`;
  } else {
    return `Stress Level: Normal\nFull explanations. Multiple strategy options. Conversational. Longer responses acceptable.\n\n`;
  }
}

function getQuestionTypeInstructions(type: string): string {
  switch (type) {
    case 'conceptual':
      return `Question Type: Conceptual\nStart with clear definition. Build understanding progressively. Use examples and analogies. Check for understanding.\n\n`;
    
    case 'procedural':
      return `Question Type: Procedural\nProvide step-by-step instructions. Number each step clearly. Focus on the process, not theory. Include common mistakes to avoid.\n\n`;
    
    case 'application':
      return `Question Type: Application\nShow practical use cases. Focus on when and how to apply. Include exam-specific examples. Connect to real-world scenarios.\n\n`;
    
    case 'comparison':
      return `Question Type: Comparison\nHighlight key differences and similarities. Use comparison format. Focus on distinguishing features that matter for exams.\n\n`;
    
    case 'stuck':
      return `Question Type: Stuck\nIdentify the specific blockage. Break down into smaller pieces. Provide immediate next step. Build confidence.\n\n`;
    
    case 'exam_technique':
      return `Question Type: Exam Technique\nFocus on exam strategies. Include timing, mark allocation, and answer structure. Provide practical tips.\n\n`;
    
    case 'triage':
      return `Question Type: Triage\nAssess priorities quickly. Provide focused, actionable next steps. Consider time constraints. Be decisive.\n\n`;
    
    default:
      return '';
  }
}

function buildUserPrompt(context: PromptContext): string {
  let prompt = `Student Question: ${context.studentMessage}\n\n`;
  
  prompt += `Context:\n`;
  prompt += `- Subject: ${context.subject}\n`;
  prompt += `- Topic: ${context.topic}\n`;
  prompt += `- Exam in: ${context.examProximityDays} days\n`;
  
  if (context.knownConcepts.length > 0) {
    prompt += `- Already knows: ${context.knownConcepts.join(', ')}\n`;
  }
  
  prompt += `\nSuggested Strategy: ${context.strategy}\n\n`;
  prompt += `Please provide a helpful response following the guidelines above.`;
  
  return prompt;
}

function buildContextString(context: PromptContext): string {
  return JSON.stringify({
    questionType: context.questionType,
    subject: context.subject,
    topic: context.topic,
    examProximityDays: context.examProximityDays,
    processingStyle: context.processingStyle,
    stressLevel: Math.round(context.stressLevel * 100) / 100,
    knownConceptsCount: context.knownConcepts.length,
    messageLength: context.studentMessage.length
  }, null, 2);
}

// Helper function to extract context from conversation
export function extractPromptContext(
  message: string,
  questionType: string,
  strategy: string,
  userProfile: any = {},
  examData: any = {}
): PromptContext {
  return {
    questionType,
    topic: extractTopic(message),
    subject: userProfile.subject || examData.subject || 'Unknown',
    examProximityDays: examData.hoursRemaining ? Math.floor(examData.hoursRemaining / 24) : 30,
    knownConcepts: userProfile.knownConcepts || [],
    processingStyle: userProfile.processing_style || 'linear',
    stressLevel: calculateStressLevel(examData.hoursRemaining || 168),
    studentMessage: message,
    strategy
  };
}

function extractTopic(message: string): string {
  // Simple topic extraction - in production would use NLP
  const words = message.toLowerCase().split(/\s+/);
  const topicKeywords = ['algorithm', 'data structure', 'calculus', 'physics', 'chemistry', 'biology', 'history', 'math'];
  
  for (const keyword of topicKeywords) {
    if (words.some(word => word.includes(keyword))) {
      return keyword;
    }
  }
  
  return 'general topic';
}

function calculateStressLevel(hoursRemaining: number): number {
  if (hoursRemaining <= 24) return 0.9;
  if (hoursRemaining <= 72) return 0.7;
  if (hoursRemaining <= 168) return 0.4;
  return 0.2;
}
