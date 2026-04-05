<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { Camera, Paperclip, Send } from 'lucide-svelte';

  export let activeConnector: any = null;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  let message = '';
  let textareaElement: HTMLTextAreaElement;
  let isComposing = false;

  // Auto-resize textarea
  function resizeTextarea() {
    if (!textareaElement) return;
    
    textareaElement.style.height = 'auto';
    const scrollHeight = textareaElement.scrollHeight;
    const maxHeight = 144; // 6 lines at 24px each
    
    textareaElement.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    
    if (scrollHeight > maxHeight) {
      textareaElement.style.overflowY = 'auto';
    } else {
      textareaElement.style.overflowY = 'hidden';
    }
  }

  // Handle input change
  function handleInput() {
    resizeTextarea();
  }

  // Handle keydown
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  // Handle composition events (for IME input)
  function handleCompositionStart() {
    isComposing = true;
  }

  function handleCompositionEnd() {
    isComposing = false;
  }

  // Handle send
  function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    dispatch('send', { detail: trimmedMessage });
    message = '';
    
    // Reset textarea height
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.overflowY = 'hidden';
    }
  }

  // Handle camera click
  function handleCamera() {
    dispatch('camera');
  }

  // Handle paperclip click
  function handlePaperclip() {
    dispatch('paperclip');
  }

  // Handle connector change
  function handleConnectorChange() {
    dispatch('connectorChange');
  }

  // Get connector display
  function getConnectorDisplay() {
    if (!activeConnector) {
      return {
        icon: '🧠',
        name: 'StudyVault AI'
      };
    }
    
    return {
      icon: activeConnector.icon || '🤖',
      name: activeConnector.name
    };
  }

  $: connectorDisplay = getConnectorDisplay();
  $: canSend = message.trim().length > 0 && !disabled;

  onMount(() => {
    resizeTextarea();
  });
</script>

<div class="input-wrapper">
  <!-- Connector Switcher -->
  <div class="connector-switcher" on:click={handleConnectorChange}>
    <span class="connector-icon">{connectorDisplay.icon}</span>
    <span class="connector-name">{connectorDisplay.name}</span>
    <span class="connector-arrow">▼</span>
  </div>

  <!-- Input Area -->
  <div class="input-container">
    <!-- Left Buttons -->
    <div class="input-left-buttons">
      <button 
        class="input-btn" 
        on:click={handleCamera}
        title="Scan syllabus"
        disabled={disabled}
      >
        <Camera size={16} />
      </button>
      <button 
        class="input-btn" 
        on:click={handlePaperclip}
        title="Attach file"
        disabled={disabled}
      >
        <Paperclip size={16} />
      </button>
    </div>

    <!-- Text Input -->
    <textarea
      bind:this={textareaElement}
      bind:value={message}
      class="chat-input"
      placeholder="Message StudyVault..."
      on:input={handleInput}
      on:keydown={handleKeydown}
      on:compositionstart={handleCompositionStart}
      on:compositionend={handleCompositionEnd}
      disabled={disabled}
      rows="1"
    ></textarea>

    <!-- Send Button -->
    <button 
      class="input-right-button" 
      class:disabled={!canSend}
      on:click={handleSend}
      disabled={!canSend}
      title="Send message"
    >
      <Send size={16} />
    </button>
  </div>
</div>

<style>
  .input-wrapper {
    max-width: var(--input-max-width);
    margin: 0 auto;
  }

  .connector-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
    width: fit-content;
  }

  .connector-switcher:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .connector-icon {
    font-size: 14px;
  }

  .connector-name {
    font-weight: 500;
  }

  .connector-arrow {
    font-size: 10px;
    margin-left: auto;
    transition: transform 150ms ease;
  }

  .connector-switcher:hover .connector-arrow {
    transform: translateY(1px);
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: flex-end;
  }

  .chat-input {
    flex: 1;
    min-height: 48px;
    max-height: 144px;
    padding: 14px 56px 14px 48px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 15px;
    line-height: 1.5;
    resize: none;
    outline: none;
    transition: all 150ms ease;
    overflow-y: hidden;
  }

  .chat-input::placeholder {
    color: var(--text-muted);
  }

  .chat-input:focus {
    border-color: var(--accent);
    box-shadow: var(--shadow-glow-accent);
  }

  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-left-buttons {
    position: absolute;
    left: 12px;
    bottom: 14px;
    display: flex;
    gap: 8px;
  }

  .input-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .input-btn:hover:not(:disabled) {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .input-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-right-button {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--text-muted);
    border: none;
    color: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .input-right-button:not(:disabled) {
    background: var(--accent);
  }

  .input-right-button:not(:disabled):hover {
    background: var(--accent-hover);
    transform: scale(0.95);
  }

  .input-right-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .connector-switcher {
      font-size: 12px;
      padding: 6px 10px;
    }

    .chat-input {
      padding: 12px 48px 12px 44px;
      font-size: 16px; /* Prevent zoom on iOS */
    }

    .input-left-buttons {
      left: 8px;
      bottom: 12px;
    }

    .input-btn {
      width: 28px;
      height: 28px;
    }

    .input-right-button {
      width: 32px;
      height: 32px;
      right: 6px;
      bottom: 6px;
    }
  }
</style>
