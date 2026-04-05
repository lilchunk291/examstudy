<script lang="ts">
  import { onMount } from 'svelte';
  
  interface SessionRecord {
    date: string;
    startTime: string;
    duration: number;
    topic: string;
    completed: boolean;
  }
  
  let sessions: SessionRecord[] = [];
  let peakSlot = '9am';
  let heatmapData: number[][] = [];
  
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TIME_SLOTS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  
  onMount(() => {
    loadSessionHistory();
    generateHeatmapData();
  });
  
  function loadSessionHistory() {
    const stored = localStorage.getItem('session_history');
    if (stored) {
      sessions = JSON.parse(stored);
    } else {
      // Demo data
      sessions = generateDemoData();
    }
  }
  
  function generateDemoData(): SessionRecord[] {
    const demo: SessionRecord[] = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      
      // Random sessions
      for (let j = 0; j < Math.random() * 3; j++) {
        const hour = 6 + Math.floor(Math.random() * 15);
        const duration = 20 + Math.floor(Math.random() * 80);
        
        demo.push({
          date: date.toDateString(),
          startTime: `${hour}:00`,
          duration,
          topic: `Topic ${j + 1}`,
          completed: Math.random() > 0.2
        });
      }
    }
    
    return demo;
  }
  
  function generateHeatmapData() {
    heatmapData = Array(6).fill(null).map(() => Array(7).fill(0));
    
    sessions.forEach(session => {
      if (!session.completed) return;
      
      const dayIndex = new Date(session.date).getDay();
      const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Mon=0, Sun=6
      
      const hour = parseInt(session.startTime.split(':')[0]);
      let slotIndex = -1;
      
      if (hour >= 6 && hour < 9) slotIndex = 0;
      else if (hour >= 9 && hour < 12) slotIndex = 1;
      else if (hour >= 12 && hour < 15) slotIndex = 2;
      else if (hour >= 15 && hour < 18) slotIndex = 3;
      else if (hour >= 18 && hour < 21) slotIndex = 4;
      else if (hour >= 21 || hour < 2) slotIndex = 5;
      
      if (slotIndex >= 0 && adjustedDayIndex >= 0) {
        heatmapData[slotIndex][adjustedDayIndex] += session.duration;
      }
    });
    
    // Find peak slot
    let maxTotal = 0;
    TIME_SLOTS.forEach((slot, i) => {
      const total = heatmapData[i].reduce((a, b) => a + b, 0);
      if (total > maxTotal) {
        maxTotal = total;
        peakSlot = slot;
      }
    });
  }
  
  function getCellColor(duration: number): string {
    if (duration === 0) return 'rgba(255,255,255,0.03)';
    if (duration < 30) return 'rgba(200,255,0,0.2)';
    if (duration <= 60) return 'rgba(200,255,0,0.5)';
    return 'rgba(200,255,0,0.9)';
  }
  
  function getTooltipText(dayIndex: number, slotIndex: number): string {
    const duration = heatmapData[slotIndex][dayIndex];
    if (duration === 0) return `${DAYS[dayIndex]} ${TIME_SLOTS[slotIndex]}: No session`;
    
    const daySessions = sessions.filter(s => {
      const sDay = new Date(s.date).getDay();
      const adjustedDay = sDay === 0 ? 6 : sDay - 1;
      return adjustedDay === dayIndex && s.completed;
    });
    
    const slotSessions = daySessions.filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      return ((slotIndex === 0 && hour >= 6 && hour < 9) ||
              (slotIndex === 1 && hour >= 9 && hour < 12) ||
              (slotIndex === 2 && hour >= 12 && hour < 15) ||
              (slotIndex === 3 && hour >= 15 && hour < 18) ||
              (slotIndex === 4 && hour >= 18 && hour < 21) ||
              (slotIndex === 5 && (hour >= 21 || hour < 2)));
    });
    
    const topics = slotSessions.map(s => s.topic).join(', ');
    return `${DAYS[dayIndex]} ${TIME_SLOTS[slotIndex]}: ${duration}min - ${topics}`;
  }
</script>

<div class="heatmap-container">
  <div class="heatmap-header">
    <span class="heatmap-title">Study Pattern</span>
    <span class="peak-badge">Peak: {peakSlot} sessions</span>
  </div>
  
  <div class="heatmap-grid">
    <!-- Time labels -->
    <div class="time-labels">
      {#each TIME_SLOTS as time}
        <div class="time-label">{time}</div>
      {/each}
    </div>
    
    <!-- Heatmap cells -->
    <div class="heatmap-cells">
      {#each heatmapData as row, rowIndex}
        <div class="heatmap-row">
          {#each row as cell, colIndex}
            <div 
              class="heatmap-cell"
              style="background: {getCellColor(cell)}"
              title="{getTooltipText(colIndex, rowIndex)}"
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Day labels -->
  <div class="day-labels">
    {#each DAYS as day}
      <div class="day-label">{day}</div>
    {/each}
  </div>
  
  <!-- Legend -->
  <div class="heatmap-legend">
    <span>Less</span>
    <div class="legend-gradient"></div>
    <span>More</span>
  </div>
</div>

<style>
  .heatmap-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 16px;
  }
  
  .heatmap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .heatmap-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .peak-badge {
    font-size: 10px;
    color: var(--accent);
    background: rgba(200, 255, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .heatmap-grid {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .time-labels {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .time-label {
    font-size: 9px;
    color: var(--text-muted);
    height: 12px;
    display: flex;
    align-items: center;
  }
  
  .heatmap-cells {
    flex: 1;
  }
  
  .heatmap-row {
    display: flex;
    gap: 4px;
    height: 12px;
  }
  
  .heatmap-cell {
    flex: 1;
    border-radius: 2px;
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  
  .heatmap-cell:hover {
    transform: scale(1.2);
  }
  
  .day-labels {
    display: flex;
    gap: 4px;
    margin-left: 32px;
  }
  
  .day-label {
    font-size: 9px;
    color: var(--text-muted);
    flex: 1;
    text-align: center;
  }
  
  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 9px;
    color: var(--text-muted);
  }
  
  .legend-gradient {
    width: 60px;
    height: 8px;
    background: linear-gradient(to right, 
      rgba(255,255,255,0.03),
      rgba(200,255,0,0.2),
      rgba(200,255,0,0.5),
      rgba(200,255,0,0.9)
    );
    border-radius: 2px;
  }
</style>
