<script lang="ts">
  import { onMount } from 'svelte';
  import ChatSidebar from './ChatSidebar.svelte';
  import ChatHeader from './ChatHeader.svelte';
  import ChatMessages from './ChatMessages.svelte';
  import ChatInput from './ChatInput.svelte';
  import ContextPanel from './ContextPanel.svelte';
  import SuggestionChips from './SuggestionChips.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import { chatStore } from '$lib/stores/chatStore';
  import { connectorStore } from '$lib/stores/connectorStore';
  import { chatbot } from '$lib/chatbot/chatbot';

  let sidebarOpen = false;
  let rightPanelOpen = false;
  let showSuggestions = true;
  let isTyping = false;

  // FIX: Track window width reactively to avoid SSR crashes from window.innerWidth in template
  let isMobile = false;

  // Reactive values from stores
  $: messages = $chatStore.conversations.find((c: any) => c.id === $chatStore.currentChatId)?.messages || [];
  $: activeConnector = $connectorStore.activeConnector;
  $: contextData = $connectorStore.contextData;

  // Get current chat title
  $: currentChatTitle = $chatStore.conversations.find(c => c.id === $chatStore.currentChatId)?.title || 'New Chat';

  // FIX: Hide suggestions once messages exist
  $: if (messages.length > 0) {
    showSuggestions = false;
  }

  // Handle mobile menu toggle
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    // FIX: Close right panel when opening sidebar on mobile to avoid overlap
    if (isMobile && sidebarOpen) rightPanelOpen = false;
  }

  // Handle right panel toggle
  function toggleRightPanel() {
    rightPanelOpen = !rightPanelOpen;
    // FIX: Close sidebar when opening right panel on mobile to avoid overlap
    if (isMobile && rightPanelOpen) sidebarOpen = false;
  }

  // Handle new chat
  function handleNewChat() {
    chatStore.newChat();
    showSuggestions = true;
    sidebarOpen = false;
  }

  // Handle message send
  async function handleMessage(message: string) {
    if (!message?.trim() || isTyping) return; // FIX: Guard against empty/duplicate sends
    console.log('🚀 ChatLayout received message:', message);
    isTyping = true;
    showSuggestions = false;

    try {
      await chatbot.processMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      isTyping = false;
    }
  }

  // Handle connector change
  function handleConnectorChange(event: CustomEvent) {
    connectorStore.setActiveConnector(event.detail);
  }

  // Handle message feedback
  function handleFeedback(event: CustomEvent) {
    const { messageId, type } = event.detail;
    chatbot.handleFeedback(messageId, type);
  }

  // Handle message regeneration
  function handleRegenerate(event: CustomEvent) {
    const { messageId } = event.detail;
    chatbot.regenerateResponse(messageId);
  }

  // Handle message edit
  function handleEdit(event: CustomEvent) {
    const { messageId, content } = event.detail;
    chatbot.editMessage(messageId, content);
  }

  // Close panels on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      sidebarOpen = false;
      rightPanelOpen = false;
    }
  }

  // FIX: Track window resize safely inside onMount (avoids SSR crash)
  function handleResize() {
    isMobile = window.innerWidth <= 768;
    // Auto-close panels when switching to desktop
    if (!isMobile) {
      sidebarOpen = false;
      rightPanelOpen = false;
    }
  }

  onMount(() => {
    handleResize(); // Set initial value
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<svelte:head>
  <title>StudyVault AI - Chat</title>
</svelte:head>

<!--
  FIX: Removed window.innerWidth from template (SSR crash).
  sidebar-closed / right-panel-closed are now applied based on reactive state only.
-->
<div
  class="chat-layout"
  class:sidebar-open={sidebarOpen}
  class:right-panel-open={rightPanelOpen}
>
  <!-- Sidebar -->
  <!-- FIX: Replaced broken `mobile-hidden` + `open` pattern with a single reactive class -->
  <aside class="chat-sidebar" class:open={sidebarOpen} aria-hidden={!sidebarOpen && isMobile}>
    <ChatSidebar
      {activeConnector}
      on:newChat={handleNewChat}
      on:connectorChange={(e) => handleConnectorChange(e)}
      on:close={() => (sidebarOpen = false)}
    />
  </aside>

  <!-- Main Chat Area -->
  <main class="chat-main">
    <!-- Header -->
    <ChatHeader
      title={currentChatTitle}
      {activeConnector}
      {rightPanelOpen}
      on:toggleSidebar={toggleSidebar}
      on:toggleRightPanel={toggleRightPanel}
      on:clearChat={() => chatStore.clearChat()}
    />

    <!-- Messages Area -->
    <div class="chat-messages">
      <div class="message-container">
        {#if showSuggestions && messages.length === 0}
          <SuggestionChips on:send={(e) => handleMessage(e.detail)} />
        {/if}

        <ChatMessages
          {messages}
          on:feedback={handleFeedback}
          on:regenerate={handleRegenerate}
          on:edit={handleEdit}
        />

        {#if isTyping}
          <TypingIndicator />
        {/if}
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-container">
      <ChatInput
        on:send={(e) => handleMessage(e.detail)}
        on:connectorChange={(e) => handleConnectorChange(e)}
        {activeConnector}
        disabled={isTyping}
      />
    </div>
  </main>

  <!-- Right Panel -->
  <!-- FIX: Same sidebar fix applied here -->
  <aside class="right-panel" class:open={rightPanelOpen} aria-hidden={!rightPanelOpen && isMobile}>
    <ContextPanel
      {contextData}
      {activeConnector}
      on:close={() => (rightPanelOpen = false)}
    />
  </aside>
</div>

<!-- Mobile Backdrop -->
<!-- FIX: Added missing CSS for mobile-backdrop; only renders when a panel is open -->
{#if sidebarOpen || rightPanelOpen}
  <div
    class="mobile-backdrop"
    role="button"
    tabindex="0"
    on:click={() => {
      sidebarOpen = false;
      rightPanelOpen = false;
    }}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        sidebarOpen = false;
        rightPanelOpen = false;
      }
    }}
    aria-label="Close panels"
  />
{/if}

<style>
  /* ─── Layout ─────────────────────────────────────────────── */
  .chat-layout {
    display: grid;
    /* FIX: Sidebar and right panel collapse to 0 by default; open via modifier classes */
    grid-template-columns: 0 1fr 0;
    grid-template-rows: 100vh;
    height: 100vh;
    overflow: hidden;
    transition: grid-template-columns 0.25s ease;
  }

  .chat-layout.sidebar-open {
    grid-template-columns: 260px 1fr 0;
  }

  .chat-layout.right-panel-open {
    grid-template-columns: 0 1fr 320px;
  }

  .chat-layout.sidebar-open.right-panel-open {
    grid-template-columns: 260px 1fr 320px;
  }

  /* ─── Sidebar ─────────────────────────────────────────────── */
  .chat-sidebar {
    overflow: hidden;
    height: 100vh;
    transition: transform 0.25s ease;
  }

  /* ─── Main ────────────────────────────────────────────────── */
  .chat-main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    min-width: 0; /* FIX: Prevents flex child overflow in grid */
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .message-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chat-input-container {
    flex-shrink: 0;
    padding: 1rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  /* ─── Right Panel ─────────────────────────────────────────── */
  .right-panel {
    overflow: hidden;
    height: 100vh;
    transition: transform 0.25s ease;
    border-left: 1px solid var(--border-color, #e5e7eb);
  }

  /* ─── Mobile ──────────────────────────────────────────────── */
  @media (max-width: 768px) {
    /* FIX: On mobile, sidebar and right panel are fixed overlays, not grid columns */
    .chat-layout {
      grid-template-columns: 1fr !important;
    }

    .chat-sidebar,
    .right-panel {
      position: fixed;
      top: 0;
      height: 100vh;
      width: 280px;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      background: var(--sidebar-bg, #fff);
    }

    .chat-sidebar {
      left: 0;
    }

    .chat-sidebar.open {
      transform: translateX(0);
    }

    .right-panel {
      right: 0;
      transform: translateX(100%);
    }

    .right-panel.open {
      transform: translateX(0);
    }
  }

  /* ─── Backdrop ────────────────────────────────────────────── */
  /* FIX: Was missing entirely — caused backdrop to be invisible/non-functional */
  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    cursor: pointer;
  }

  @media (min-width: 769px) {
    .mobile-backdrop {
      display: none;
    }
  }
</style>