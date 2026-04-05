import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface GeminiConfig {
    model: string
    maxTokens: number
    apiKey: string
}

const DEFAULT_CONFIG: GeminiConfig = {
    model: 'gemini-1.5-pro',
    maxTokens: 1024,
    apiKey: ''
}

export async function sendToGemini(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('gemini')

    if (!apiKey) {
        onError('Gemini API key not found. Please connect Gemini in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // format conversation history for Gemini API
    const recentHistory = conversationHistory.slice(-10)

    const contents = []
    
    // Add system instruction as first user message
    contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
    })
    contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will provide personalized study assistance based on the student context.' }]
    })

    // Add conversation history
    recentHistory.forEach(msg => {
        contents.push({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        })
    })

    // Add current message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    })

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_CONFIG.model}:streamGenerateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    maxOutputTokens: DEFAULT_CONFIG.maxTokens,
                    temperature: 0.7
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            })
        })

        if (!response.ok) {
            const errorData = await response.json()

            // handle specific error cases
            if (response.status === 401 || response.status === 403) {
                onError('Invalid Gemini API key. Please check your key in Settings → Connectors.')
                return
            }
            if (response.status === 429) {
                onError('Gemini rate limit reached. Please wait a moment and try again.')
                return
            }
            if (response.status === 400) {
                onError('Request error. Please try again.')
                return
            }

            onError(errorData.error?.message || 'Gemini API error. Please try again.')
            return
        }

        // stream the response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
            onError('Failed to read response stream.')
            return
        }

        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
                if (!line.trim()) continue

                try {
                    const parsed = JSON.parse(line)

                    if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const text = parsed.candidates[0].content.parts[0].text
                        onChunk(text)
                    }

                    if (parsed.candidates?.[0]?.finishReason) {
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
            onError('Failed to connect to Gemini. Please try again.')
        }
    }
}

export async function validateGeminiKey(apiKey: string): Promise<boolean> {
    // send a minimal test request to validate the key
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'hi' }]
                }]
            })
        })

        return response.ok
    } catch {
        return false
    }
}
