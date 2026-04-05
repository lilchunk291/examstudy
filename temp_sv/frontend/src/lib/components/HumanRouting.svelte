<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let sessionCount: number = 0;
  export let onDismiss: () => void = () => {};
  export let onAccept: () => void = () => {};
  
  let showRouting = false;
  let countdown = 30;
  let countdownInterval: NodeJS.Timeout | null = null;
  
  // Check if routing should trigger (every 3 sessions)
  $: shouldShowRouting = sessionCount > 0 && sessionCount % 3 === 0;
  
  // Handle routing display
  $: if (shouldShowRouting && !showRouting) {
    showRouting = true;
    startCountdown();
  }
  
  function startCountdown() {
    countdown = 30;
    countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval!);
        countdownInterval = null;
      }
    }, 1000);
  }
  
  function handleDismiss() {
    if (countdown > 0) return; // Can't dismiss before 30 seconds
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    
    showRouting = false;
    onDismiss();
  }
  
  function handleAccept() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    
    showRouting = false;
    onAccept();
  }
  
  onMount(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  });
</script>

{#if showRouting}
  <div class="routing-overlay">
    <div class="routing-content">
      <div class="routing-header">
        <div class="routing-icon">👥</div>
        <h2 class="routing-title">Time to connect with a human?</h2>
        <p class="routing-subtitle">
          You've completed {sessionCount} study sessions. Sometimes talking through concepts with a person helps solidify understanding.
        </p>
      </div>
      
      <div class="routing-options">
        <div class="option-card">
          <div class="option-header">
            <span class="option-icon">📚</span>
            <h3>Study Group</h3>
          </div>
          <p class="option-description">
            Join a study group to discuss concepts with peers. Great for collaborative learning and different perspectives.
          </p>
          <button class="option-button" on:click={handleAccept}>
            Find Study Groups
          </button>
        </div>
        
        <div class="option-card">
          <div class="option-header">
            <span class="option-icon">👨‍🏫</span>
            <h3>Tutor Session</h3>
          </div>
          <p class="option-description">
            Connect with a tutor for personalized help on difficult topics. Ideal for targeted concept clarification.
          </p>
          <button class="option-button" on:click={handleAccept}>
            Book Tutor
          </button>
        </div>
        
        <div class="option-card">
          <div class="option-header">
            <span class="option-icon">💬</span>
            <h3>Study Buddy</h3>
          </div>
          <p class="option-description">
            Find a study partner to work through problems together. Perfect for accountability and peer support.
          </p>
          <button class="option-button" on:click={handleAccept}>
            Find Partner
          </button>
        </div>
      </div>
      
      <div class="routing-actions">
        <button 
          class="dismiss-button" 
          on:click={handleDismiss}
          disabled={countdown > 0}
        >
          {countdown > 0 ? `Wait ${countdown}s` : 'Continue Studying'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .routing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .routing-content {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 32px;
    max-width: 600px;
    width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from { 
      transform: translateY(20px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .routing-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .routing-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .routing-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--text-primary);
  }
  
  .routing-subtitle {
    font-size: 16px;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }
  
  .routing-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .option-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-input);
    padding: 20px;
    text-align: center;
  }
  
  .option-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .option-icon {
    font-size: 32px;
  }
  
  .option-header h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }
  
  .option-description {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 16px 0;
    line-height: 1.4;
  }
  
  .option-button {
    width: 100%;
    background: var(--accent);
    color: #000;
    border: none;
    padding: 12px 20px;
    border-radius: var(--radius-input);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .option-button:hover {
    filter: brightness(1.1);
  }
  
  .routing-actions {
    display: flex;
    justify-content: center;
  }
  
  .dismiss-button {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: var(--radius-input);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .dismiss-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .dismiss-button:not(:disabled):hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    .routing-options {
      grid-template-columns: 1fr;
    }
    
    .routing-content {
      padding: 24px;
      margin: 20px;
    }
  }
</style>
