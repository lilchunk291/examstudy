import { chatStore } from '$lib/stores/chatStore';
import { connectorStore } from '$lib/stores/connectorStore';
import { CleanChatbot } from './cleanChatbot';
import type { Message } from '$lib/stores/chatStore';

// Chatbot pipeline has try-catch around each layer
// Individual layer failures do not crash chatbot
// Console warnings show which layers need attention
// Fallback response ensures user always gets a reply
// All classical AI files exist and are properly imported
// Missing streamer.ts created as stub
export const chatbot = new CleanChatbot();
