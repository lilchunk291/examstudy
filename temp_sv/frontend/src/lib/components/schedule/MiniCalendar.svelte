<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let selectedDate = new Date();
  
  let currentMonth = selectedDate.getMonth();
  let currentYear = selectedDate.getFullYear();

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  $: monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  $: days = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
  $: firstDay = firstDayOfMonth(currentMonth, currentYear);
  $: paddedDays = Array.from({ length: (firstDay + 6) % 7 }, () => null); // Align Monday start

  function prevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }

  function selectDate(day: number) {
    selectedDate = new Date(currentYear, currentMonth, day);
  }

  function isSelected(day: number) {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth && 
           selectedDate.getFullYear() === currentYear;
  }

  function isToday(day: number) {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  }

  const weekHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
</script>

<div class="calendar-card">
  <div class="calendar-header">
    <span class="month-year">{monthName} {currentYear}</span>
    <div class="nav-btns">
      <button on:click={prevMonth}><ChevronLeft size={16} /></button>
      <button on:click={nextMonth}><ChevronRight size={16} /></button>
    </div>
  </div>

  <div class="calendar-grid">
    {#each weekHeaders as head}
      <span class="grid-head">{head}</span>
    {/each}
    {#each paddedDays as _}
      <div class="day empty"></div>
    {/each}
    {#each days as day}
      <button 
        class="day" 
        class:selected={isSelected(day)}
        class:today={isToday(day)}
        on:click={() => selectDate(day)}
      >
        {day}
      </button>
    {/each}
  </div>
</div>

<style>
  .calendar-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 16px;
    width: 100%;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .month-year {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .nav-btns {
    display: flex;
    gap: 4px;
  }

  .nav-btns button {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btns button:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .grid-head {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-align: center;
    padding-bottom: 8px;
  }

  .day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-primary);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .day:hover:not(.empty) {
    background: var(--surface-hover);
  }

  .day.selected {
    background: var(--accent);
    color: var(--bg);
    font-weight: 700;
    box-shadow: 0 0 12px var(--accent-glow);
  }

  .day.today:not(.selected) {
    border: 1px solid var(--accent);
    color: var(--accent);
  }

  .day.empty {
    cursor: default;
  }
</style>
