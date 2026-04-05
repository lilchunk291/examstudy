import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface ClaudeConfig {
    model: string
    maxTokens: number
    apiKey: string
}

const DEFAULT_CONFIG: ClaudeConfig = {
    model: 'claude-sonnet-4-6',
    maxTokens: 1024,
    apiKey: ''
}

export async function sendToClaude(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('claude')

    if (!apiKey) {
        onError('Claude API key not found. Please connect Claude in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // format conversation history for Claude API
    // only include last 10 turns to manage token usage
    const recentHistory = conversationHistory.slice(-10)

    const messages = recentHistory.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
    }))

    // add current message
    messages.push({
        role: 'user',
        content: userMessage
    })

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model,
                max_tokens: DEFAULT_CONFIG.maxTokens,
                system: systemPrompt,
                messages,
                stream: true
            })
        })

        if (!response.ok) {
            const errorData = await response.json()

            // handle specific error cases
            if (response.status === 401) {
                onError('Invalid Claude API key. Please check your key in Settings → Connectors.')
                return
            }
            if (response.status === 429) {
                onError('Claude rate limit reached. Please wait a moment and try again.')
                return
            }
            if (response.status === 400) {
                onError('Request error. Please try again.')
                return
            }

            onError(errorData.error?.message || 'Claude API error. Please try again.')
            return
        }

        // stream the response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
            onError('Failed to read response stream.')
            return
        }

        while (true) {
            const { done, value } = await reader.read()

            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue

                const data = line.slice(6).trim()

                if (data === '[DONE]') continue
                if (!data) continue

                try {
                    const parsed = JSON.parse(data)

                    // handle different event types
                    if (parsed.type === 'content_block_delta') {
                        const text = parsed.delta?.text
                        if (text) onChunk(text)
                    }

                    if (parsed.type === 'message_stop') {
                        break
                    }

                } catch {
                    // skip malformed chunks
                    continue
                }
            }
        }

        onComplete()

    } catch (err: any) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            onError('Network error. Check your internet connection and try again.')
        } else {
            onError('Failed to connect to Claude. Please try again.')
        }
    }
}

export async function validateClaudeKey(apiKey: string): Promise<boolean> {
    // send a minimal test request to validate the key
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'hi' }]
            })
        })

        return response.ok
    } catch {
        return false
    }
}
