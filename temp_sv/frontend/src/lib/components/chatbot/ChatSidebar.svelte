<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { chatStore } from '$lib/stores/chatStore';
  import { connectorStore } from '$lib/stores/connectorStore';
  import { Settings, MessageSquare, User } from 'lucide-svelte';

  export let activeConnector: any = null;
  
  const dispatch = createEventDispatcher();

  // Reactive values
  $: conversations = $chatStore.conversations;
  $: currentChatId = $chatStore.currentChatId;

  // Handle new chat
  function handleNewChat() {
    dispatch('newChat');
  }

  // Handle conversation select
  function handleConversationSelect(chatId: string) {
    chatStore.setCurrentChat(chatId);
  }

  // Handle conversation delete
  function handleConversationDelete(chatId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this conversation?')) {
      chatStore.deleteConversation(chatId);
    }
  }

  // Handle connector click
  function handleConnectorClick() {
    dispatch('connectorChange', { connectorId: activeConnector?.id || 'studyvault' });
  }

  // Format timestamp
  function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }

  // Get connector display info
  function getConnectorDisplay() {
    if (!activeConnector) {
      return {
        icon: '🧠',
        name: 'StudyVault AI',
        description: 'Built-in AI assistant'
      };
    }
    
    return {
      icon: activeConnector.icon || '🤖',
      name: activeConnector.name,
      description: activeConnector.description
    };
  }

  $: connectorDisplay = getConnectorDisplay();
</script>

<div class="sidebar-content">
  <!-- Logo -->
  <div class="sidebar-header">
    <div class="logo">
      <div class="logo-icon">SV</div>
      <span>StudyVault AI</span>
    </div>
  </div>

  <!-- New Chat Button -->
  <div class="sidebar-actions">
    <button class="btn btn-primary new-chat-btn" on:click={handleNewChat}>
      <MessageSquare size={16} />
      New Chat
    </button>

    <!-- Active Connector Badge -->
    <div class="connector-badge" on:click={handleConnectorClick}>
      <span class="connector-icon">{connectorDisplay.icon}</span>
      <div class="connector-info">
        <div class="connector-name">{connectorDisplay.name}</div>
        <div class="connector-status">Connected</div>
      </div>
    </div>
  </div>

  <!-- Conversation List -->
  <div class="conversation-list">
    {#each conversations as conversation (conversation.id)}
      <div 
        class="conversation-item" 
        class:active={conversation.id === currentChatId}
        on:click={() => handleConversationSelect(conversation.id)}
      >
        <MessageSquare class="conversation-icon" size={16} />
        <div class="conversation-content">
          <div class="conversation-title">{conversation.title}</div>
          <div class="conversation-timestamp">
            {formatTimestamp(conversation.updatedAt)}
          </div>
        </div>
        <button 
          class="conversation-delete"
          on:click={(e) => handleConversationDelete(conversation.id, e)}
          aria-label="Delete conversation"
        >
          ×
        </button>
      </div>
    {/each}

    {#if conversations.length === 0}
      <div class="empty-state">
        <p class="text-muted text-sm">No conversations yet</p>
        <p class="text-muted text-xs">Start a new chat to begin</p>
      </div>
    {/if}
  </div>

  <!-- User Profile -->
  <div class="user-profile">
    <div class="user-avatar">
      <User size={16} />
    </div>
    <div class="user-info">
      <div class="user-name">Student</div>
      <div class="user-email">student@studyvault.ai</div>
    </div>
    <button class="header-btn" on:click={() => dispatch('settings')}>
      <Settings size={16} />
    </button>
  </div>
</div>

<style>
  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--bg-primary);
  }

  .sidebar-actions {
    padding: 0 20px 20px;
  }

  .new-chat-btn {
    width: 100%;
    justify-content: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .connector-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .connector-badge:hover {
    background: var(--border-subtle);
    border-color: var(--border-subtle);
  }

  .connector-icon {
    font-size: 16px;
  }

  .connector-info {
    flex: 1;
    min-width: 0;
  }

  .connector-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .connector-status {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 1px;
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .conversation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background 150ms ease;
    position: relative;
  }

  .conversation-item:hover {
    background: var(--bg-elevated);
  }

  .conversation-item.active {
    background: var(--accent-muted);
    border-left: 3px solid var(--accent);
  }

  .conversation-icon {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .conversation-content {
    flex: 1;
    min-width: 0;
  }

  .conversation-title {
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-timestamp {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .conversation-delete {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: all 150ms ease;
    font-size: 16px;
    line-height: 1;
  }

  .conversation-item:hover .conversation-delete {
    opacity: 1;
  }

  .conversation-delete:hover {
    background: var(--danger);
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 32px 20px;
  }

  .user-profile {
    padding: 16px 20px;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bg-primary);
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 14px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-btn {
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

  .header-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }
</style>
