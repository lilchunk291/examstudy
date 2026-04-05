import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { session } from '$lib/stores/auth'

export interface StudyVaultConfig {
    apiUrl: string
    maxTokens: number
}

const DEFAULT_CONFIG: StudyVaultConfig = {
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
    maxTokens: 1024
}

export async function sendToStudyVault(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {
    try {
        // Get current session for auth token
        let authToken = '';
        const unsubscribe = session.subscribe(s => {
            authToken = s?.access_token || '';
        });
        unsubscribe();

        console.log('StudyVault connector - Auth token:', authToken ? 'present' : 'missing');

        const response = await fetch(`${DEFAULT_CONFIG.apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify({
                message: userMessage,
                connector_id: 'studyvault',
                context: buildStudentContext()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response reader available');
        }

        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            onChunk(chunk);
        }

        onComplete();
        
    } catch (error) {
        console.error('StudyVault connector error:', error);
        onError(error instanceof Error ? error.message : 'Failed to connect to StudyVault AI. Please try again.');
    }
}

export async function validateStudyVaultKey(): Promise<boolean> {
    // For StudyVault, we just check if backend is reachable
    try {
        const response = await fetch(`${DEFAULT_CONFIG.apiUrl}/api/chat/health`);
        return response.ok;
    } catch {
        return false;
    }
}
