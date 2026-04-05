import { chatStore } from '$lib/stores/chatStore';
import { connectorStore } from '$lib/stores/connectorStore';
import { reasoningStore } from '$lib/stores/reasoningStore';
import { FuzzyLogic } from './fuzzyLogic';
import { DempsterShafer } from './dempsterShafer';
import { Argumentation } from './argumentation';
import { HTNPlanner } from './htnPlanner';
import { HPOMDP } from './hpomdp';
import { CaseBasedReasoning } from './caseBasedReasoning';
import { Naturalizer } from './naturalizer';
import { Streamer } from './streamer';
import { sendToClaude } from '$lib/connectors/aiConnectors/claude';
import { sendToGemini } from '$lib/connectors/aiConnectors/gemini';
import { sendToStudyVault } from '$lib/connectors/aiConnectors/studyvault';
import type { Message } from '$lib/stores/chatStore';

export class CleanChatbot {
  private isProcessing = false;
  private fuzzy = new FuzzyLogic();
  private ds = new DempsterShafer();
  private args = new Argumentation();
  private htn = new HTNPlanner();
  private pomdp = new HPOMDP();
  private cbr = new CaseBasedReasoning();
  private naturalizer = new Naturalizer();
  private streamer = new Streamer();

  async processMessage(options: {
  input: string;
  conversationId: string;
  connectorId: string;
  profile: any;
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onReasoningUpdate?: (state: any) => void;
}): Promise<void> {
    console.log('🤖 CleanChatbot.processMessage called with:', options.input);
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Add user message
      chatStore.addMessage({
        role: 'user',
        content: options.input
      });

      // Create assistant message
      const assistantMessageId = this.createAssistantMessage();

      // Check for active external connector
      let activeConnector: string = 'studyvault';
      const unsubscribe = connectorStore.subscribe(state => {
        activeConnector = state.activeConnectorId || 'studyvault';
      });
      unsubscribe();

      // Route to external connectors if active
      if (activeConnector === 'claude') {
        await this.sendToClaudeConnector(options.input, assistantMessageId);
        options.onComplete?.();
        return;
      }

      if (activeConnector === 'gemini') {
        await this.sendToGeminiConnector(options.input, assistantMessageId);
        options.onComplete?.();
        return;
      }

      // If we're here, we use the StudyVault Agentic Pipeline
      // Default StudyVault AI pipeline below
      const context = this.getContext();

      // LAYER 1 fuzzy logic
      let fuzzyResult: any = this.defaultFuzzyResult();
      try {
        fuzzyResult = this.fuzzy.assessEmotion(
          options.input,
          context.examProximity || 0.5
        );
        console.log('Fuzzy result:', fuzzyResult);
      } catch (e) {
        console.warn('Fuzzy layer failed:', e);
      }

      // LAYER 2 dempster shafer
      let dsResult: any = this.defaultDSResult();
      try {
        dsResult = this.ds.processEvidence(
          options.input, 
          context, 
          context.examProximity || 'next_week',
          new Date().getHours()
        );
        console.log('DS result:', dsResult);
      } catch (e) {
        console.warn('DS layer failed:', e);
      }

      // if DS says probe ask clarifying question first
      if (dsResult.shouldProbe && dsResult.probeQuestion) {
        await this.streamer.stream(
          assistantMessageId,
          dsResult.probeQuestion,
          (id, content) => {
            chatStore.updateMessage(id, { content });
            options.onChunk?.(content);
          },
          (id) => {
            chatStore.updateMessage(id, { isStreaming: false });
          }
        );
        return;
      }

      // LAYER 3 argumentation
      let argResult: any = this.defaultArgResult();
      try {
        argResult = this.args.evaluateArguments(
          fuzzyResult.emotionVector,
          dsResult.beliefs,
          dsResult.uncertainties,
          context,
          options.input
        );
        console.log('Arg result:', argResult);
      } catch (e) {
        console.warn('Argumentation layer failed:', e);
      }

      // LAYER 4 HTN planning
      let htnResult: any = this.defaultHTNResult();
      try {
        htnResult = this.htn.plan(
          argResult.winningClaims,
          fuzzyResult.emotionVector,
          context
        );
        console.log('HTN result:', htnResult);
      } catch (e) {
        console.warn('HTN layer failed:', e);
      }

      // LAYER 5 HPOMDP
      let pomdpResult: any = this.defaultPOMDPResult();
      try {
        pomdpResult = this.pomdp.process(
          options.input,
          [{ state: 'unknown', probability: 1.0 }],
          [{ state: 'unknown', probability: 1.0 }],
          htnResult.plan || [],
          context
        );
        console.log('POMDP result:', pomdpResult);
      } catch (e) {
        console.warn('POMDP layer failed:', e);
      }

      // LAYER 6 case based reasoning
      let response = this.getFallbackResponse(options.input);
      let cbrResult: any = null;
      try {
        const problem = {
          emotion: fuzzyResult.primaryEmotion,
          intent: 'study_help', // Would come from intent detector
          examProximity: context.examProximity || 'next_week',
          learnerType: context.learnerType || 'visual',
          sessionMinutes: context.sessionMinutes || 60,
          topicDifficulty: context.topicDifficulty || 5,
          winningClaims: argResult.winningClaims
        };

        cbrResult = await this.cbr.process(problem, context);
        response = this.naturalizer.naturalize(
          cbrResult.adaptedResponse,
          fuzzyResult.primaryEmotion
        );
        console.log('CBR result:', cbrResult);

        // schedule retain for after response
        setTimeout(() => {
          this.cbr.retainCase(problem, cbrResult.solution, {
            studentRating: 0.8,
            retentionImprovement: 0.7,
            sessionContinued: true
          });
        }, 5000);
      } catch (e) {
        console.warn('CBR layer failed:', e);
      }

      // Update reasoning store for context panel
      reasoningStore.update(s => ({
        ...s,
        fuzzyEmotion: fuzzyResult,
        dsUncertainty: dsResult,
        argWinningClaims: argResult.winningClaims || [],
        htnCurrentTask: htnResult.currentTask,
        pomdpBelief: pomdpResult.responseBeliefState,
        cbrMatchScore: cbrResult?.similarityScore,
        cbrCaseId: cbrResult?.matchedCaseId || cbrResult?.caseId
      }));

      // stream response
      await this.streamer.stream(
        assistantMessageId,
        response,
        (id, content) => {
          chatStore.updateMessage(id, { content });
          options.onChunk?.(content);
        },
        (id) => {
          chatStore.updateMessage(id, { isStreaming: false });
        }
      );

      options.onComplete?.();

    } catch (error) {
      console.error('Chatbot critical error:', error);
      const errorMessage = 'Something went wrong. Try again.';
      chatStore.addMessage({
        role: 'assistant',
        content: errorMessage
      });
      options.onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Create assistant message placeholder
   */
  private createAssistantMessage(): string {
    return chatStore.addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true
    });
  }

  /**
   * Get context data from connector store
   */
  private getContext(): any {
    let contextData: any;
    const unsubscribe = connectorStore.subscribe(state => {
      contextData = state.contextData;
    });
    unsubscribe();
    return contextData || {};
  }

  /**
   * Default fallback results for each layer
   */
  private defaultFuzzyResult() {
    return {
      emotionVector: { neutral: 0.5 },
      primaryEmotion: 'neutral',
      primaryIntensity: 0.5,
      suggestedStrategy: 'neutral',
      confidence: 0.5
    };
  }

  private defaultDSResult() {
    return {
      beliefs: { neutral: 0.5 },
      plausibilities: { neutral: 0.5 },
      uncertainties: { neutral: 0.5 },
      conflictMass: 0,
      shouldProbe: false,
      probeQuestion: null
    };
  }

  private defaultArgResult() {
    return {
      acceptedArguments: [],
      rejectedArguments: [],
      winningClaims: ['neutral_state'],
      reasoningTrace: 'No argumentation available'
    };
  }

  private defaultHTNResult() {
    return {
      currentTask: { id: 'default', type: 'primitive', action: 'respond' },
      plan: [],
      tasks: []
    };
  }

  private defaultPOMDPResult() {
    return {
      responseBeliefState: [{ state: 'unknown', probability: 1.0 }],
      sessionBeliefState: [{ state: 'unknown', probability: 1.0 }],
      selectedAction: 'respond',
      actionConfidence: 0.5,
      updatedBeliefs: {
        response: [{ state: 'unknown', probability: 1.0 }],
        session: [{ state: 'unknown', probability: 1.0 }]
      }
    };
  }

  /**
   * Fallback response if all layers fail
   */
  private getFallbackResponse(input: string): string {
    return "I'm here to help with your studies. Could you tell me more about what you need assistance with?";
  }

  /**
   * Send message to Claude connector
   */
  private async sendToClaudeConnector(input: string, assistantMessageId: string): Promise<void> {
    try {
      await sendToClaude(
        input,
        [],
        (chunk: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: chunk,
            isStreaming: true
          });
        },
        () => {
          chatStore.updateMessage(assistantMessageId, {
            isStreaming: false
          });
        },
        (error: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: `Claude error: ${error}`,
            isStreaming: false
          });
        }
      );
    } catch (error) {
      console.error('Claude connector error:', error);
      chatStore.updateMessage(assistantMessageId, {
        content: 'Failed to connect to Claude. Please try again.',
        isStreaming: false
      });
    }
  }

  /**
   * Send message to StudyVault connector
   */
  private async sendToStudyVaultConnector(input: string, assistantMessageId: string, options: any): Promise<void> {
    try {
      await sendToStudyVault(
        input,
        [],
        (chunk: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: chunk,
            isStreaming: true
          });
        },
        () => {
          chatStore.updateMessage(assistantMessageId, {
            isStreaming: false
          });
        },
        (error: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: `StudyVault error: ${error}`,
            isStreaming: false
          });
        }
      );
    } catch (error) {
      console.error('StudyVault connector error:', error);
      chatStore.updateMessage(assistantMessageId, {
        content: 'Failed to connect to StudyVault AI. Please try again.',
        isStreaming: false
      });
    }
  }
  private async sendToGeminiConnector(input: string, assistantMessageId: string): Promise<void> {
    try {
      await sendToGemini(
        input,
        [],
        (chunk: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: chunk,
            isStreaming: true
          });
        },
        () => {
          chatStore.updateMessage(assistantMessageId, {
            isStreaming: false
          });
        },
        (error: string) => {
          chatStore.updateMessage(assistantMessageId, {
            content: `Gemini error: ${error}`,
            isStreaming: false
          });
        }
      );
    } catch (error) {
      console.error('Gemini connector error:', error);
      chatStore.updateMessage(assistantMessageId, {
        content: 'Failed to connect to Gemini. Please try again.',
        isStreaming: false
      });
    }
  }
}

// Export singleton instance
export const chatbot = new CleanChatbot();

// Export processMessage function for easier usage
export async function processMessage(options: {
  input: string;
  conversationId: string;
  connectorId: string;
  profile: any;
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}): Promise<void> {
  return chatbot.processMessage(options);
}
