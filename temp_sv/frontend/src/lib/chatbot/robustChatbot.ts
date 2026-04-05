import { chatStore } from '$lib/stores/chatStore';
import { connectorStore } from '$lib/stores/connectorStore';
import { FuzzyLogic } from './fuzzyLogic';
import { DempsterShafer } from './dempsterShafer';
import { Argumentation } from './argumentation';
import { HTNPlanner } from './htnPlanner';
import { HPOMDP } from './hpomdp';
import { CaseBasedReasoning } from './caseBasedReasoning';
import { streamResponse, applyStreaming } from './streamer';
import { contextMemory } from './contextMemory';
import type { Message } from '$lib/stores/chatStore';

export class RobustChatbot {
  private isProcessing = false;

  async processMessage(userMessage: string): Promise<void> {
    console.log('🤖 RobustChatbot.processMessage called with:', userMessage);
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Add user message
      chatStore.addMessage({
        role: 'user',
        content: userMessage
      });

      // Create assistant message
      const assistantMessageId = this.createAssistantMessage();

      // Get context data
      let contextData: any;
      const unsubscribe = connectorStore.subscribe(state => {
        contextData = state.contextData;
      });
      unsubscribe();

      // Chatbot pipeline has try-catch around each layer
      // Individual layer failures do not crash chatbot
      // Console warnings show which layers need attention
      // Fallback response ensures user always gets a reply

      let fuzzyResult = this.defaultFuzzyResult();
      try {
        const fuzzyLogic = new FuzzyLogic();
        fuzzyResult = fuzzyLogic.assessEmotion(userMessage);
        console.log('✅ Fuzzy Logic layer completed');
      } catch (e) {
        console.warn('⚠️ Fuzzy Logic layer error:', e);
      }

      let dsResult = this.defaultDSResult();
      try {
        const dempsterShafer = new DempsterShafer();
        dsResult = dempsterShafer.combineEvidence(userMessage, fuzzyResult);
        console.log('✅ Dempster-Shafer layer completed');
      } catch (e) {
        console.warn('⚠️ Dempster-Shafer layer error:', e);
      }

      let argResult = this.defaultArgResult();
      try {
        const argumentation = new Argumentation();
        argResult = argumentation.evaluateArguments(userMessage, fuzzyResult, dsResult);
        console.log('✅ Argumentation layer completed');
      } catch (e) {
        console.warn('⚠️ Argumentation layer error:', e);
      }

      let htnResult = this.defaultHTNResult();
      try {
        const htnPlanner = new HTNPlanner();
        htnResult = htnPlanner.decomposeTask({ type: 'abstract', name: 'help_student', description: userMessage });
        console.log('✅ HTN Planner layer completed');
      } catch (e) {
        console.warn('⚠️ HTN Planner layer error:', e);
      }

      let pomdpResult = this.defaultPOMDPResult();
      try {
        const hpomdp = new HPOMDP();
        pomdpResult = hpomdp.selectOptimalAction(htnResult);
        console.log('✅ HPOMDP layer completed');
      } catch (e) {
        console.warn('⚠️ HPOMDP layer error:', e);
      }

      let response = 'I am here to help with your studies.';
      try {
        const caseBasedReasoning = new CaseBasedReasoning();
        response = caseBasedReasoning.retrieveAndAdapt(userMessage, pomdpResult, argResult);
        console.log('✅ Case-Based Reasoning layer completed');
      } catch (e) {
        console.warn('⚠️ Case-Based Reasoning layer error:', e);
        response = this.getFallbackResponse(userMessage);
      }

      // Apply natural language processing
      let finalResponse = response;
      try {
        finalResponse = applyStreaming(response);
        console.log('✅ Naturalizer layer completed');
      } catch (e) {
        console.warn('⚠️ Naturalizer layer error:', e);
        finalResponse = response; // Use unnaturalized response
      }

      // Stream the response
      try {
        const streamResult = streamResponse(finalResponse, (chunk: string) => {
          const currentState = chatStore.loadConversations();
          const currentChat = currentState.find((c: any) => c.id === chatStore.currentChatId);
          const currentMessage = currentChat?.messages.find((m: any) => m.id === assistantMessageId);
          
          chatStore.updateMessage(assistantMessageId, {
            content: (currentMessage?.content || '') + chunk,
            isStreaming: true
          });
        });
        
        // Final update to stop streaming
        setTimeout(() => {
          chatStore.updateMessage(assistantMessageId, {
            content: finalResponse,
            isStreaming: false
          });
        }, streamResult.chunks ? streamResult.chunks.length * 50 + 100 : 100);
        
        console.log('✅ Streaming completed');
      } catch (e) {
        console.warn('⚠️ Streaming error:', e);
        // Fallback to direct update
        chatStore.updateMessage(assistantMessageId, {
          content: finalResponse,
          isStreaming: false
        });
      }

    } catch (error) {
      console.error('🔥 RobustChatbot error:', error);
      chatStore.addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Create assistant message placeholder
   */
  private createAssistantMessage(): string {
    const messageId = Date.now().toString();
    chatStore.addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true
    });
    return messageId;
  }

  // Default fallback methods for when layers fail
  private defaultFuzzyResult() {
    return {
      stress: 0.5,
      confusion: 0.5,
      fatigue: 0.5,
      motivation: 0.5,
      timePressure: 0.5
    };
  }

  private defaultDSResult() {
    return {
      belief: { study: 0.5, exam: 0.5 },
      plausibility: { study: 0.7, exam: 0.7 },
      uncertainty: 0.3
    };
  }

  private defaultArgResult() {
    return {
      accepted: ['help_needed'],
      rejected: [],
      defeated: []
    };
  }

  private defaultHTNResult() {
    return {
      actions: [
        { type: 'provide_help', description: 'Provide study assistance' }
      ]
    };
  }

  private defaultPOMDPResult() {
    return {
      action: 'provide_help',
      confidence: 0.5
    };
  }

  private getFallbackResponse(message: string): string {
    const text = message.toLowerCase();
    
    if (text.includes('help') || text.includes('explain')) {
      return "I'm here to help with your studies. What specific topic would you like assistance with?";
    }
    if (text.includes('exam') || text.includes('test')) {
      return "For exam preparation, I recommend creating a structured study plan. Would you like help with that?";
    }
    if (text.includes('schedule') || text.includes('plan')) {
      return "I can help you create an effective study schedule. What subjects are you focusing on?";
    }
    if (text.includes('motivat') || text.includes('encourage')) {
      return "You're capable of achieving your goals! Let's work together to build your confidence.";
    }
    
    return "I'm here to support your learning journey. How can I assist you today?";
  }
}

export const robustChatbot = new RobustChatbot();
