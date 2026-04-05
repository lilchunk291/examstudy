import { contextMemory } from './contextMemory';
import { naturalizer } from './naturalizer';
import type { Message } from '$lib/stores/chatStore';

interface ResponseRequest {
  userMessage: string;
  emotion: string;
  intent: string;
  contextData: any;
  conversationHistory: Message[];
}

interface ResponseTemplate {
  id: string;
  category: string;
  template: string;
  variations: string[];
  personality: string[];
  context: string[];
}

export class ResponseGenerator {
  private templates: ResponseTemplate[] = [];
  private banditScores: Map<string, number> = new Map();

  constructor() {
    this.loadTemplates();
    this.initializeBanditScores();
  }

  /**
   * Generate a response based on emotion, intent, and context
   */
  async generateResponse(request: ResponseRequest): Promise<string> {
    const { userMessage, emotion, intent, contextData, conversationHistory } = request;

    // Get relevant templates
    const relevantTemplates = this.getRelevantTemplates(intent, emotion);

    // Select template using Multi-Armed Bandit UCB1
    const selectedTemplate = this.selectTemplate(relevantTemplates, emotion);

    // Fill template with context
    let response = this.fillTemplate(selectedTemplate, {
      userMessage,
      emotion,
      intent,
      contextData,
      conversationHistory
    });

    // Apply natural language layer
    response = naturalizer.naturalize(response, emotion);

    // Add context memory references
    response = contextMemory.addContextReferences(response, conversationHistory);

    return response;
  }

  /**
   * Get templates relevant to intent and emotion
   */
  private getRelevantTemplates(intent: string, emotion: string): ResponseTemplate[] {
    return this.templates.filter(template => {
      const matchesIntent = template.category === intent || template.category === 'general';
      const matchesEmotion = template.personality.includes(emotion) || template.personality.includes('all');
      return matchesIntent && matchesEmotion;
    });
  }

  /**
   * Select template using UCB1 algorithm
   */
  private selectTemplate(templates: ResponseTemplate[], emotion: string): ResponseTemplate {
    if (templates.length === 0) {
      return this.getDefaultTemplate(emotion);
    }

    // UCB1 algorithm
    let bestTemplate = templates[0];
    let bestScore = -Infinity;

    for (const template of templates) {
      const key = `${template.id}_${emotion}`;
      const pulls = this.banditScores.get(`${key}_pulls`) || 1;
      const reward = this.banditScores.get(key) || 0;
      
      // UCB1 score
      const exploration = Math.sqrt(2 * Math.log(this.getTotalPulls()) / pulls);
      const ucb1Score = (reward / pulls) + exploration;

      if (ucb1Score > bestScore) {
        bestScore = ucb1Score;
        bestTemplate = template;
      }
    }

    // Increment pulls
    const pullKey = `${bestTemplate.id}_${emotion}_pulls`;
    this.banditScores.set(pullKey, (this.banditScores.get(pullKey) || 0) + 1);

    return bestTemplate;
  }

  /**
   * Fill template with dynamic content
   */
  private fillTemplate(template: ResponseTemplate, context: ResponseRequest): string {
    const { userMessage, emotion, intent, contextData, conversationHistory } = context;
    
    let filled = template.template;

    // Replace placeholders
    filled = filled.replace(/\{emotion\}/g, this.getEmotionWord(emotion));
    filled = filled.replace(/\{intent\}/g, this.getIntentWord(intent));
    filled = filled.replace(/\{subject\}/g, contextData.currentSubject?.name || 'your studies');
    filled = filled.replace(/\{examDays\}/g, contextData.learnerProfile?.examProximity?.toString() || 'unknown');
    filled = filled.replace(/\{weakAreas\}/g, contextData.learnerProfile?.weakAreas?.join(', ') || 'none');
    filled = filled.replace(/\{sessionsThisWeek\}/g, contextData.recentPerformance?.sessionsThisWeek?.toString() || '0');
    filled = filled.replace(/\{retentionRate\}/g, contextData.recentPerformance?.retentionRate?.toString() || '0');

    // Add contextual advice based on intent
    if (intent === 'study_help') {
      filled += this.getStudyHelpAdvice(contextData);
    } else if (intent === 'scheduling') {
      filled += this.getSchedulingAdvice(contextData);
    } else if (intent === 'motivation') {
      filled += this.getMotivationAdvice(emotion, contextData);
    }

    return filled;
  }

  /**
   * Get emotion-appropriate word
   */
  private getEmotionWord(emotion: string): string {
    const emotionWords = {
      anxious: 'feeling anxious',
      frustrated: 'frustrated',
      tired: 'tired',
      confused: 'confused',
      motivated: 'motivated',
      hopeless: 'feeling hopeless',
      confident: 'confident',
      neutral: 'feeling'
    };
    return emotionWords[emotion as keyof typeof emotionWords] || 'feeling';
  }

  /**
   * Get intent-appropriate word
   */
  private getIntentWord(intent: string): string {
    const intentWords = {
      study_help: 'study help',
      scheduling: 'scheduling',
      motivation: 'motivation',
      exam_prep: 'exam preparation',
      syllabus_scan: 'syllabus scanning',
      progress: 'progress tracking',
      general_chat: 'chatting'
    };
    return intentWords[intent as keyof typeof intentWords] || 'help';
  }

  /**
   * Get study help advice
   */
  private getStudyHelpAdvice(contextData: any): string {
    const advice = [];

    if (contextData.learnerProfile?.weakAreas?.length > 0) {
      advice.push(`I notice you're struggling with ${contextData.learnerProfile.weakAreas.slice(0, 2).join(' and ')}. Let's focus on those.`);
    }

    if (contextData.currentSubject?.topics) {
      const highWeightTopics = contextData.currentSubject.topics.filter((t: any) => t.weight >= 7);
      if (highWeightTopics.length > 0) {
        advice.push(`Your high-weight topics like ${highWeightTopics[0].name} need extra attention.`);
      }
    }

    return advice.length > 0 ? ` ${advice.join(' ')}` : '';
  }

  /**
   * Get scheduling advice
   */
  private getSchedulingAdvice(contextData: any): string {
    const advice = [];

    if (contextData.learnerProfile?.examProximity && contextData.learnerProfile.examProximity < 14) {
      advice.push('With your exam approaching, we should prioritize high-weight topics.');
    }

    if (contextData.recentPerformance?.sessionsThisWeek < 5) {
      advice.push('Consider increasing your study sessions this week for better retention.');
    }

    return advice.length > 0 ? ` ${advice.join(' ')}` : '';
  }

  /**
   * Get motivation advice
   */
  private getMotivationAdvice(emotion: string, contextData: any): string {
    const advice = [];

    if (emotion === 'hopeless' || emotion === 'anxious') {
      advice.push('Remember that progress takes time, and every small step counts.');
    }

    if (contextData.recentPerformance?.streak > 3) {
      advice.push(`You're on a ${contextData.recentPerformance.streak}-day streak - that's amazing!`);
    }

    return advice.length > 0 ? ` ${advice.join(' ')}` : '';
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(emotion: string): ResponseTemplate {
    return {
      id: 'default',
      category: 'general',
      template: 'I understand you\'re {emotion}. Let me help you with {intent}. How can I assist you today?',
      variations: [],
      personality: ['all'],
      context: []
    };
  }

  /**
   * Get total pulls for UCB1
   */
  private getTotalPulls(): number {
    let total = 0;
    for (const [key, value] of this.banditScores.entries()) {
      if (key.endsWith('_pulls')) {
        total += value;
      }
    }
    return total || 1;
  }

  /**
   * Handle feedback to update bandit scores
   */
  handleFeedback(message: Message, type: 'positive' | 'negative'): void {
    // Extract template ID from message metadata (would need to be stored during generation)
    const templateId = message.metadata?.templateId;
    const emotion = message.metadata?.emotion || 'neutral';

    if (templateId) {
      const key = `${templateId}_${emotion}`;
      const currentScore = this.banditScores.get(key) || 0;
      const reward = type === 'positive' ? 1 : -0.5;
      
      this.banditScores.set(key, currentScore + reward);
    }
  }

  /**
   * Load templates from JSON or define inline
   */
  private loadTemplates(): void {
    this.templates = [
      {
        id: 'study_help_general',
        category: 'study_help',
        template: 'I see you\'re {emotion} about {subject}. Let\'s break this down into manageable steps. What specific topic is giving you trouble?',
        variations: [
          'I understand you\'re {emotion} with {subject}. Let\'s tackle this systematically. Which concept needs clarification?',
          'You\'re {emotion} about {subject} - that\'s completely normal. Let\'s work through this together. What\'s the main challenge?'
        ],
        personality: ['all'],
        context: ['subject', 'emotion']
      },
      {
        id: 'scheduling_create',
        category: 'scheduling',
        template: 'Great! Let\'s create a study schedule for you. With {examDays} days until your exam, we should focus on {weakAreas}. What\'s your preferred daily study time?',
        variations: [
          'Perfect! I\'ll help you build a schedule. Given your exam is in {examDays} days, we need to prioritize {weakAreas}. When do you prefer to study?',
          'Excellent! Let\'s plan your study schedule. With {examDays} days left, we should emphasize {weakAreas}. What\'s your ideal study schedule?'
        ],
        personality: ['all'],
        context: ['examDays', 'weakAreas']
      },
      {
        id: 'motivation_encouragement',
        category: 'motivation',
        template: 'I know you\'re {emotion}, but you\'ve already completed {sessionsThisWeek} sessions this week with {retentionRate}% retention. That\'s real progress! You\'ve got this.',
        variations: [
          'Even though you\'re {emotion}, look at what you\'ve achieved: {sessionsThisWeek} sessions and {retentionRate}% retention. You\'re making real progress!',
          'I understand you\'re {emotion}, but your {sessionsThisWeek} sessions with {retentionRate}% retention show you\'re improving. Keep going!'
        ],
        personality: ['anxious', 'hopeless', 'tired'],
        context: ['sessionsThisWeek', 'retentionRate']
      },
      {
        id: 'exam_prep_strategic',
        category: 'exam_prep',
        template: 'For exam preparation, let\'s focus on high-weight topics first. Based on your profile, we should prioritize {weakAreas}. Have you started reviewing past papers?',
        variations: [
          'Strategic exam prep means focusing on what matters most. Let\'s prioritize {weakAreas}. Are you practicing with past exams?',
          'Exam prep requires focus on high-impact areas. We should emphasize {weakAreas}. How\'s your practice with previous exams?'
        ],
        personality: ['all'],
        context: ['weakAreas']
      },
      {
        id: 'general_greeting',
        category: 'general_chat',
        template: 'Hello! I\'m here to help you with your studies. I can see you\'re working on {subject} and have {sessionsThisWeek} sessions this week. What would you like to focus on today?',
        variations: [
          'Hi! I\'m ready to help with your studies. I notice you\'re studying {subject} and have been consistent with {sessionsThisWeek} sessions. What can I help you with?',
          'Hello! I\'m here to support your learning journey. You\'re making good progress with {subject} - {sessionsThisWeek} sessions this week. How can I assist you today?'
        ],
        personality: ['all'],
        context: ['subject', 'sessionsThisWeek']
      }
    ];
  }

  /**
   * Initialize bandit scores
   */
  private initializeBanditScores(): void {
    for (const template of this.templates) {
      for (const personality of template.personality) {
        this.banditScores.set(`${template.id}_${personality}`, 0);
        this.banditScores.set(`${template.id}_${personality}_pulls`, 1);
      }
    }
  }
}

export const responseGenerator = new ResponseGenerator();
