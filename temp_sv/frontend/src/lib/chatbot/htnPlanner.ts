/**
 * Hierarchical Task Network (HTN) Planning
 * Based on Erol, Hendler, Nau 1994 "HTN Planning: Complexity and Expressivity" AAAI 1994 Proceedings
 * 
 * Decomposes goals into ordered action sequences for conversation planning
 * Takes winning claims from argumentation layer as current state
 */

export interface Task {
  id: string;
  type: 'abstract' | 'primitive';
  preconditions: Condition[];
  effects: Effect[];
  subtasks?: Task[];
  action?: Action;
  decompositionMethods?: Method[];
}

export interface SubTask {
  id: string;
  type: 'abstract' | 'primitive';
  preconditions: Condition[];
  effects: Effect[];
  subtasks?: Task[];
  action?: Action;
  decompositionMethods?: Method[];
}

export interface Condition {
  type: string;
  parameter: string;
  value: any;
}

export interface Effect {
  type: string;
  parameter: string;
  value: any;
}

export interface Action {
  type: string;
  parameters: Record<string, any>;
  description: string;
}

export interface Method {
  id: string;
  name: string;
  preconditions: Condition[];
  subtasks: SubTask[];
}

export interface HTNOutput {
  plan: Action[];
  currentTask: string;
  expectedOutcome: string;
  fallbackPlan: Action[];
}

export class HTNPlanner {
  private taskLibrary: Map<string, Task> = new Map();
  private currentState: Record<string, any> = {};
  private actionPlan: Action[] = [];
  private currentTaskId = '';

  /**
   * Initialize HTN task library
   */
  constructor() {
    this.initializeTaskLibrary();
  }

  /**
   * Initialize the task library with predefined tasks and methods
   */
  private initializeTaskLibrary(): void {
    // Top-level task: help_student_succeed
    this.taskLibrary.set('help_student_succeed', {
      id: 'help_student_succeed',
      type: 'abstract',
      preconditions: [],
      effects: [],
      subtasks: [],
      decompositionMethods: [
        {
          id: 'method_main_flow',
          name: 'main_conversation_flow',
          preconditions: [],
          subtasks: [
            {
              id: 'assess_current_state',
              type: 'abstract',
              preconditions: [],
              effects: [],
              subtasks: [],
              decompositionMethods: [
                {
                  id: 'method_assess',
                  name: 'assess_student_state',
                  preconditions: [],
                  subtasks: [
                    {
                      id: 'analyze_emotion',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'emotion_vector', value: true }],
                      effects: [{ type: 'adds', parameter: 'emotion_assessment', value: 'completed' }],
                      action: {
                        type: 'analyze_emotion',
                        parameters: {},
                        description: 'Analyze student emotion from message'
                      }
                    },
                    {
                      id: 'check_understanding',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'student_message', value: true }],
                      effects: [{ type: 'adds', parameter: 'understanding_level', value: 'assessed' }],
                      action: {
                        type: 'check_understanding',
                        parameters: {},
                        description: 'Check student understanding level'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'identify_response_goal',
              type: 'abstract',
              preconditions: [{ type: 'equals', parameter: 'emotion_assessment', value: 'completed' }],
              effects: [],
              subtasks: [],
              decompositionMethods: [
                {
                  id: 'method_identify_goal',
                  name: 'identify_primary_goal',
                  preconditions: [],
                  subtasks: [
                    {
                      id: 'determine_strategy',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'winning_claims', value: true }],
                      effects: [{ type: 'sets', parameter: 'response_strategy', value: 'determined' }],
                      action: {
                        type: 'determine_strategy',
                        parameters: {},
                        description: 'Determine response strategy from winning claims'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'select_response_strategy',
              type: 'abstract',
              preconditions: [{ type: 'equals', parameter: 'response_strategy', value: 'determined' }],
              effects: [],
              subtasks: [],
              decompositionMethods: [
                {
                  id: 'method_select_strategy',
                  name: 'select_appropriate_strategy',
                  preconditions: [],
                  subtasks: [
                    {
                      id: 'choose_tone',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'primary_emotion', value: true }],
                      effects: [{ type: 'sets', parameter: 'response_tone', value: 'selected' }],
                      action: {
                        type: 'choose_tone',
                        parameters: {},
                        description: 'Choose appropriate response tone'
                      }
                    },
                    {
                      id: 'plan_content',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'response_strategy', value: true }],
                      effects: [{ type: 'sets', parameter: 'content_plan', value: 'ready' }],
                      action: {
                        type: 'plan_content',
                        parameters: {},
                        description: 'Plan response content structure'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'generate_response',
              type: 'abstract',
              preconditions: [{ type: 'equals', parameter: 'content_plan', value: 'ready' }],
              effects: [],
              subtasks: [],
              decompositionMethods: [
                {
                  id: 'method_generate',
                  name: 'generate_appropriate_response',
                  preconditions: [],
                  subtasks: [
                    {
                      id: 'create_message',
                      type: 'primitive',
                      preconditions: [
                        { type: 'equals', parameter: 'response_tone', value: 'selected' },
                        { type: 'has', parameter: 'case_based_response', value: true }
                      ],
                      effects: [{ type: 'creates', parameter: 'response_text', value: 'generated' }],
                      action: {
                        type: 'create_message',
                        parameters: {},
                        description: 'Generate response message using case-based reasoning'
                      }
                    },
                    {
                      id: 'apply_natural_language',
                      type: 'primitive',
                      preconditions: [{ type: 'equals', parameter: 'response_text', value: 'generated' }],
                      effects: [{ type: 'modifies', parameter: 'response_text', value: 'naturalized' }],
                      action: {
                        type: 'apply_natural_language',
                        parameters: {},
                        description: 'Apply natural language processing to response'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'plan_followup',
              type: 'abstract',
              preconditions: [{ type: 'equals', parameter: 'response_text', value: 'naturalized' }],
              effects: [],
              subtasks: [],
              decompositionMethods: [
                {
                  id: 'method_followup',
                  name: 'plan_followup_actions',
                  preconditions: [],
                  subtasks: [
                    {
                      id: 'prepare_followup',
                      type: 'primitive',
                      preconditions: [{ type: 'has', parameter: 'followup_question', value: true }],
                      effects: [{ type: 'sets', parameter: 'followup_ready', value: 'true' }],
                      action: {
                        type: 'prepare_followup',
                        parameters: {},
                        description: 'Prepare follow-up question if needed'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // Emotion-specific decomposition methods
    this.taskLibrary.set('handle_anxiety', {
      id: 'handle_anxiety',
      type: 'abstract',
      preconditions: [{ type: 'equals', parameter: 'primary_emotion', value: 'anxious' }],
      effects: [],
      subtasks: [],
      decompositionMethods: [
        {
          id: 'method_anxiety',
          name: 'handle_student_anxiety',
          preconditions: [],
          subtasks: [
            {
              id: 'reassure_student',
              type: 'primitive',
              preconditions: [{ type: 'equals', parameter: 'exam_pressure', value: 'high' }],
              effects: [{ type: 'reduces', parameter: 'anxiety_level', value: 0.3 }],
              action: {
                type: 'reassure_student',
                parameters: { intensity: 'warm' },
                description: 'Provide reassurance to reduce anxiety'
              }
            },
            {
              id: 'focus_on_actionable',
              type: 'primitive',
              preconditions: [{ type: 'has', parameter: 'time_remaining', value: true }],
              effects: [{ type: 'increases', parameter: 'sense_of_control', value: 0.4 }],
              action: {
                type: 'focus_on_actionable',
                parameters: {},
                description: 'Focus on actionable steps to increase control'
              }
            }
          ]
        }
      ]
    });

    this.taskLibrary.set('handle_confusion', {
      id: 'handle_confusion',
      type: 'abstract',
      preconditions: [{ type: 'equals', parameter: 'primary_emotion', value: 'confused' }],
      effects: [],
      subtasks: [],
      decompositionMethods: [
        {
          id: 'method_confusion',
          name: 'handle_student_confusion',
          preconditions: [],
          subtasks: [
            {
              id: 'simplify_concept',
              type: 'primitive',
              preconditions: [{ type: 'has', parameter: 'confused_topic', value: true }],
              effects: [{ type: 'reduces', parameter: 'confusion_level', value: 0.5 }],
              action: {
                type: 'simplify_concept',
                parameters: { method: 'analogy' },
                description: 'Simplify concept using analogy'
              }
            },
            {
              id: 'check_understanding',
              type: 'primitive',
              preconditions: [{ type: 'equals', parameter: 'concept_simplified', value: 'true' }],
              effects: [{ type: 'validates', parameter: 'student_understanding', value: 'checked' }],
              action: {
                type: 'check_understanding',
                parameters: {},
                description: 'Check if student understands simplified concept'
              }
            }
          ]
        }
      ]
    });

    this.taskLibrary.set('handle_motivation', {
      id: 'handle_motivation',
      type: 'abstract',
      preconditions: [{ type: 'equals', parameter: 'primary_emotion', value: 'motivated' }],
      effects: [],
      subtasks: [],
      decompositionMethods: [
        {
          id: 'method_motivation',
          name: 'handle_student_motivation',
          preconditions: [],
          subtasks: [
            {
              id: 'channel_energy',
              type: 'primitive',
              preconditions: [{ type: 'has', parameter: 'difficult_topics', value: true }],
              effects: [{ type: 'optimizes', parameter: 'study_focus', value: 'challenging' }],
              action: {
                type: 'channel_energy',
                parameters: { direction: 'challenging_content' },
                description: 'Channel motivation energy into challenging content'
              }
            },
            {
              id: 'set_timebox',
              type: 'primitive',
              preconditions: [{ type: 'equals', parameter: 'energy_channeled', value: 'true' }],
              effects: [{ type: 'sets', parameter: 'work_duration', value: 'timeboxed' }],
              action: {
                type: 'set_timebox',
                parameters: { duration: 45 },
                description: 'Set timebox for focused work session'
              }
            }
          ]
        }
      ]
    });

    this.taskLibrary.set('handle_fatigue', {
      id: 'handle_fatigue',
      type: 'abstract',
      preconditions: [{ type: 'equals', parameter: 'primary_emotion', value: 'tired' }],
      effects: [],
      subtasks: [],
      decompositionMethods: [
        {
          id: 'method_fatigue',
          name: 'handle_student_fatigue',
          preconditions: [],
          subtasks: [
            {
              id: 'suggest_break',
              type: 'primitive',
              preconditions: [{ type: 'greater_than', parameter: 'session_duration', value: 90 }],
              effects: [{ type: 'schedules', parameter: 'break_time', value: 'immediate' }],
              action: {
                type: 'suggest_break',
                parameters: { duration: 20, type: 'active' },
                description: 'Suggest immediate break for fatigue recovery'
              }
            },
            {
              id: 'adjust_intensity',
              type: 'primitive',
              preconditions: [{ type: 'equals', parameter: 'break_refused', value: 'true' }],
              effects: [{ type: 'reduces', parameter: 'cognitive_load', value: 0.4 }],
              action: {
                type: 'adjust_intensity',
                parameters: { level: 'light' },
                description: 'Adjust study intensity for tired state'
              }
            }
          ]
        }
      ]
    });
  }

  /**
   * Check if conditions are satisfied in current state
   */
  private checkPreconditions(preconditions: Condition[]): boolean {
    for (const condition of preconditions) {
      switch (condition.type) {
        case 'has':
          if (!this.currentState[condition.parameter]) {
            return false;
          }
          break;
        case 'equals':
          if (this.currentState[condition.parameter] !== condition.value) {
            return false;
          }
          break;
        case 'greater_than':
          if ((this.currentState[condition.parameter] || 0) <= condition.value) {
            return false;
          }
          break;
        default:
          return false;
      }
    }
    return true;
  }

  /**
   * Apply effects to current state
   */
  private applyEffects(effects: Effect[]): void {
    for (const effect of effects) {
      switch (effect.type) {
        case 'adds':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'sets':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'reduces':
          this.currentState[effect.parameter] = (this.currentState[effect.parameter] || 1) - effect.value;
          break;
        case 'increases':
          this.currentState[effect.parameter] = (this.currentState[effect.parameter] || 0) + effect.value;
          break;
        case 'creates':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'modifies':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'validates':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'optimizes':
          this.currentState[effect.parameter] = effect.value;
          break;
        case 'schedules':
          this.currentState[effect.parameter] = effect.value;
          break;
      }
    }
  }

  /**
   * Decompose abstract task into subtasks using available methods
   */
  private decomposeTask(task: Task): Task[] | null {
    if (task.type === 'primitive') {
      return [task];
    }

    if (!task.decompositionMethods || task.decompositionMethods.length === 0) {
      return null;
    }

    // Find first applicable method
    for (const method of task.decompositionMethods) {
      if (this.checkPreconditions(method.preconditions)) {
        this.currentTaskId = method.id;
        return method.subtasks;
      }
    }

    return null;
  }

  /**
   * Forward decomposition planner
   */
  private forwardDecomposition(rootTask: Task): Action[] {
    const taskQueue: Task[] = [rootTask];
    const actions: Action[] = [];
    
    while (taskQueue.length > 0) {
      const currentTask = taskQueue.shift()!;
      
      // Check preconditions
      if (!this.checkPreconditions(currentTask.preconditions)) {
        continue; // Skip task if preconditions not met
      }
      
      if (currentTask.type === 'primitive') {
        // Execute primitive task
        if (currentTask.action) {
          actions.push(currentTask.action);
          this.applyEffects(currentTask.effects);
        }
      } else {
        // Decompose abstract task
        const subtasks = this.decomposeTask(currentTask);
        if (subtasks) {
          taskQueue.unshift(...subtasks);
        }
      }
    }
    
    return actions;
  }

  /**
   * Create fallback plan for error recovery
   */
  private createFallbackPlan(): Action[] {
    return [
      {
        type: 'provide_basic_encouragement',
        parameters: { tone: 'neutral' },
        description: 'Provide basic encouragement as fallback response'
      },
      {
        type: 'ask_clarifying_question',
        parameters: {},
        description: 'Ask clarifying question to recover conversation'
      }
    ];
  }

  /**
   * Main HTN planning method
   */
  public plan(
    winningClaims: string[],
    beliefState: Record<string, any>,
    studentContext: Record<string, any>
  ): HTNOutput {
    // Initialize current state from inputs
    this.currentState = {
      ...studentContext,
      ...beliefState,
      winning_claims: winningClaims,
      primary_emotion: this.extractPrimaryEmotion(winningClaims),
      exam_pressure: this.extractExamPressure(studentContext),
      session_duration: studentContext.sessionMinutes || 0
    };

    // Get root task
    const rootTask = this.taskLibrary.get('help_student_succeed');
    if (!rootTask) {
      throw new Error('Root task not found in task library');
    }

    try {
      // Execute forward decomposition
      this.actionPlan = this.forwardDecomposition(rootTask);
      
      // Generate expected outcome
      const expectedOutcome = this.generateExpectedOutcome();
      
      return {
        plan: this.actionPlan,
        currentTask: this.currentTaskId,
        expectedOutcome,
        fallbackPlan: this.createFallbackPlan()
      };
    } catch (error) {
      // Return fallback plan if planning fails
      return {
        plan: this.createFallbackPlan(),
        currentTask: 'fallback_recovery',
        expectedOutcome: 'Basic response provided as fallback',
        fallbackPlan: []
      };
    }
  }

  /**
   * Extract primary emotion from winning claims
   */
  private extractPrimaryEmotion(winningClaims: string[]): string {
    const emotionClaims = winningClaims.filter(claim => 
      claim.includes('anxious') || claim.includes('frustrated') || 
      claim.includes('tired') || claim.includes('confused') || 
      claim.includes('motivated') || claim.includes('hopeless') || 
      claim.includes('confident')
    );
    
    if (emotionClaims.length > 0) {
      return emotionClaims[0].split('_').pop() || 'neutral';
    }
    
    return 'neutral';
  }

  /**
   * Extract exam pressure from student context
   */
  private extractExamPressure(studentContext: Record<string, any>): string {
    const proximity = studentContext.examProximity || 'unknown';
    
    if (proximity === 'today' || proximity === 'tomorrow') {
      return 'high';
    } else if (proximity === 'this_week') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate expected outcome description
   */
  private generateExpectedOutcome(): string {
    const actionCount = this.actionPlan.length;
    const actionTypes = this.actionPlan.map((action: Action) => action.type).join(', ');
    
    return `Execute ${actionCount} actions: ${actionTypes}. Expected to provide appropriate response based on student's current state and context.`;
  }
}
