<script lang="ts">
  import { Shield, TrendingUp, AlertCircle, Info } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let score: number = 78; // 0-100
  export let trend: number = 5; // +5%
  
  let mounted = false;
  onMount(() => {
    setTimeout(() => mounted = true, 300);
  });

  $: status = score > 80 ? 'High' : score > 60 ? 'Moderate' : 'Low';
  $: color = score > 80 ? '#C8FF00' : score > 60 ? '#fb923c' : '#ef4444';
  $: dashArray = 2 * Math.PI * 45;
  $: dashOffset = dashArray - (dashArray * (mounted ? score : 0)) / 100;
</script>

<div class="resilience-card">
  <div class="card-header">
    <div class="title-wrap">
        <div class="icon-box" style="background: {color}15; color: {color}">
            <Shield size={18} />
        </div>
        <div>
            <h3 class="title">Resilience Score</h3>
            <p class="subtitle">Academic Burnout Protection</p>
        </div>
    </div>
    <button class="info-btn"><Info size={14} /></button>
  </div>

  <div class="card-body">
    <div class="score-viz">
        <svg viewBox="0 0 100 100" class="progress-ring">
            <circle class="ring-bg" cx="50" cy="50" r="45" />
            <circle 
                class="ring-fill" 
                cx="50" cy="50" r="45" 
                style="stroke: {color}; stroke-dasharray: {dashArray}; stroke-dashoffset: {dashOffset}"
            />
        </svg>
        <div class="score-content">
            <span class="score-num">{score}</span>
            <span class="score-label">{status}</span>
        </div>
    </div>

    <div class="stats-col">
        <div class="trend-item">
            <TrendingUp size={14} class="trend-icon" />
            <span class="trend-val">+{trend}%</span>
            <span class="trend-label">vs last week</span>
        </div>
        <div class="insight-box">
            <AlertCircle size={14} style="color: {color}" />
            <p class="insight-text">
                {#if status === 'High'}
                    Excellent balance. Your consistency is shielding you from fatigue.
                {:else if status === 'Moderate'}
                    Moderate risk. Consider adding a recovery day to your schedule.
                {:else}
                    High burnout risk! Immediate deep rest recommended.
                {/if}
            </p>
        </div>
    </div>
  </div>

  <div class="card-footer">
    <div class="metric">
        <span class="m-val">92%</span>
        <span class="m-label">Consistency</span>
    </div>
    <div class="metric-divider"></div>
    <div class="metric">
        <span class="m-val">4.2h</span>
        <span class="m-label">Avg Session</span>
    </div>
  </div>
</div>

<style>
  .resilience-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
    transition: all 0.3s ease;
  }

  .resilience-card:hover {
    border-color: var(--border-focus);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title-wrap {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .subtitle {
    font-size: 11px;
    color: var(--text-muted);
    margin: 2px 0 0;
  }

  .info-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .info-btn:hover { color: var(--text-primary); }

  .card-body {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .score-viz {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-bg {
    fill: none;
    stroke: rgba(255,255,255,0.05);
    stroke-width: 8;
  }

  .ring-fill {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .score-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-num {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .score-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .stats-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .trend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .trend-icon {
    color: #4ade80;
  }

  .trend-val {
    font-size: 13px;
    font-weight: 600;
    color: #4ade80;
  }

  .trend-label {
    font-size: 11px;
    color: var(--text-muted);
  }

  .insight-box {
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    gap: 8px;
  }

  .insight-text {
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-primary);
    margin: 0;
  }

  .card-footer {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.02);
    border-radius: 12px;
    padding: 12px;
    margin-top: auto;
  }

  .metric {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .m-val {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .m-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .metric-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
  }

  @media (max-width: 400px) {
    .card-body { flex-direction: column; }
    .stats-col { align-items: center; text-align: center; }
  }
</style>
