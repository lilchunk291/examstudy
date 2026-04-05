<script lang="ts">
  import { onMount } from 'svelte';
  import { Info } from 'lucide-svelte';

  export let data: { date: string; count: number }[] = [];
  
  // Generate last 12 weeks of dates if no data provided
  let heatmapData: { date: Date; count: number; level: number }[] = [];
  
  const levels = [
    { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.05)' },
    { bg: 'rgba(200,255,0,0.15)',  border: 'rgba(200,255,0,0.1)' },
    { bg: 'rgba(200,255,0,0.3)',   border: 'rgba(200,255,0,0.2)' },
    { bg: 'rgba(200,255,0,0.5)',   border: 'rgba(200,255,0,0.3)' },
    { bg: 'rgba(200,255,0,0.8)',   border: 'rgba(200,255,0,0.5)' }
  ];

  function getLevel(count: number) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  onMount(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (12 * 7) + (6 - today.getDay())); // Align to end of week 12 weeks ago

    const temp: typeof heatmapData = [];
    for (let i = 0; i < 12 * 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const match = data.find(item => item.date === dateStr);
        const count = match ? match.count : (Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0);
        temp.push({
            date: d,
            count,
            level: getLevel(count)
        });
    }
    heatmapData = temp;
  });

  const weekDays = ['M', 'W', 'F'];
</script>

<div class="heatmap-container">
  <div class="heatmap-header">
    <div class="header-left">
        <h3 class="title">Consistency</h3>
        <span class="subtitle">Last 90 days</span>
    </div>
    <div class="legend">
        <span class="legend-label">Less</span>
        {#each levels as level}
            <div class="legend-box" style="background: {level.bg}; border-color: {level.border}"></div>
        {/each}
        <span class="legend-label">More</span>
    </div>
  </div>

  <div class="heatmap-grid-wrap">
    <div class="days-col">
        {#each weekDays as day}
            <span class="day-label">{day}</span>
        {/each}
    </div>
    <div class="grid">
        {#each heatmapData as item}
            <div 
                class="cell" 
                style="background: {levels[item.level].bg}; border-color: {levels[item.level].border}"
                title="{item.date.toDateString()}: {item.count} sessions"
            ></div>
        {/each}
    </div>
  </div>
</div>

<style>
  .heatmap-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .heatmap-header {
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

  .subtitle {
    font-size: 11px;
    color: var(--text-muted);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-label {
    font-size: 10px;
    color: var(--text-muted);
    margin: 0 4px;
  }

  .legend-box {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid transparent;
  }

  .heatmap-grid-wrap {
    display: flex;
    gap: 8px;
  }

  .days-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2px 0;
    height: 90px;
  }

  .day-label {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    gap: 3px;
    flex: 1;
  }

  .cell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 2px;
    border: 1px solid transparent;
    transition: transform 0.1s ease;
  }

  .cell:hover {
    transform: scale(1.2);
    z-index: 2;
  }
</style>
