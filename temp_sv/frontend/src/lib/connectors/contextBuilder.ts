import { connectorStore } from '$lib/stores/connectorStore';
import type { ContextData } from '$lib/stores/connectorStore';

export async function buildStudentContext(): Promise<string> {
  const contextData = await getContextDataFromStore();
  
  if (!contextData) {
    return `You are a personal AI study tutor integrated into StudyVault AI.
Provide helpful study assistance to the student.`;
  }

  const profile = contextData.learnerProfile || {};
  const subject = contextData.currentSubject || {};
  const schedule = contextData.todaysSchedule || [];
  const performance = contextData.recentPerformance || {};
  
  // Calculate derived values
  const topics = (subject as any).topics || [];
  const daysRemaining = (profile as any).examProximity || 21;
  const todaySessions = schedule.map((s: any) => ({
    topic: s.activity,
    durationMinutes: s.duration,
    sessionType: 'study'
  }));
  
  const weakAreas = (profile as any).weakAreas || [];
  const sessionCount = (performance as any).sessionsThisWeek || 0;
  const avgRetention = (performance as any).retentionRate || 75;
  const streak = (performance as any).streak || 0;
  const avgCognitiveLoad = 6; // Default value

  const systemPrompt = `
You are a personal AI study tutor integrated into StudyVault AI.
You have full context about this student's study situation.
Use this context to give personalized, relevant, and encouraging help.
Always relate your answers to their specific exam, topics, and schedule.

STUDENT PROFILE
Learning Style       ${(profile as any).learningStyle || 'Visual'}
Personality Type     ${(profile as any).personalityType || 'Achiever'}
Stress Response      ${(profile as any).stressResponse || 'Moderate'}
Feedback Preference  ${(profile as any).feedbackPreference || 'Direct'}

CURRENT SUBJECT
Subject              ${(subject as any).name || 'Computer Science'}
Exam Date            ${new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString()}
Days Until Exam      ${daysRemaining}

TOPIC COVERAGE
${topics.map((t: any) => `
Topic                ${t.name || 'Unknown Topic'}
Weight               ${t.weight || 5}/10
Status               ${t.status || 'Not Started'}
Hours Spent          ${t.hoursSpent || 0}h
`).join('')}

TODAY'S PLAN
${todaySessions.map((s: any) => `
Session              ${s.topic}
Duration             ${s.durationMinutes} minutes
Type                 ${s.sessionType}
`).join('')}

WEAK AREAS NEEDING ATTENTION
${weakAreas.map((w: any) => `${w}`).join('\n') || 'None identified'}

RECENT PERFORMANCE
Sessions This Week   ${sessionCount}
Average Retention    ${avgRetention}%
Study Streak         ${streak} days
Cognitive Load Avg   ${avgCognitiveLoad}/10

RESPONSE STYLE INSTRUCTIONS
This student responds best to ${getResponseStyleInstructions((profile as any).learningStyle)}
Avoid ${getAvoidanceList((profile as any).learningStyle)}
Keep responses concise unless student asks for detail
Always end with a specific actionable next step
Be encouraging and supportive
Relate examples to their current topics when possible
`.trim();

  return systemPrompt;
}

function getResponseStyleInstructions(learningStyle?: string): string {
  switch (learningStyle?.toLowerCase()) {
    case 'visual':
      return 'visual examples, diagrams, and step-by-step breakdowns';
    case 'auditory':
      return 'verbal explanations and discussions';
    case 'kinesthetic':
      return 'practical examples and hands-on approaches';
    case 'reading':
      return 'well-structured written explanations';
    default:
      return 'clear, structured explanations with examples';
  }
}

function getAvoidanceList(learningStyle?: string): string {
  switch (learningStyle?.toLowerCase()) {
    case 'visual':
      return 'purely text-heavy explanations without structure';
    case 'auditory':
      return 'long written responses without conversational tone';
    case 'kinesthetic':
      return 'theoretical explanations without practical application';
    case 'reading':
      return 'unstructured conversational responses';
    default:
      return 'overly technical jargon without explanation';
  }
}

async function getContextDataFromStore(): Promise<ContextData | null> {
  return new Promise((resolve) => {
    const unsubscribe = connectorStore.subscribe(state => {
      resolve(state.contextData || null);
    });
    unsubscribe();
  });
}

export class ContextBuilder {
  /**
   * Build comprehensive context string for external APIs
   */
  async buildContext(): Promise<string> {
    return await buildStudentContext();
  }

  /**
   * Build learner profile section
   */
  private buildLearnerProfileSection(profile: any): string {
    if (!profile) return '';

    const sections = [];

    sections.push('## Student Profile');
    
    if (profile.learningStyle) {
      sections.push(`- Learning Style: ${profile.learningStyle}`);
    }
    
    if (profile.personalityType) {
      sections.push(`- Personality Type: ${profile.personalityType}`);
    }
    
    if (profile.examProximity !== undefined) {
      sections.push(`- Exam Proximity: ${profile.examProximity} days`);
    }
    
    if (profile.weakAreas && profile.weakAreas.length > 0) {
      sections.push(`- Weak Areas: ${profile.weakAreas.join(', ')}`);
    }

    return sections.join('\n');
  }

  /**
   * Build subject section
   */
  private buildSubjectSection(subject: any): string {
    if (!subject) return '';

    const sections = [];

    sections.push(`## Current Subject: ${subject.name || 'Unknown'}`);
    
    if (subject.topics && subject.topics.length > 0) {
      sections.push('### Topics:');
      subject.topics.forEach((topic: any) => {
        const status = topic.status || 'unknown';
        const hours = topic.hoursSpent || 0;
        sections.push(`- ${topic.name} (Weight: ${topic.weight || 0}/10, Status: ${status}, Hours: ${hours})`);
      });
    }

    return sections.join('\n');
  }

  /**
   * Build schedule section
   */
  private buildScheduleSection(schedule: any): string {
    if (!schedule || schedule.length === 0) return '';

    const sections = [];

    sections.push('## Today\'s Schedule');
    
    schedule.forEach((item: any) => {
      sections.push(`- ${item.time}: ${item.activity} (${item.duration}min)`);
    });

    return sections.join('\n');
  }

  /**
   * Build performance section
   */
  private buildPerformanceSection(performance: any): string {
    if (!performance) return '';

    const sections = [];

    sections.push('## Recent Performance');
    
    if (performance.sessionsThisWeek !== undefined) {
      sections.push(`- Sessions this week: ${performance.sessionsThisWeek}`);
    }
    
    if (performance.retentionRate !== undefined) {
      sections.push(`- Retention rate: ${performance.retentionRate}%`);
    }
    
    if (performance.streak !== undefined) {
      sections.push(`- Current streak: ${performance.streak} days`);
    }

    return sections.join('\n');
  }

  /**
   * Build instructions section
   */
  private buildInstructionsSection(): string {
    return `## Instructions for AI Assistant

You are a helpful AI study assistant for StudyVault. Please follow these guidelines:

### Response Style
- Use contractions and natural language (don't, can't, I'm, etc.)
- Vary sentence length for natural flow
- Be encouraging and supportive
- Keep responses concise but thorough
- Use em dashes for natural breaks when appropriate

### Personalization
- Reference the student's learning style and personality type
- Consider their exam proximity when prioritizing topics
- Acknowledge their weak areas and provide targeted help
- Reference their current subjects and schedule when relevant

### Behavior
- Always be supportive, never judgmental
- Provide actionable advice and specific steps
- Ask follow-up questions to engage the student
- Share relevant study strategies based on their profile
- Consider their recent performance in recommendations

### Topics to Focus On
- Prioritize high-weight topics if exam is near
- Address weak areas with extra attention
- Suggest study techniques matching their learning style
- Consider their current schedule and time constraints

### Tone
- Friendly and approachable
- Knowledgeable but not condescending
- Motivating and encouraging
- Patient and understanding`;
  }

  /**
   * Build minimal context for privacy-conscious students
   */
  async buildMinimalContext(): Promise<string> {
    const contextData = await getContextDataFromStore();
    
    if (!contextData) return '';

    const sections = [];

    // Only include essential information
    if (contextData.learnerProfile?.learningStyle) {
      sections.push(`Learning Style: ${contextData.learnerProfile.learningStyle}`);
    }
    
    if (contextData.currentSubject?.name) {
      sections.push(`Subject: ${contextData.currentSubject.name}`);
    }
    
    if (contextData.learnerProfile?.examProximity && contextData.learnerProfile.examProximity < 14) {
      sections.push(`Exam in: ${contextData.learnerProfile.examProximity} days`);
    }

    if (sections.length > 0) {
      sections.push('You are a helpful AI study assistant. Be concise and supportive.');
      return sections.join('\n');
    }

    return 'You are a helpful AI study assistant. Be concise and supportive.';
  }

  /**
   * Build context for specific intent
   */
  async buildContextForIntent(intent: string): Promise<string> {
    const baseContext = await this.buildContext();
    
    switch (intent) {
      case 'scheduling':
        return `${baseContext}

### Scheduling Focus
- Create realistic study schedules
- Consider exam proximity and weak areas
- Account for student's available time
- Balance study sessions with breaks
- Prioritize high-weight topics appropriately`;

      case 'study_help':
        return `${baseContext}

### Study Help Focus
- Explain concepts clearly and simply
- Use examples relevant to their subjects
- Consider their learning style
- Break down complex topics
- Provide practice suggestions`;

      case 'motivation':
        return `${baseContext}

### Motivation Focus
- Be encouraging and positive
- Acknowledge their progress and efforts
- Remind them of their capabilities
- Suggest small, achievable goals
- Help them overcome procrastination`;

      case 'exam_prep':
        return `${baseContext}

### Exam Preparation Focus
- Prioritize high-weight topics
- Suggest effective study techniques
- Recommend practice strategies
- Help with time management
- Address exam anxiety`;

      default:
        return baseContext;
    }
  }

  /**
   * Get context summary for display
   */
  async getContextSummary(): Promise<string> {
    const contextData = await getContextDataFromStore();
    
    if (!contextData) return 'No context available';

    const summary = [];

    if (contextData.learnerProfile?.learningStyle) {
      summary.push(`${contextData.learnerProfile.learningStyle} learner`);
    }

    if (contextData.currentSubject?.name) {
      summary.push(`studying ${contextData.currentSubject.name}`);
    }

    if (contextData.learnerProfile?.examProximity && contextData.learnerProfile.examProximity < 30) {
      summary.push(`${contextData.learnerProfile.examProximity} days to exam`);
    }

    if (contextData.recentPerformance?.sessionsThisWeek) {
      summary.push(`${contextData.recentPerformance.sessionsThisWeek} sessions this week`);
    }

    return summary.join(' • ') || 'Basic student profile';
  }

  /**
   * Validate context data
   */
  validateContext(contextData: ContextData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contextData) {
      errors.push('No context data available');
      return { isValid: false, errors };
    }

    // Validate learner profile
    if (contextData.learnerProfile) {
      if (contextData.learnerProfile.examProximity !== undefined && 
          (contextData.learnerProfile.examProximity < 0 || contextData.learnerProfile.examProximity > 365)) {
        errors.push('Exam proximity must be between 0 and 365 days');
      }
    }

    // Validate current subject
    if (contextData.currentSubject) {
      if (!contextData.currentSubject.name) {
        errors.push('Subject name is required');
      }
      
      if (contextData.currentSubject.topics) {
        contextData.currentSubject.topics.forEach((topic: any, index: number) => {
          if (!topic.name) {
            errors.push(`Topic ${index + 1} is missing name`);
          }
          if (topic.weight !== undefined && (topic.weight < 0 || topic.weight > 10)) {
            errors.push(`Topic ${topic.name} weight must be between 0 and 10`);
          }
        });
      }
    }

    // Validate performance data
    if (contextData.recentPerformance) {
      if (contextData.recentPerformance.retentionRate !== undefined && 
          (contextData.recentPerformance.retentionRate < 0 || contextData.recentPerformance.retentionRate > 100)) {
        errors.push('Retention rate must be between 0 and 100');
      }
      
      if (contextData.recentPerformance.sessionsThisWeek !== undefined && 
          contextData.recentPerformance.sessionsThisWeek < 0) {
        errors.push('Sessions this week cannot be negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const contextBuilder = new ContextBuilder();
