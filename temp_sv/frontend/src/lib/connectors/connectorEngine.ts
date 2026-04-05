import { connectorStore } from '$lib/stores/connectorStore';

export interface ConnectorRequest {
  connectorId: string;
  message: string;
  context: string;
  signal?: AbortSignal;
}

export interface ConnectorResponse {
  content: string;
  connectorId: string;
  success: boolean;
  error?: string;
}

export class ConnectorEngine {
  /**
   * Send message to external connector
   */
  async sendMessage(request: ConnectorRequest): Promise<string> {
    const { connectorId, message, context, signal } = request;

    // Get connector configuration
    const connector = $connectorStore.connectors.find(c => c.id === connectorId);
    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`);
    }

    if (!connector.isConnected) {
      throw new Error(`Connector ${connectorId} is not connected`);
    }

    // Route to appropriate connector handler
    switch (connectorId) {
      case 'gemini':
        return this.sendToGemini(message, context, connector.config, signal);
      case 'chatgpt':
        return this.sendToChatGPT(message, context, connector.config, signal);
      case 'claude':
        return this.sendToClaude(message, context, connector.config, signal);
      case 'perplexity':
        return this.sendToPerplexity(message, context, connector.config, signal);
      case 'openrouter':
        return this.sendToOpenRouter(message, context, connector.config, signal);
      default:
        throw new Error(`Unsupported connector: ${connectorId}`);
    }
  }

  /**
   * Send message to Google Gemini
   */
  private async sendToGemini(
    message: string,
    context: string,
    config: any,
    signal?: AbortSignal
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullMessage
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Send message to ChatGPT
   */
  private async sendToChatGPT(
    message: string,
    context: string,
    config: any,
    signal?: AbortSignal
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('ChatGPT API key not configured');
    }

    const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI study assistant. Be concise, supportive, and educational.'
          },
          {
            role: 'user',
            content: fullMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Send message to Claude
   */
  private async sendToClaude(
    message: string,
    context: string,
    config: any,
    signal?: AbortSignal
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: fullMessage
          }
        ],
        temperature: 0.7
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Send message to Perplexity
   */
  private async sendToPerplexity(
    message: string,
    context: string,
    config: any,
    signal?: AbortSignal
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'llama-3.1-sonnet-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI study assistant with access to real-time information.'
          },
          {
            role: 'user',
            content: fullMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Send message to OpenRouter
   */
  private async sendToOpenRouter(
    message: string,
    context: string,
    config: any,
    signal?: AbortSignal
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const fullMessage = context ? `${context}\n\nUser: ${message}` : message;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StudyVault AI'
      },
      body: JSON.stringify({
        model: config.model || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI study assistant.'
          },
          {
            role: 'user',
            content: fullMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Test connector connection
   */
  async testConnection(connectorId: string): Promise<boolean> {
    try {
      const connector = $connectorStore.connectors.find(c => c.id === connectorId);
      if (!connector || !connector.isConnected) {
        return false;
      }

      // Send a simple test message
      await this.sendMessage({
        connectorId,
        message: 'Hello, can you respond with just "OK"?',
        context: 'This is a connection test.'
      });

      return true;
    } catch (error) {
      console.error(`Connection test failed for ${connectorId}:`, error);
      return false;
    }
  }

  /**
   * Get available models for connector
   */
  getAvailableModels(connectorId: string): string[] {
    const models = {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      chatgpt: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      claude: ['claude-3-5-sonnet-20241022', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      perplexity: ['llama-3.1-sonnet-small-128k-online', 'llama-3.1-sonnet-large-128k-online'],
      openrouter: [
        'meta-llama/llama-3.1-8b-instruct:free',
        'meta-llama/llama-3.1-70b-instruct',
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o-mini'
      ]
    };

    return models[connectorId as keyof typeof models] || [];
  }

  /**
   * Get connector capabilities
   */
  getConnectorCapabilities(connectorId: string): string[] {
    const capabilities = {
      gemini: ['text-generation', 'multimodal', 'context-long'],
      chatgpt: ['text-generation', 'function-calling', 'context-long'],
      claude: ['text-generation', 'context-long', 'analysis'],
      perplexity: ['text-generation', 'web-search', 'real-time'],
      openrouter: ['text-generation', 'multiple-models', 'cost-effective']
    };

    return capabilities[connectorId as keyof typeof capabilities] || ['text-generation'];
  }
}

export const connectorEngine = new ConnectorEngine();
