<script lang="ts">
  import { Github, Mail, Layout, Plus, Check, Loader2 } from 'lucide-svelte';

  let syncing = false;
  let syncStatus: Record<string, 'connected' | 'not-connected' | 'syncing'> = {
    google: 'not-connected',
    outlook: 'not-connected',
    canvas: 'connected'
  };

  async function syncService(id: string) {
    if (syncing) return;
    syncing = true;
    syncStatus[id] = 'syncing';
    // Mocking sync
    await new Promise(r => setTimeout(r, 2000));
    syncStatus[id] = 'connected';
    syncing = false;
  }

  const services = [
    { id: 'google',  name: 'Google Calendar', icon: Mail,    color: '#ea4335' },
    { id: 'outlook', name: 'Outlook Calendar', icon: Mail,    color: '#0078d4' },
    { id: 'canvas',  name: 'Canvas LMS',       icon: Layout,  color: '#e00122' }
  ];
</script>

<div class="sync-card">
  <div class="sync-header">
    <h3 class="title">External Sync</h3>
    <button class="add-sync" title="Add New Integration"><Plus size={14} /></button>
  </div>

  <div class="services-list">
    {#each services as serv}
      <button 
        class="service-item" 
        on:click={() => syncService(serv.id)}
        disabled={syncing}
      >
        <div class="service-left">
            <div class="icon-wrap" style="color: {serv.color}; background: {serv.color}15">
                <svelte:component this={serv.icon} size={14} />
            </div>
            <span class="service-name">{serv.name}</span>
        </div>
        
        <div class="service-right">
            {#if syncStatus[serv.id] === 'connected'}
                <div class="status connected">
                    <Check size={10} />
                    Connected
                </div>
            {:else if syncStatus[serv.id] === 'syncing'}
                <div class="status syncing">
                    <Loader2 size={10} class="spinner" />
                    Syncing
                </div>
            {:else}
                <div class="status disconnected">Connect</div>
            {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .sync-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sync-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .add-sync {
    background: var(--surface-hover);
    border: none;
    color: var(--text-muted);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-sync:hover {
    color: var(--accent);
    background: var(--accent-glow);
  }

  .services-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .service-item:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.15);
    background: var(--surface-hover);
  }

  .service-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .service-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .status {
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .status.connected {
    background: rgba(var(--color-easy), 0.1);
    color: var(--color-easy);
  }

  .status.disconnected {
    background: rgba(255,255,255,0.04);
    color: var(--text-muted);
  }

  .status.syncing {
    background: var(--accent-glow);
    color: var(--accent);
  }

  :global(.spinner) {
    animation: rotate 1.5s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
