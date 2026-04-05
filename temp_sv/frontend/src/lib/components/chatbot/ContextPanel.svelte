<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, Eye, EyeOff } from 'lucide-svelte';
  import type { ContextData } from '$lib/stores/connectorStore';

  export let contextData: ContextData = {};
  export let activeConnector: any = null;

  const dispatch = createEventDispatcher();

  // Section visibility states
  let sections = {
    learnerProfile: true,
    currentSubject: true,
    todaysSchedule: true,
    recentPerformance: true
  };

  // Toggle section visibility
  function toggleSection(section: keyof typeof sections) {
    sections[section] = !sections[section];
  }

  // Format context for display
  function formatContext(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  // Get connector display name
  function getConnectorName(): string {
    if (!activeConnector) return 'StudyVault AI';
    return activeConnector.name;
  }

  // Check if context is being used
  $: contextUsed = activeConnector?.id !== 'studyvault';
</script>

<div class="right-panel-content">
  <!-- Panel Header -->
  <div class="panel-header">
    <div class="panel-title">Context</div>
    <button class="header-btn" on:click={() => dispatch('close')}>
      ×
    </button>
  </div>

  <!-- Panel Content -->
  <div class="panel-content">
    {#if contextUsed}
      <!-- Context Being Sent Notice -->
      <div class="context-notice">
        <div class="notice-icon">📤</div>
        <div class="notice-content">
          <div class="notice-title">Context being sent to {getConnectorName()}</div>
          <div class="notice-description">
            Your student data is included with each message to personalize responses
          </div>
        </div>
      </div>
    {:else}
      <!-- Built-in AI Notice -->
      <div class="context-notice">
        <div class="notice-icon">🧠</div>
        <div class="notice-content">
          <div class="notice-title">StudyVault AI</div>
          <div class="notice-description">
            Built-in AI with access to your local data
          </div>
        </div>
      </div>
    {/if}

    <!-- Learner Profile Section -->
    <div class="context-section">
      <div class="context-header" on:click={() => toggleSection('learnerProfile')}>
        <div class="context-title">Learner Profile</div>
        <div class="context-toggle" class:collapsed={!sections.learnerProfile}>
          <ChevronDown size={16} />
        </div>
      </div>
      <div class="context-content" class:collapsed={!sections.learnerProfile}>
        <div class="context-item">
          <span class="context-label">Learning Style:</span>
          <span class="context-value">{contextData.learnerProfile?.learningStyle || 'N/A'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Personality:</span>
          <span class="context-value">{contextData.learnerProfile?.personalityType || 'N/A'}</span>
        </div>
        <div class="context-item">
          <span class="context-label">Exam Proximity:</span>
          <span class="context-value">{contextData.learnerProfile?.examProximity || 'N/A'} days</span>
        </div>
        <div class="context-item">
          <span class="context-label">Weak Areas:</span>
          <span class="context-value">
            {contextData.learnerProfile?.weakAreas?.join(', ') || 'None identified'}
          </span>
        </div>
      </div>
    </div>

    <!-- Current Subject Section -->
    <div class="context-section">
      <div class="context-header" on:click={() => toggleSection('currentSubject')}>
        <div class="context-title">Current Subject</div>
        <div class="context-toggle" class:collapsed={!sections.currentSubject}>
          <ChevronDown size={16} />
        </div>
      </div>
      <div class="context-content" class:collapsed={!sections.currentSubject}>
        <div class="context-item">
          <span class="context-label">Subject:</span>
          <span class="context-value">{contextData.currentSubject?.name || 'N/A'}</span>
        </div>
        <div class="topics-list">
          {#each contextData.currentSubject?.topics || [] as topic}
            <div class="topic-item">
              <div class="topic-name">{topic.name}</div>
              <div class="topic-details">
                <span class="topic-weight">Weight: {topic.weight}/10</span>
                <span class="topic-status">Status: {topic.status}</span>
                <span class="topic-hours">{topic.hoursSpent}h</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Today's Schedule Section -->
    <div class="context-section">
      <div class="context-header" on:click={() => toggleSection('todaysSchedule')}>
        <div class="context-title">Today's Schedule</div>
        <div class="context-toggle" class:collapsed={!sections.todaysSchedule}>
          <ChevronDown size={16} />
        </div>
      </div>
      <div class="context-content" class:collapsed={!sections.todaysSchedule}>
        <div class="schedule-list">
          {#each contextData.todaysSchedule || [] as item}
            <div class="schedule-item">
              <div class="schedule-time">{item.time}</div>
              <div class="schedule-activity">{item.activity}</div>
              <div class="schedule-duration">{item.duration}min</div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Recent Performance Section -->
    <div class="context-section">
      <div class="context-header" on:click={() => toggleSection('recentPerformance')}>
        <div class="context-title">Recent Performance</div>
        <div class="context-toggle" class:collapsed={!sections.recentPerformance}>
          <ChevronDown size={16} />
        </div>
      </div>
      <div class="context-content" class:collapsed={!sections.recentPerformance}>
        <div class="performance-stats">
          <div class="stat-item">
            <span class="stat-label">Sessions this week:</span>
            <span class="stat-value">{contextData.recentPerformance?.sessionsThisWeek || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Retention rate:</span>
            <span class="stat-value">{contextData.recentPerformance?.retentionRate || 0}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Current streak:</span>
            <span class="stat-value">{contextData.recentPerformance?.streak || 0} days</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Context Section (for debugging) -->
    <div class="context-section">
      <div class="context-header" on:click={() => toggleSection('rawContext')}>
        <div class="context-title">Raw Context Data</div>
        <div class="context-toggle" class:collapsed={!sections.rawContext}>
          <ChevronDown size={16} />
        </div>
      </div>
      <div class="context-content raw-context" class:collapsed={!sections.rawContext}>
        <pre class="context-json">{formatContext(contextData)}</pre>
      </div>
    </div>
  </div>
</div>

<style>
  .right-panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-btn {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    transition: all 150ms ease;
  }

  .header-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .context-notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--accent-muted);
    border: 1px solid var(--accent);
    border-radius: var(--radius-md);
    margin-bottom: 24px;
  }

  .notice-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .notice-content {
    flex: 1;
  }

  .notice-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .notice-description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .context-section {
    margin-bottom: 24px;
  }

  .context-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--radius-sm);
    transition: background 150ms ease;
  }

  .context-header:hover {
    background: var(--bg-elevated);
  }

  .context-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .context-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: transform 150ms ease;
  }

  .context-toggle.collapsed {
    transform: rotate(-90deg);
  }

  .context-content {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    transition: all 150ms ease;
  }

  .context-content.collapsed {
    display: none;
  }

  .context-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .context-item:last-child {
    border-bottom: none;
  }

  .context-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .context-value {
    color: var(--text-secondary);
    text-align: right;
    max-width: 60%;
    word-wrap: break-word;
  }

  .topics-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .topic-item {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 12px;
  }

  .topic-name {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .topic-details {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .topic-weight {
    color: var(--accent);
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .schedule-item {
    display: grid;
    grid-template-columns: 60px 1fr 60px;
    gap: 8px;
    align-items: center;
    padding: 8px;
    background: var(--bg-elevated);
    border-radius: var(--radius-sm);
  }

  .schedule-time {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent);
  }

  .schedule-activity {
    font-size: 13px;
    color: var(--text-primary);
  }

  .schedule-duration {
    font-size: 12px;
    color: var(--text-muted);
    text-align: right;
  }

  .performance-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: var(--bg-elevated);
    border-radius: var(--radius-sm);
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .raw-context {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .context-json {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
