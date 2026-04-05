<!-- Usage Cap Overlays - Section 5.1 -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { usageStore } from '$lib/stores/usageStore';
  
  export let type: '45min' | '8opens';
  export let onConfirm: () => void;
  
  let showOverlay = false;
  let countdownSeconds = 30;
  let canDismiss = false;
  
  $: if (type === '45min') {
    showOverlay = $shouldShow45MinOverlay;
  } else {
    showOverlay = $shouldShow8OpensOverlay;
  }
  
  onMount(() => {
    if (showOverlay) {
      const timer = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds <= 0) {
          canDismiss = true;
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  });
  
  function handleConfirm() {
    if (canDismiss) {
      if (type === '45min') {
        usageStore.show45MinOverlay();
      } else {
        usageStore.show8OpensOverlay();
      }
      onConfirm();
    }
  }
</script>

{#if showOverlay}
  <div class="overlay-backdrop">
    <div class="overlay-card" class:can-dismiss={canDismiss}>
      <div class="overlay-icon">
        {#if type === '45min'}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 12"/>
          </svg>
        {:else}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        {/if}
      </div>
      
      <div class="overlay-content">
        <h2>
          {#if type === '45min'}
            Time Limit Reached
          {:else}
            Usage Pattern Detected
          {/if}
        </h2>
        
        <p class="overlay-message">
          {#if type === '45min'}
            You have been using the app for 45 minutes today.
            That's enough. Close this and go study.
          {:else}
            You have opened this app 8 times today without starting a session.
            Close it. Set a timer for 25 minutes. Open your notes. Start.
          {/if}
        </p>
        
        <div class="countdown">
          {#if !canDismiss}
            <span class="countdown-text">Wait {countdownSeconds}s</span>
          {:else}
            <span class="ready-text">Ready to dismiss</span>
          {/if}
        </div>
        
        <button 
          class="confirm-btn" 
          class:enabled={canDismiss}
          on:click={handleConfirm}
          disabled={!canDismiss}
        >
          {#if type === '45min'}
            I understand
          {:else}
            Close app
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }
  
  .overlay-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .overlay-card.can-dismiss {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.1);
  }
  
  .overlay-icon {
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  
  .overlay-content h2 {
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }
  
  .overlay-message {
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 20px 0;
  }
  
  .countdown {
    margin-bottom: 24px;
  }
  
  .countdown-text {
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
  }
  
  .ready-text {
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
  }
  
  .confirm-btn {
    width: 100%;
    padding: 12px 24px;
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: var(--radius-input);
    font-size: 14px;
    font-weight: 600;
    cursor: not-allowed;
    opacity: 0.5;
    transition: all 0.2s ease;
  }
  
  .confirm-btn.enabled {
    cursor: pointer;
    opacity: 1;
  }
  
  .confirm-btn.enabled:hover {
    filter: brightness(1.1);
  }
  
  @media (max-width: 480px) {
    .overlay-card {
      padding: 24px;
      margin: 16px;
    }
    
    .overlay-content h2 {
      font-size: 18px;
    }
    
    .overlay-message {
      font-size: 13px;
    }
  }
</style>
