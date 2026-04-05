<script lang="ts">
  import { Activity, Wifi, Battery, Clock } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let currentTime = '';
  let syncStatus: 'syncing' | 'synced' | 'offline' = 'synced';
  let connectionQuality: 'excellent' | 'good' | 'poor' = 'excellent';
  let batteryLevel = 85;
  let isOnline = true;

  onMount(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }, 1000);

    // Simulate sync status changes
    const syncInterval = setInterval(() => {
      if (isOnline) {
        syncStatus = Math.random() > 0.7 ? 'syncing' : 'synced';
      } else {
        syncStatus = 'offline';
      }
    }, 5000);

    // Monitor online/offline
    const handleOnline = () => {
      isOnline = true;
      syncStatus = 'synced';
    };

    const handleOffline = () => {
      isOnline = false;
      syncStatus = 'offline';
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timeInterval);
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  function getSyncIcon() {
    if (syncStatus === 'syncing') return '⟳';
    if (syncStatus === 'synced') return '✓';
    return '!';
  }

  function getSyncColor() {
    if (syncStatus === 'syncing') return '#a3e635';
    if (syncStatus === 'synced') return '#34d399';
    return '#f87171';
  }

  function getSyncLabel() {
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'synced') return 'Synced';
    return 'Offline';
  }

  function getConnectionColor() {
    if (connectionQuality === 'excellent') return '#34d399';
    if (connectionQuality === 'good') return '#f59e0b';
    return '#f87171';
  }

  function getBatteryColor() {
    if (batteryLevel > 50) return '#34d399';
    if (batteryLevel > 20) return '#f59e0b';
    return '#f87171';
  }
</script>

<div class="status-bar">
  <!-- Left Section: Sync Status -->
  <div class="status-section">
    <div class="status-item sync-status" style="--color: {getSyncColor()}">
      <span class="sync-icon">{getSyncIcon()}</span>
      <span class="sync-label">{getSyncLabel()}</span>
    </div>
  </div>

  <!-- Center Section: Time -->
  <div class="status-section center">
    <div class="time-display">
      <Clock size={12} />
      <span>{currentTime || '--:--:--'}</span>
    </div>
  </div>

  <!-- Right Section: System Status -->
  <div class="status-section right">
    <div class="status-item">
      <div class="wifi-icon" style="color: {getConnectionColor()}">
        <Wifi size={12} />
      </div>
      <span class="status-label">{connectionQuality}</span>
    </div>

    <div class="status-item battery-status" style="--battery: {batteryLevel}%; --color: {getBatteryColor()}">
      <Battery size={12} />
      <span class="battery-label">{batteryLevel}%</span>
    </div>

    <div class="status-item session-indicator">
      <div class="activity-dot"></div>
      <span>Active</span>
    </div>
  </div>
</div>

<style>
  .status-bar {
    width: 100%;
    height: 28px;
    background: linear-gradient(
      90deg,
      rgba(163, 230, 53, 0.05) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(56, 189, 248, 0.05) 100%
    );
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    gap: 20px;
    font-family: "Geist", system-ui, sans-serif;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }

  .status-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-section.center {
    flex: 1;
    justify-content: center;
  }

  .status-section.right {
    justify-content: flex-end;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    transition: all 200ms ease;
  }

  .status-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .sync-status {
    --color: #a3e635;
  }

  .sync-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color);
    font-size: 8px;
    font-weight: bold;
  }

  .sync-label {
    color: var(--color);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .time-display {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  .wifi-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-label {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  .battery-status {
    --battery: 85%;
    --color: #34d399;
  }

  .battery-label {
    color: var(--color);
    font-weight: 600;
  }

  .session-indicator {
    position: relative;
  }

  .activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .status-bar {
      height: 24px;
      padding: 0 16px;
      gap: 12px;
      font-size: 9px;
    }

    .status-section {
      gap: 8px;
    }

    .status-item {
      padding: 2px 6px;
    }

    .time-display {
      padding: 2px 8px;
    }
  }
</style>
