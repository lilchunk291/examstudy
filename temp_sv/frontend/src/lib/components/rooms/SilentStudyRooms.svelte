<script lang="ts">
  import { Users, Headphones, Volume2, Timer, Zap, Search, Plus } from 'lucide-svelte';
  import { onMount } from 'svelte';

  const rooms = [
    { id: 1, name: 'Cyber Library', occupants: 15, tag: 'Quiet', sound: 'Lo-Fi Beats' },
    { id: 2, name: 'Deep Space', occupants: 8, tag: 'Intense', sound: 'White Noise' },
    { id: 3, name: 'Forrest Stream', occupants: 12, tag: 'Nature', sound: 'Rain & Birds' },
    { id: 4, name: 'Midnight Study', occupants: 24, tag: 'Silent', sound: 'None' }
  ];

  let activeRoom = null;
  let focusMode = false;
  let volume = 50;

  function joinRoom(room) {
    activeRoom = room;
  }
</script>

<div class="rooms-container">
  {#if !activeRoom}
    <div class="rooms-header">
        <h2 class="title">Silent Study Rooms</h2>
        <div class="header-actions">
            <button class="search-btn"><Search size={16} /></button>
            <button class="create-btn"><Plus size={16} /> Create</button>
        </div>
    </div>

    <div class="rooms-grid">
        {#each rooms as room}
            <button class="room-card" on:click={() => joinRoom(room)}>
                <div class="room-top">
                    <div class="occupants">
                        <Users size={12} />
                        {room.occupants} focusing
                    </div>
                    <span class="tag">{room.tag}</span>
                </div>
                <h3 class="room-name">{room.name}</h3>
                <div class="room-footer">
                    <div class="sound">
                        <Headphones size={12} />
                        {room.sound}
                    </div>
                    <span class="join-text">Join Space</span>
                </div>
            </button>
        {/each}
    </div>
  {:else}
    <div class="active-room">
        <div class="room-top-nav">
            <button on:click={() => activeRoom = null} class="back-btn">Exit Space</button>
            <div class="room-info">
                <h3 class="active-name">{activeRoom.name}</h3>
                <p class="stats">{activeRoom.occupants + 1} students focusing together</p>
            </div>
            <div class="indicators">
                <div class="indicator">
                    <Timer size={14} />
                    <span>25:00</span>
                </div>
                <div class="indicator">
                    <Zap size={14} />
                    <span>8.4k Focus</span>
                </div>
            </div>
        </div>

        <div class="focus-inner">
            <div class="focus-timer">
                <div class="timer-ring">
                    <span class="time">25:00</span>
                    <span class="motto">Total Silence</span>
                </div>
                <button class="focus-btn" on:click={() => focusMode = !focusMode}>
                    {focusMode ? 'End Session' : 'Start Focus'}
                </button>
            </div>

            <div class="occupant-viz">
                {#each Array(9) as _, i}
                    <div class="avatar" title="Student {i+1}" style="--delay: {i*0.1}s">
                        <div class="pulse" class:active={focusMode}></div>
                    </div>
                {/each}
                <div class="more-count">+{activeRoom.occupants - 8} more</div>
            </div>
        </div>

        <div class="audio-controls">
            <div class="audio-left">
                <Volume2 size={16} />
                <input type="range" bind:value={volume} min="0" max="100" class="vol-slider" />
            </div>
            <div class="soundscapes">
                {#each ['Lo-Fi', 'Rain', 'Cafe', 'Silence'] as sound}
                    <button class="sound-btn" class:active={activeRoom.sound.includes(sound)}>{sound}</button>
                {/each}
            </div>
        </div>
    </div>
  {/if}
</div>

<style>
  .rooms-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    height: 100%;
    overflow: hidden;
  }

  .rooms-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .search-btn, .create-btn {
    background: var(--surface-hover);
    border: none;
    color: var(--text-muted);
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
  }

  .create-btn {
    background: var(--accent);
    color: var(--bg);
  }

  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .room-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .room-card:hover {
    border-color: var(--accent);
    background: rgba(200,255,0,0.03);
    transform: translateY(-2px);
  }

  .room-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .occupants {
    font-size: 10px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tag {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-glow);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .room-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
  }

  .room-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sound {
    font-size: 10px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .join-text {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .room-card:hover .join-text { opacity: 1; }

  /* Active Room */
  .active-room {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 24px;
  }

  .room-top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
  }

  .back-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .active-name {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    text-align: center;
  }

  .stats {
    font-size: 11px;
    color: var(--text-muted);
    margin: 2px 0 0;
    text-align: center;
  }

  .indicators {
    display: flex;
    gap: 12px;
  }

  .indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
  }

  .focus-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
  }

  .timer-ring {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 4px solid var(--accent);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px var(--accent-glow);
    margin-bottom: 24px;
  }

  .time {
    font-family: var(--font-mono);
    font-size: 44px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .motto {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .focus-btn {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 12px 32px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px var(--accent-glow);
  }

  .occupant-viz {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--surface-hover);
    position: relative;
    border: 1px solid var(--border);
  }

  .pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0;
    transform: scale(0.8);
  }

  .pulse.active {
    animation: pulse 2s infinite var(--delay);
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  .more-count {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 600;
  }

  .audio-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.02);
    padding: 12px 20px;
    border-radius: 16px;
  }

  .audio-left {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
  }

  .vol-slider {
    width: 80px;
    accent-color: var(--accent);
  }

  .soundscape {
    display: flex;
    gap: 8px;
  }

  .sound-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    cursor: pointer;
  }

  .sound-btn.active {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-glow);
  }
</style>
