<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Menu, Eye, Trash2, MoreVertical } from 'lucide-svelte';

  export let title: string = 'New Chat';
  export let activeConnector: any = null;
  export let rightPanelOpen: boolean = false;

  const dispatch = createEventDispatcher();

  // Handle connector click
  function handleConnectorClick() {
    dispatch('connectorChange', { connectorId: activeConnector?.id || 'studyvault' });
  }

  // Handle clear chat
  function handleClearChat() {
    if (confirm('Clear all messages in this chat?')) {
      dispatch('clearChat');
    }
  }

  // Get connector display info
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
</script>

<header class="chat-header">
  <!-- Mobile Menu Button -->
  <button class="header-btn mobile-only" on:click={() => dispatch('toggleSidebar')}>
    <Menu size={20} />
  </button>

  <!-- Chat Title -->
  <div class="chat-title">
    {title}
  </div>

  <!-- Active Connector Chip -->
  <div class="connector-chip" on:click={handleConnectorClick}>
    <span class="connector-icon">{connectorDisplay.icon}</span>
    <span class="connector-name">{connectorDisplay.name}</span>
  </div>

  <!-- Header Actions -->
  <div class="header-actions">
    <!-- Context Panel Toggle -->
    <button 
      class="header-btn" 
      class:active={rightPanelOpen}
      on:click={() => dispatch('toggleRightPanel')}
      title="Toggle context panel"
    >
      <Eye size={16} />
    </button>

    <!-- Clear Chat -->
    <button 
      class="header-btn" 
      on:click={handleClearChat}
      title="Clear chat"
    >
      <Trash2 size={16} />
    </button>

    <!-- More Options -->
    <button class="header-btn" title="More options">
      <MoreVertical size={16} />
    </button>
  </div>
</header>

<style>
  .chat-header {
    height: 60px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    gap: 16px;
  }

  .mobile-only {
    display: none;
  }

  .chat-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .connector-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }

  .connector-chip:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .connector-icon {
    font-size: 14px;
  }

  .connector-name {
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .header-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .header-btn.active {
    background: var(--accent-muted);
    color: var(--accent);
  }

  @media (max-width: 768px) {
    .mobile-only {
      display: flex;
    }

    .chat-title {
      font-size: 14px;
    }

    .connector-chip {
      display: none;
    }

    .header-actions .header-btn:not(:first-child):not(:last-child) {
      display: none;
    }
  }
</style>
