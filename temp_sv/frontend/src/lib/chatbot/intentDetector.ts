// Question Type Detection - Section 3.4
// Detect 7 question types via BFS (broad category) then DFS (specific intent)

export type QuestionType = 
  | 'conceptual'
  | 'procedural' 
  | 'application'
  | 'comparison'
  | 'stuck'
  | 'exam_technique'
  | 'triage';

export interface QuestionDetection {
  type: QuestionType;
  confidence: number;
  strategy: string;
  enrichedPrompt: string;
}

interface IntentNode {
  id: string;
  name: string;
  keywords: string[];
  children: string[];
  parent?: string;
  priority: number;
  questionType?: QuestionType;
  strategy?: string;
}

// Intent graph definition with 7 question types
const INTENT_GRAPH: Map<string, IntentNode> = new Map([
  // Root node
  ['root', {
    id: 'root',
    name: 'root',
    keywords: [],
    children: ['conceptual', 'procedural', 'application', 'comparison', 'stuck', 'exam_technique', 'triage'],
    priority: 0
  }],

  // 1. Conceptual questions - "what is X" "explain X" "why does X work"
  ['conceptual', {
    id: 'conceptual',
    name: 'conceptual',
    keywords: ['what is', 'explain', 'why does', 'how does', 'define', 'meaning', 'concept', 'theory', 'principle'],
    children: [],
    priority: 8,
    questionType: 'conceptual',
    strategy: 'Start with core definition, then build understanding with examples and connections.'
  }],

  // 2. Procedural questions - "how do I implement X" "steps for X" "walk me through"
  ['procedural', {
    id: 'procedural',
    name: 'procedural',
    keywords: ['how do', 'how to', 'steps', 'implement', 'create', 'build', 'process', 'walk through', 'guide'],
    children: [],
    priority: 8,
    questionType: 'procedural',
    strategy: 'Break down into clear, numbered steps. Focus on the process, not the theory.'
  }],

  // 3. Application questions - "how to use X in exam" "when do I use X"
  ['application', {
    id: 'application',
    name: 'application',
    keywords: ['when do', 'how to use', 'apply', 'practice', 'example', 'real world', 'exam', 'situation'],
    children: [],
    priority: 7,
    questionType: 'application',
    strategy: 'Connect theory to practical use. Show when and how to apply in specific contexts.'
  }],

  // 4. Comparison questions - "difference between X and Y" "X vs Y" "compare"
  ['comparison', {
    id: 'comparison',
    name: 'comparison',
    keywords: ['difference', 'versus', 'vs', 'compare', 'similar', 'better', 'worse', 'contrast'],
    children: [],
    priority: 6,
    questionType: 'comparison',
    strategy: 'Highlight key differences and similarities. Use comparison table or clear contrast.'
  }],

  // 5. Stuck questions - "don't understand" "I'm lost" "can't get this"
  ['stuck', {
    id: 'stuck',
    name: 'stuck',
    keywords: ['stuck', 'lost', 'confused', 'don\'t understand', 'can\'t', 'difficult', 'hard', 'impossible'],
    children: [],
    priority: 9,
    questionType: 'stuck',
    strategy: 'Identify the specific blockage. Break down into smaller, manageable pieces.'
  }],

  // 6. Exam technique questions - "how to answer X mark questions" "exam format"
  ['exam_technique', {
    id: 'exam_technique',
    name: 'exam_technique',
    keywords: ['exam', 'test', 'marks', 'format', 'answer', 'paper', 'question', 'technique', 'strategy'],
    children: [],
    priority: 7,
    questionType: 'exam_technique',
    strategy: 'Focus on exam-specific strategies, timing, and mark allocation techniques.'
  }],

  // 7. Triage questions - "what should I study" "where do I start"
  ['triage', {
    id: 'triage',
    name: 'triage',
    keywords: ['what should', 'where to start', 'prioritize', 'focus', 'first', 'running out of time', 'don\'t know where'],
    children: [],
    priority: 10,
    questionType: 'triage',
    strategy: 'Assess priorities and time constraints. Provide focused, actionable next steps.'
  }]
]);

// Main detection function using BFS then DFS
export function detectQuestionType(message: string, context: any = {}): QuestionDetection {
  const normalizedMessage = message.toLowerCase().trim();
  
  // BFS: Find broad category
  const broadMatch = bfsSearch(normalizedMessage);
  if (!broadMatch) {
    return {
      type: 'conceptual',
      confidence: 0.3,
      strategy: 'Start with core definition, then build understanding.',
      enrichedPrompt: `Student asked: "${message}". Provide a clear explanation.`
    };
  }
  
  // DFS: Get specific intent details
  const specificMatch = dfsSearch(broadMatch.id, normalizedMessage);
  
  return {
    type: broadMatch.questionType || 'conceptual',
    confidence: calculateConfidence(normalizedMessage, broadMatch.keywords),
    strategy: broadMatch.strategy || 'Provide clear, helpful response.',
    enrichedPrompt: buildEnrichedPrompt(message, broadMatch, context)
  };
}

// BFS search for broad category
function bfsSearch(message: string): IntentNode | null {
  const queue = ['root'];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    const node = INTENT_GRAPH.get(nodeId);
    if (!node) continue;
    
    // Check if message matches this node's keywords
    const matchScore = calculateKeywordMatch(message, node.keywords);
    if (matchScore > 0.3) {
      return node;
    }
    
    // Add children to queue
    queue.push(...node.children);
  }
  
  return null;
}

// DFS search for specific intent
function dfsSearch(nodeId: string, message: string): IntentNode | null {
  const node = INTENT_GRAPH.get(nodeId);
  if (!node) return null;
  
  // Check if this node matches
  const matchScore = calculateKeywordMatch(message, node.keywords);
  if (matchScore > 0.5) {
    return node;
  }
  
  // Search children
  for (const childId of node.children) {
    const childMatch = dfsSearch(childId, message);
    if (childMatch) return childMatch;
  }
  
  return null;
}

function calculateKeywordMatch(message: string, keywords: string[]): number {
  let matches = 0;
  const messageWords = message.split(/\s+/);
  
  for (const keyword of keywords) {
    const keywordWords = keyword.split(/\s+/);
    for (const kwWord of keywordWords) {
      if (messageWords.some(msgWord => msgWord.includes(kwWord) || kwWord.includes(msgWord))) {
        matches++;
        break;
      }
    }
  }
  
  return keywords.length > 0 ? matches / keywords.length : 0;
}

function calculateConfidence(message: string, keywords: string[]): number {
  const matchScore = calculateKeywordMatch(message, keywords);
  const messageLength = message.length;
  
  // Longer, more detailed questions get higher confidence
  const lengthBonus = Math.min(messageLength / 100, 0.3);
  
  return Math.min(matchScore + lengthBonus, 1.0);
}

function buildEnrichedPrompt(message: string, node: IntentNode, context: any): string {
  let prompt = `Question type: ${node.questionType}\n`;
  prompt += `Student asked: "${message}"\n`;
  prompt += `Strategy: ${node.strategy}\n`;
  
  if (context.subject) prompt += `Subject: ${context.subject}\n`;
  if (context.examHoursRemaining) prompt += `Exam proximity: ${context.examHoursRemaining} hours\n`;
  if (context.processingStyle) prompt += `Processing style: ${context.processingStyle}\n`;
  
  prompt += `\nProvide a response that follows the specified strategy.`;
  
  return prompt;
}
