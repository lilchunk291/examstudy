// Enhanced chat component section for +more button
// Place this in frontend/src/lib/components/chatbot/MoreOptionsMenu.svelte

<script lang="ts">
  import { FileText, Camera, Zap, Smartphone, BookOpen, RotateCcw, MessageSquare } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    description: string;
    action: () => void;
  }

  let isVisible = false;

  const menuItems: MenuItem[] = [
    {
      id: 'upload',
      label: 'Upload Document',
      icon: FileText,
      description: 'Upload study materials',
      action: () => {
        dispatch('action', 'upload');
        toggleMenu();
      },
    },
    {
      id: 'camera',
      label: 'Scan with Camera',
      icon: Camera,
      description: 'Capture notes with camera',
      action: () => {
        dispatch('action', 'camera');
        toggleMenu();
      },
    },
    {
      id: 'connector',
      label: 'Add AI Connector',
      icon: Zap,
      description: 'Connect more AI models',
      action: () => {
        dispatch('action', 'connector');
        toggleMenu();
      },
    },
    {
      id: 'mobile',
      label: 'Sync Mobile App',
      icon: Smartphone,
      description: 'Synchronize across devices',
      action: () => {
        dispatch('action', 'mobile');
        toggleMenu();
      },
    },
    {
      id: 'quick-study',
      label: 'Quick Study Plan',
      icon: BookOpen,
      description: 'Generate study schedule',
      action: () => {
        dispatch('action', 'quick-study');
        toggleMenu();
      },
    },
    {
      id: 'restart',
      label: 'Restart Chat',
      icon: RotateCcw,
      description: 'Clear conversation',
      action: () => {
        dispatch('action', 'restart');
        toggleMenu();
      },
    },
  ];

  function toggleMenu() {
    isVisible = !isVisible;
  }

  function handleOutsideClick(e: MouseEvent) {
    if (isVisible && !(e.target as HTMLElement).closest('.menu-container')) {
      isVisible = false;
    }
  }
</script>

<svelte:window on:click={handleOutsideClick} />

<div class="menu-container">
  <button
    class="menu-trigger"
    on:click|stopPropagation={toggleMenu}
    title="More options"
    class:active={isVisible}
  >
    <span class="plus-icon">+</span>
  </button>

  {#if isVisible}
    <div class="menu-dropdown" on:click|stopPropagation>
      <div class="menu-header">
        <h3>More Options</h3>
      </div>

      <div class="menu-items">
        {#each menuItems as item}
          <button
            class="menu-item"
            on:click={item.action}
            title={item.description}
          >
            <div class="item-icon">
              <svelte:component this={item.icon} size={16} />
            </div>
            <div class="item-content">
              <div class="item-label">{item.label}</div>
              <div class="item-desc">{item.description}</div>
            </div>
          </button>
        {/each}
      </div>

      <div class="menu-footer">
        <small>Pro tip: Use keyboard shortcuts for faster access</small>
      </div>
    </div>
  {/if}
</div>

<style>
  .menu-container {
    position: relative;
  }

  .menu-trigger {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 200ms ease;
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    padding: 0;
  }

  .menu-trigger:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.7);
  }

  .menu-trigger.active {
    background: rgba(163, 230, 53, 0.1);
    border-color: rgba(163, 230, 53, 0.2);
    color: #a3e635;
  }

  .plus-icon {
    display: block;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-dropdown {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 0;
    background: #1a1a1c;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    width: 240px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    z-index: 1000;
    animation: slideUp 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .menu-header h3 {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.4);
  }

  .menu-items {
    padding: 8px;
    max-height: 400px;
    overflow-y: auto;
  }

  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 8px;
    transition: all 150ms ease;
    text-align: left;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .item-icon {
    flex-shrink: 0;
    color: #a3e635;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-label {
    font-size: 13px;
    font-weight: 600;
    color: white;
    margin-bottom: 2px;
  }

  .item-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.3);
  }

  .menu-footer {
    padding: 8px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 10px;
    color: rgba(255, 255, 255, 0.2);
    text-align: center;
  }

  /* Scrollbar styling */
  .menu-items::-webkit-scrollbar {
    width: 6px;
  }

  .menu-items::-webkit-scrollbar-track {
    background: transparent;
  }

  .menu-items::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .menu-items::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
