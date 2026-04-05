<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit3, Zap } from 'lucide-svelte';
  import type { Message } from '$lib/stores/chatStore';

  export let messages: Message[] = [];

  const dispatch = createEventDispatcher();

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
  }

  function handleThumbsUp(messageId: string) {
    dispatch('feedback', { messageId, type: 'positive' });
  }

  function handleThumbsDown(messageId: string) {
    dispatch('feedback', { messageId, type: 'negative' });
  }

  function handleRegenerate(messageId: string) {
    dispatch('regenerate', { messageId });
  }

  function handleEdit(messageId: string, content: string) {
    dispatch('edit', { messageId, content });
  }

  function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderContent(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br>');
  }
</script>

<div class="messages-list">
  {#each messages as message (message.id)}
    <div class="message-group" class:user={message.role === 'user'}>
      {#if message.role === 'assistant'}
        <div class="bot-avatar">
          <Zap size={14} fill="#a3e635" />
        </div>
        <div class="message-wrapper">
          <div class="assistant-bubble" class:streaming={message.isStreaming}>
            {@html renderContent(message.content)}
            {#if message.isStreaming && !message.content}
                <div class="thinking-loader">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            {/if}
          </div>
          <div class="message-meta">
            <span class="timestamp">{formatTimestamp(message.timestamp)}</span>
            <div class="actions">
                <button on:click={() => handleCopy(message.content)} title="Copy"><Copy size={12} /></button>
                <button on:click={() => handleThumbsUp(message.id)} title="Helpful"><ThumbsUp size={12} /></button>
                <button on:click={() => handleRegenerate(message.id)} title="Retry"><RefreshCw size={12} /></button>
            </div>
          </div>
        </div>
      {:else}
        <div class="message-wrapper user">
          <div class="user-bubble">
            {message.content}
          </div>
          <div class="message-meta">
            <span class="timestamp">{formatTimestamp(message.timestamp)}</span>
            <button on:click={() => handleEdit(message.id, message.content)} title="Edit"><Edit3 size={12} /></button>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-bottom: 40px;
  }

  .message-group {
    display: flex;
    gap: 16px;
    animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .message-group.user {
    justify-content: flex-end;
  }

  .bot-avatar {
    width: 32px;
    height: 32px;
    background: rgba(163, 230, 53, 0.1);
    border: 1px solid rgba(163, 230, 53, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a3e635;
    flex-shrink: 0;
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 85%;
  }

  .message-wrapper.user {
    align-items: flex-end;
  }

  .assistant-bubble {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 16px 20px;
    border-radius: 4px 20px 20px 20px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
    line-height: 1.7;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }

  .user-bubble {
    background: #a3e635;
    color: #000;
    padding: 12px 20px;
    border-radius: 20px 20px 4px 20px;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.5;
    box-shadow: 0 8px 24px rgba(163, 230, 53, 0.15);
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .message-group:hover .message-meta {
    opacity: 1;
  }

  .timestamp {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.2);
    font-weight: 500;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .actions button, .message-meta button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 2px;
    transition: color 0.2s;
  }

  .actions button:hover, .message-meta button:hover {
    color: #a3e635;
  }

  .thinking-loader {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }

  .thinking-loader .dot {
    width: 6px;
    height: 6px;
    background: #a3e635;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  .thinking-loader .dot:nth-child(2) { animation-delay: 0.2s; }
  .thinking-loader .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .assistant-bubble :global(strong) { color: #a3e635; font-weight: 700; }
  .assistant-bubble :global(.inline-code) {
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9em;
    color: #38bdf8;
  }
</style>
