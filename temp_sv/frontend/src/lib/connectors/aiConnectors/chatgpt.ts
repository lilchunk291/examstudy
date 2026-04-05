import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface ChatGPTConfig {
    model: string
    maxTokens: number
    apiKey: string
}

const DEFAULT_CONFIG: ChatGPTConfig = {
    model: 'gpt-4o',
    maxTokens: 1024,
    apiKey: ''
}

export async function sendToChatGPT(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('chatgpt')

    if (!apiKey) {
        onError('ChatGPT API key not found. Please connect ChatGPT in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // format conversation history for OpenAI API
    const recentHistory = conversationHistory.slice(-10)

    const messages = [
        {
            role: 'system',
            content: systemPrompt
        }
    ]

    // Add conversation history
    recentHistory.forEach(msg => {
        messages.push({
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: msg.content
        })
    })

    // Add current message
    messages.push({
        role: 'user',
        content: userMessage
    })

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model,
                messages,
                max_tokens: DEFAULT_CONFIG.maxTokens,
                temperature: 0.7,
                stream: true
            })
        })

        if (!response.ok) {
            const errorData = await response.json()

            // handle specific error cases
            if (response.status === 401) {
                onError('Invalid ChatGPT API key. Please check your key in Settings → Connectors.')
                return
            }
            if (response.status === 429) {
                onError('ChatGPT rate limit reached. Please wait a moment and try again.')
                return
            }
            if (response.status === 400) {
                onError('Request error. Please try again.')
                return
            }

            onError(errorData.error?.message || 'ChatGPT API error. Please try again.')
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

                    if (parsed.choices?.[0]?.delta?.content) {
                        const text = parsed.choices[0].delta.content
                        onChunk(text)
                    }

                    if (parsed.choices?.[0]?.finish_reason) {
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
            onError('Failed to connect to ChatGPT. Please try again.')
        }
    }
}

export async function validateChatGPTKey(apiKey: string): Promise<boolean> {
    // send a minimal test request to validate the key
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 5
            })
        })

        return response.ok
    } catch {
        return false
    }
}
