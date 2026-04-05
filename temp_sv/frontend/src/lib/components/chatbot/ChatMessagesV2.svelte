<script lang="ts">
  import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-svelte';

  export let messages: any[] = [];

  let copiedId: string | null = null;
  let expandedId: string | null = null;

  function copyToClipboard(content: string, id: string) {
    navigator.clipboard.writeText(content);
    copiedId = id;
    setTimeout(() => {
      copiedId = null;
    }, 2000);
  }

  function toggleExpand(id: string) {
    expandedId = expandedId === id ? null : id;
  }
</script>

<div class="messages-list">
  {#each messages as message (message.id)}
    <div
      class="message-wrapper"
      class:user={message.role === 'user'}
      class:assistant={message.role === 'assistant'}
    >
      {#if message.role === 'user'}
        <!-- User Message -->
        <div class="message-bubble user-message">
          <div class="message-content">
            {message.content}
          </div>
        </div>
      {:else}
        <!-- Assistant Message -->
        <div class="message-bubble assistant-message">
          <div class="message-content">
            {@html formatMessage(message.content)}
          </div>

          {#if message.isStreaming}
            <div class="streaming-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          {/if}

          <div class="message-actions">
            <button
              class="action-btn"
              on:click={() => copyToClipboard(message.content, message.id)}
              title="Copy message"
            >
              {#if copiedId === message.id}
                <Check size={14} />
              {:else}
                <Copy size={14} />
              {/if}
            </button>
            <button class="action-btn" title="Like this response">
              <ThumbsUp size={14} />
            </button>
            <button class="action-btn" title="Dislike this response">
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<script lang="ts">
  function formatMessage(content: string): string {
    // Basic markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    return `<p>${formatted}</p>`;
  }
</script>

<style>
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .message-wrapper {
    display: flex;
    animation: slideIn 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-wrapper.assistant {
    justify-content: flex-start;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 12px;
    word-wrap: break-word;
    position: relative;
  }

  .user-message {
    background: #a3e635;
    color: #000;
    border-radius: 12px 4px 12px 12px;
  }

  .assistant-message {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px 12px 12px 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  .message-content {
    font-size: 13px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  :global(.message-content strong) {
    font-weight: 600;
    color: inherit;
  }

  :global(.message-content em) {
    font-style: italic;
    opacity: 0.9;
  }

  :global(.message-content p) {
    margin: 0;
    margin-bottom: 8px;
  }

  :global(.message-content p:last-child) {
    margin-bottom: 0;
  }

  .streaming-indicator {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    align-items: center;
    height: 12px;
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation: pulse 1.4s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%,
    60%,
    100% {
      opacity: 0.3;
    }
    30% {
      opacity: 1;
    }
  }

  .message-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .assistant-message:hover .message-actions {
    opacity: 1;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 150ms ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 768px) {
    .message-bubble {
      max-width: 85%;
    }
  }
</style>
