<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let currentPhraseIndex = 0;
  let currentPhrase = '';
  let isVisible = true;

  const phrases = [
    'Thinking...',
    'Checking your schedule...',
    'Analyzing your profile...',
    'Looking at your topics...',
    'Personalizing response...',
    'Almost there...'
  ];

  let interval: NodeJS.Timeout;

  onMount(() => {
    // Update phrase every 1500ms
    interval = setInterval(() => {
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      currentPhrase = phrases[currentPhraseIndex];
    }, 1500);

    // Set initial phrase
    currentPhrase = phrases[0];
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
</script>

<div class="typing-indicator" class:visible={isVisible}>
  <div class="message-avatar">
    🧠
  </div>
  <div class="typing-content">
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
    <div class="typing-text">{currentPhrase}</div>
  </div>
</div>

<style>
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    animation: fadeIn 150ms ease;
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .typing-indicator.visible {
    opacity: 1;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--bg-primary);
    flex-shrink: 0;
    margin-top: 4px;
  }

  .typing-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-muted);
    animation: bounce 1.4s ease-in-out infinite;
  }

  .typing-dot:nth-child(1) {
    animation-delay: 0ms;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 200ms;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 400ms;
  }

  .typing-text {
    font-size: 14px;
    color: var(--text-muted);
    font-style: italic;
    opacity: 0;
    animation: fadeIn 300ms ease 200ms forwards;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
