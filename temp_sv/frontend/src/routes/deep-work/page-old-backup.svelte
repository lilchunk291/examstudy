<script lang="ts">
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { getDeepWorkSessions, addDeepWorkSession, addToSyncQueue, updateDeepWorkSession, type DeepWorkSession } from '$lib/db/indexeddb';
  import { encryptForSync, processSyncQueue } from '$lib/utils/sync';
  
  let sessions: DeepWorkSession[] = [];
  let loading = true;
  let showNewSession = false;
  let activeSession: DeepWorkSession | null = null;
  let sessionTimer = 0;
  let timerInterval: number | null = null;
  let targetDuration = 45;
  let intensityLevel = 5;
  let comprehensionScore = 5;
  let cognitiveFatigue = 3;
  
  let newSession: { topic: string; duration_minutes: number; intensity_level: number } = {
    topic: '',
    duration_minutes: 45,
    intensity_level: 5
  };
  
  onMount(async () => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    await loadSessions();
  });
  
  async function loadSessions() {
    loading = true;
    try {
      sessions = await getDeepWorkSessions();
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
    loading = false;
  }
  
  async function startSession() {
    if (!newSession.topic) return;
    if (activeSession) return;
    
    if (newSession.duration_minutes < 45) {
      alert('Deep work sessions must be at least 45 minutes');
      return;
    }
    
    const clientId = crypto.randomUUID();
    const session: Omit<DeepWorkSession, 'id' | 'synced'> = {
      client_id: clientId,
      topic: newSession.topic,
      duration_minutes: newSession.duration_minutes,
      intensity_level: newSession.intensity_level,
      started_at: new Date().toISOString()
    };
    
    const id = await addDeepWorkSession(session);
    activeSession = { ...session, id, synced: false };
    targetDuration = newSession.duration_minutes;
    intensityLevel = newSession.intensity_level;

    const encrypted_blob = await encryptForSync(activeSession, 'deep_work_session');
    await addToSyncQueue({
      data_type: 'blob',
      data_id: String(activeSession.id ?? ''),
      client_id: clientId,
      encrypted_blob,
      operation: 'create',
      created_at: new Date().toISOString(),
      retry_count: 0
    });

    await processSyncQueue();
    
    sessionTimer = 0;
    timerInterval = setInterval(() => {
      sessionTimer++;
    }, 1000) as unknown as number;
    
    showNewSession = false;
  }
  
  async function completeSession() {
    if (!activeSession || !timerInterval) return;
    
    clearInterval(timerInterval);
    timerInterval = null;
    
    activeSession.completed_at = new Date().toISOString();
    activeSession.comprehension_score = comprehensionScore;
    activeSession.cognitive_fatigue = cognitiveFatigue;

    await updateDeepWorkSession(activeSession);

    const encrypted_blob = await encryptForSync(activeSession, 'deep_work_session');
    await addToSyncQueue({
      data_type: 'blob',
      data_id: String(activeSession.id ?? ''),
      client_id: activeSession.client_id,
      encrypted_blob,
      operation: 'update',
      created_at: new Date().toISOString(),
      retry_count: 0
    });

    await processSyncQueue();
    
    sessions = [activeSession, ...sessions];
    activeSession = null;
    sessionTimer = 0;
    comprehensionScore = 5;
    cognitiveFatigue = 3;
  }
  
  function cancelSession() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    activeSession = null;
    sessionTimer = 0;
  }
  
  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  function getProgress(): number {
    return Math.min(100, (sessionTimer / (targetDuration * 60)) * 100);
  }
  
  function getIntensityLabel(level: number): string {
    if (level <= 2) return 'Light';
    if (level <= 4) return 'Moderate';
    if (level <= 6) return 'Intense';
    return 'Maximum';
  }
</script>

{#if $isAuthenticated}
<div class="min-h-screen bg-bg-primary" in:fade>
  <header class="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <a href="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <span class="text-white font-bold text-sm">S</span>
          </div>
          <span class="text-xl font-bold text-gradient">Study Vault</span>
        </a>
      </div>
      
      <nav class="flex items-center gap-6">
        <a href="/dashboard" class="text-text-secondary hover:text-text-primary transition-colors">Dashboard</a>
        <a href="/study" class="text-text-secondary hover:text-text-primary transition-colors">Study</a>
        <a href="/deep-work" class="text-accent-primary font-medium">Deep Work</a>
        <a href="/university" class="text-text-secondary hover:text-text-primary transition-colors">University</a>
        <a href="/settings" class="text-text-secondary hover:text-text-primary transition-colors">Settings</a>
      </nav>
    </div>
  </header>

  <main class="pt-24 pb-12 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-1">Deep Work Sessions</h1>
          <p class="text-text-secondary">Focused work blocks for maximum productivity</p>
        </div>
        {#if !activeSession}
          <button 
            on:click={() => showNewSession = true}
            class="btn btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Start Deep Work
          </button>
        {/if}
      </div>

      {#if activeSession}
        <div class="card-elevated mb-8" transition:slide>
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-accent-secondary/20 rounded-full text-accent-secondary text-sm mb-4">
              <span class="w-2 h-2 bg-accent-secondary rounded-full animate-pulse"></span>
              Deep Work in Progress
            </div>
            
            <h2 class="text-2xl font-bold mb-2">{activeSession.topic}</h2>
            <p class="text-text-secondary">{getIntensityLabel(intensityLevel)} intensity</p>
            
            <div class="relative w-64 h-64 mx-auto mt-8">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="currentColor" stroke-width="8" fill="none" class="text-bg-tertiary"/>
                <circle 
                  cx="128" cy="128" r="120" 
                  stroke="currentColor" 
                  stroke-width="8" 
                  fill="none"
                  stroke-dasharray={2 * Math.PI * 120}
                  stroke-dashoffset={2 * Math.PI * 120 * (1 - getProgress() / 100)}
                  class="text-accent-secondary transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-5xl font-bold text-gradient">
                  {formatTime(sessionTimer)}
                </span>
                <span class="text-text-secondary text-sm mt-2">
                  / {targetDuration} min
                </span>
              </div>
            </div>
            
            {#if sessionTimer >= targetDuration * 60}
              <div class="mt-6 p-4 bg-accent-success/20 rounded-lg max-w-md mx-auto">
                <p class="text-accent-success font-medium mb-4">Session target reached! Rate your experience:</p>
                
                <div class="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label class="block text-sm text-text-secondary mb-2">Comprehension Score</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      bind:value={comprehensionScore}
                      class="w-full"
                    />
                    <p class="text-center mt-1">{comprehensionScore}/10</p>
                  </div>
                  <div>
                    <label class="block text-sm text-text-secondary mb-2">Cognitive Fatigue</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      bind:value={cognitiveFatigue}
                      class="w-full"
                    />
                    <p class="text-center mt-1">{cognitiveFatigue}/10</p>
                  </div>
                </div>
                
                <button on:click={completeSession} class="btn btn-primary w-full">
                  Complete Session
                </button>
              </div>
            {/if}
          </div>
          
          {#if sessionTimer < targetDuration * 60}
            <div class="flex justify-center">
              <button on:click={cancelSession} class="btn btn-secondary">
                End Session Early
              </button>
            </div>
          {/if}
        </div>
      {:else if showNewSession}
        <div class="card mb-8" transition:slide>
          <h2 class="text-lg font-semibold mb-4">Start Deep Work Session</h2>
          <p class="text-text-secondary text-sm mb-6">
            Deep work requires at least 45 minutes of uninterrupted focus. Choose your duration wisely.
          </p>
          
          <div class="space-y-4">
            <div>
              <label for="topic" class="block text-sm font-medium mb-2">What are you working on?</label>
              <input
                type="text"
                id="topic"
                bind:value={newSession.topic}
                class="input"
                placeholder="e.g., Writing research paper, Coding project"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="duration" class="block text-sm font-medium mb-2">Duration (minutes)</label>
                <select
                  id="duration"
                  bind:value={newSession.duration_minutes}
                  class="input"
                >
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                  <option value={120}>120 min</option>
                  <option value={180}>180 min</option>
                </select>
              </div>
              
              <div>
                <label for="intensity" class="block text-sm font-medium mb-2">Intensity Level</label>
                <select
                  id="intensity"
                  bind:value={newSession.intensity_level}
                  class="input"
                >
                  <option value={1}>Light - Easy tasks</option>
                  <option value={3}>Moderate - Normal work</option>
                  <option value={5}>Intense - Challenging work</option>
                  <option value={7}>Maximum - Peak focus</option>
                </select>
              </div>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button on:click={() => showNewSession = false} class="btn btn-secondary">
                Cancel
              </button>
              <button on:click={startSession} class="btn btn-primary">
                Start Deep Work
              </button>
            </div>
          </div>
        </div>
      {/if}

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Session History</h2>
        
        {#if loading}
          <div class="space-y-3">
            {#each [1, 2, 3] as _}
              <div class="skeleton h-20 rounded-lg"></div>
            {/each}
          </div>
        {:else if sessions.length === 0}
          <div class="text-center py-8 text-text-secondary">
            <p>No deep work sessions yet</p>
            <button on:click={() => showNewSession = true} class="btn btn-primary mt-4">
              Start your first deep work session
            </button>
          </div>
        {:else}
          <div class="space-y-3">
            {#each sessions as session (session.id)}
              <div class="p-4 bg-bg-tertiary rounded-lg flex items-center justify-between" transition:slide>
                <div>
                  <p class="font-medium">{session.topic}</p>
                  <p class="text-text-secondary text-sm">
                    {session.duration_minutes} min • {getIntensityLabel(session.intensity_level)} intensity
                  </p>
                </div>
                <div class="text-right">
                  {#if session.completed_at}
                    <span class="badge badge-success">Completed</span>
                    <p class="text-text-muted text-xs mt-1">
                      {session.comprehension_score ? `Comprehension: ${session.comprehension_score}/10` : ''}
                    </p>
                  {:else}
                    <span class="badge badge-warning">In Progress</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>
{/if}

<style>
  input[type="range"], select {
    -webkit-appearance: none;
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
  }
  input[type="range"]::-webkit-slider-thumb, select::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-secondary);
    border-radius: 50%;
    cursor: pointer;
  }
</style>
