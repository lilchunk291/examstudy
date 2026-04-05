import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface PerplexityConfig {
    model: string
    maxTokens: number
    apiKey: string
}

const DEFAULT_CONFIG: PerplexityConfig = {
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 1024,
    apiKey: ''
}

export async function sendToPerplexity(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('perplexity')

    if (!apiKey) {
        onError('Perplexity API key not found. Please connect Perplexity in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // Perplexity-specific context enhancement
    const perplexityPrompt = `
${systemPrompt}

You are Perplexity AI, with access to up-to-date information and web search capabilities.
You excel at providing current, accurate information and real-time data.

For this study session, focus on:
- Current information and recent developments
- Real-world applications and examples
- Latest research and trends in the subject
- Practical, up-to-date study strategies

Always provide current information and cite recent sources when relevant.
`.trim()

    // format conversation history for Perplexity API
    const recentHistory = conversationHistory.slice(-10)

    const messages = [
        {
            role: 'system',
            content: perplexityPrompt
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
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model,
                messages,
                max_tokens: DEFAULT_CONFIG.maxTokens,
                temperature: 0.2,  // Lower temperature for factual accuracy
                stream: true
            })
        })

        if (!response.ok) {
            const errorData = await response.json()

            // handle specific error cases
            if (response.status === 401) {
                onError('Invalid Perplexity API key. Please check your key in Settings → Connectors.')
                return
            }
            if (response.status === 429) {
                onError('Perplexity rate limit reached. Please wait a moment and try again.')
                return
            }
            if (response.status === 400) {
                onError('Request error. Please try again.')
                return
            }

            onError(errorData.error?.message || 'Perplexity API error. Please try again.')
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
            onError('Failed to connect to Perplexity. Please try again.')
        }
    }
}

export async function validatePerplexityKey(apiKey: string): Promise<boolean> {
    // send a minimal test request to validate the key
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-chat',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 5
            })
        })

        return response.ok
    } catch {
        return false
    }
}
