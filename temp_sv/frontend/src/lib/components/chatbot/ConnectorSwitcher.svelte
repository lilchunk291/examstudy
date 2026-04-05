<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { connectorStore } from '$lib/stores/connectorStore';
  import { ChevronUp, ExternalLink, Check, X } from 'lucide-svelte';

  export let position: 'sidebar' | 'input' = 'sidebar';
  export let activeConnector: any = null;

  const dispatch = createEventDispatcher();
  let isOpen = false;
  let popoverElement: HTMLElement;

  // Reactive values
  $: connectorsByCategory = $connectorStore.connectorsByCategory;
  $: currentConnectorId = $connectorStore.activeConnectorId;

  // Handle popover toggle
  function togglePopover() {
    isOpen = !isOpen;
  }

  // Handle connector select
  function handleConnectorSelect(connectorId: string) {
    const connector = $connectorStore.connectors.find(c => c.id === connectorId);
    
    if (!connector.isConnected) {
      // Navigate to settings for unconnected connectors
      dispatch('navigateToSettings', { connectorId });
    } else {
      // Set as active connector
      connectorStore.setActiveConnector(connectorId);
      dispatch('connectorChanged', { connectorId });
    }
    
    isOpen = false;
  }

  // Handle outside click
  function handleClickOutside(event: MouseEvent) {
    if (popoverElement && !popoverElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  // Close on escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  // Get connector display info
  function getConnectorDisplay(connector: any) {
    return {
      icon: connector.icon || '🤖',
      name: connector.name,
      description: connector.description,
      isConnected: connector.isConnected,
      isActive: connector.isActive
    };
  }
</script>

<!-- Connector Button -->
<div class="connector-switcher" class:input-style={position === 'input'} on:click={togglePopover}>
  <span class="connector-icon">
    {activeConnector?.icon || '🧠'}
  </span>
  <span class="connector-name">
    {activeConnector?.name || 'StudyVault AI'}
  </span>
  {#if position === 'input'}
    <span class="connector-arrow" class:open={isOpen}>
      <ChevronUp size={12} />
    </span>
  {/if}
</div>

<!-- Popover -->
{#if isOpen}
  <div bind:this={popoverElement} class="connector-popover" class:input-popover={position === 'input'}>
    <div class="popover-content">
      <!-- AI Chatbots Section -->
      <div class="connector-category">
        <div class="category-title">AI Chatbots</div>
        <div class="connector-list">
          {#each connectorsByCategory.ai as connector}
            {@const display = getConnectorDisplay(connector)}
            <div 
              class="connector-option"
              class:active={connector.id === currentConnectorId}
              on:click={() => handleConnectorSelect(connector.id)}
            >
              <div class="connector-info">
                <div class="connector-main">
                  <span class="connector-icon">{display.icon}</span>
                  <div class="connector-details">
                    <div class="connector-name">{display.name}</div>
                    <div class="connector-description">{display.description}</div>
                  </div>
                </div>
                <div class="connector-status">
                  {#if connector.isActive}
                    <div class="status-badge active">
                      <Check size={12} />
                      Active
                    </div>
                  {:else if connector.isConnected}
                    <div class="status-badge connected">
                      Connected
                    </div>
                  {:else}
                    <div class="status-badge disconnected">
                      <ExternalLink size={12} />
                      Connect
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Study Tools Section -->
      <div class="connector-category">
        <div class="category-title">Study Tools</div>
        <div class="connector-list">
          {#each connectorsByCategory.study as connector}
            {@const display = getConnectorDisplay(connector)}
            <div 
              class="connector-option"
              class:active={connector.id === currentConnectorId}
              on:click={() => handleConnectorSelect(connector.id)}
            >
              <div class="connector-info">
                <div class="connector-main">
                  <span class="connector-icon">{display.icon}</span>
                  <div class="connector-details">
                    <div class="connector-name">{display.name}</div>
                    <div class="connector-description">{display.description}</div>
                  </div>
                </div>
                <div class="connector-status">
                  {#if connector.isActive}
                    <div class="status-badge active">
                      <Check size={12} />
                      Active
                    </div>
                  {:else if connector.isConnected}
                    <div class="status-badge connected">
                      Connected
                    </div>
                  {:else}
                    <div class="status-badge disconnected">
                      <ExternalLink size={12} />
                      Connect
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Note Apps Section -->
      <div class="connector-category">
        <div class="category-title">Note Apps</div>
        <div class="connector-list">
          {#each connectorsByCategory.note as connector}
            {@const display = getConnectorDisplay(connector)}
            <div 
              class="connector-option"
              class:active={connector.id === currentConnectorId}
              on:click={() => handleConnectorSelect(connector.id)}
            >
              <div class="connector-info">
                <div class="connector-main">
                  <span class="connector-icon">{display.icon}</span>
                  <div class="connector-details">
                    <div class="connector-name">{display.name}</div>
                    <div class="connector-description">{display.description}</div>
                  </div>
                </div>
                <div class="connector-status">
                  {#if connector.isActive}
                    <div class="status-badge active">
                      <Check size={12} />
                      Active
                    </div>
                  {:else if connector.isConnected}
                    <div class="status-badge connected">
                      Connected
                    </div>
                  {:else}
                    <div class="status-badge disconnected">
                      <ExternalLink size={12} />
                      Connect
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Documents Section -->
      <div class="connector-category">
        <div class="category-title">Documents</div>
        <div class="connector-list">
          {#each connectorsByCategory.doc as connector}
            {@const display = getConnectorDisplay(connector)}
            <div 
              class="connector-option"
              class:active={connector.id === currentConnectorId}
              on:click={() => handleConnectorSelect(connector.id)}
            >
              <div class="connector-info">
                <div class="connector-main">
                  <span class="connector-icon">{display.icon}</span>
                  <div class="connector-details">
                    <div class="connector-name">{display.name}</div>
                    <div class="connector-description">{display.description}</div>
                  </div>
                </div>
                <div class="connector-status">
                  {#if connector.isActive}
                    <div class="status-badge active">
                      <Check size={12} />
                      Active
                    </div>
                  {:else if connector.isConnected}
                    <div class="status-badge connected">
                      Connected
                    </div>
                  {:else}
                    <div class="status-badge disconnected">
                      <ExternalLink size={12} />
                      Connect
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .connector-switcher {
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
    position: relative;
  }

  .connector-switcher.input-style {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    padding: 6px 10px;
    font-size: 12px;
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
    margin-left: auto;
    transition: transform 150ms ease;
    color: var(--text-muted);
  }

  .connector-arrow.open {
    transform: rotate(180deg);
  }

  .connector-popover {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
    z-index: 1000;
    min-width: 320px;
    max-width: 400px;
    max-height: 500px;
    overflow-y: auto;
  }

  .connector-popover.input-popover {
    left: 50%;
    transform: translateX(-50%);
    margin-top: 4px;
  }

  .popover-content {
    padding: 8px;
  }

  .connector-category {
    margin-bottom: 16px;
  }

  .connector-category:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 8px 12px;
    margin-bottom: 4px;
  }

  .connector-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .connector-option {
    padding: 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background 150ms ease;
    border: 1px solid transparent;
  }

  .connector-option:hover {
    background: var(--bg-elevated);
  }

  .connector-option.active {
    background: var(--accent-muted);
    border-color: var(--accent);
  }

  .connector-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .connector-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .connector-details {
    flex: 1;
    min-width: 0;
  }

  .connector-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .connector-description {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .connector-status {
    flex-shrink: 0;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--radius-pill);
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .status-badge.active {
    background: var(--accent);
    color: var(--bg-primary);
  }

  .status-badge.connected {
    background: var(--success);
    color: white;
  }

  .status-badge.disconnected {
    background: var(--bg-elevated);
    color: var(--text-muted);
    border: 1px solid var(--border-default);
  }

  @media (max-width: 640px) {
    .connector-popover {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      width: 90vw;
      max-width: 320px;
      max-height: 70vh;
    }

    .connector-popover.input-popover {
      transform: translate(-50%, -50%);
    }
  }
</style>
