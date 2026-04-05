import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface NotebookLMConfig {
    model: string
    maxTokens: number
    apiKey: string
}

const DEFAULT_CONFIG: NotebookLMConfig = {
    model: 'gemini-1.5-pro',
    maxTokens: 1024,
    apiKey: ''
}

export async function sendToNotebookLM(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('notebooklm')

    if (!apiKey) {
        onError('NotebookLM API key not found. Please connect NotebookLM in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // NotebookLM-specific context enhancement
    const notebookLMPrompt = `
${systemPrompt}

You are NotebookLM, Google's AI research assistant.
You excel at analyzing documents, answering questions about sources, and connecting concepts across materials.

For this study session, focus on:
- Document analysis and synthesis
- Source-grounded explanations
- Cross-topic connections
- Research-backed study strategies

Always provide citations for concepts and suggest specific study materials when relevant.
`.trim()

    // format conversation history for NotebookLM API
    const recentHistory = conversationHistory.slice(-10)

    const contents = []
    
    // Add system instruction
    contents.push({
        role: 'user',
        parts: [{ text: notebookLMPrompt }]
    })
    contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will provide document analysis and research assistance for studying.' }]
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
                    temperature: 0.3  // Lower temperature for more factual responses
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
                onError('Invalid NotebookLM API key. Please check your key in Settings → Connectors.')
                return
            }
            if (response.status === 429) {
                onError('NotebookLM rate limit reached. Please wait a moment and try again.')
                return
            }
            if (response.status === 400) {
                onError('Request error. Please try again.')
                return
            }

            onError(errorData.error?.message || 'NotebookLM API error. Please try again.')
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
            onError('Failed to connect to NotebookLM. Please try again.')
        }
    }
}

export async function validateNotebookLMKey(apiKey: string): Promise<boolean> {
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
