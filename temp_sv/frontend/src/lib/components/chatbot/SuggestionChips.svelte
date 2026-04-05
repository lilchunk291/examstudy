<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileText, Calendar, Brain, Heart } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  const suggestions = [
    {
      id: 'syllabus',
      icon: FileText,
      title: '📄 Scan my syllabus',
      description: 'Point your camera at your syllabus',
      message: 'I want to scan my syllabus to create a study schedule'
    },
    {
      id: 'schedule',
      icon: Calendar,
      title: '📅 Build study schedule',
      description: 'Tell me your exam date and topics',
      message: 'Help me build a study schedule for my upcoming exams'
    },
    {
      id: 'understand',
      icon: Brain,
      title: '🧠 Help me understand a topic',
      description: 'Explain anything from your syllabus',
      message: 'Can you help me understand some difficult topics from my course?'
    },
    {
      id: 'overwhelmed',
      icon: Heart,
      title: '😔 I am feeling overwhelmed',
      description: 'Let us figure out a plan together',
      message: 'I\'m feeling overwhelmed with my studies. Can you help me create a manageable plan?'
    }
  ];

  function handleSuggestionClick(suggestion: any) {
    dispatch('send', { detail: suggestion.message });
  }
</script>

<div class="suggestion-chips fade-in">
  <!-- Greeting -->
  <div class="greeting-section">
    <h1 class="greeting">Good morning, Student</h1>
    <p class="subtitle">How can I help you study today?</p>
  </div>

  <!-- Suggestion Grid -->
  <div class="chips-grid">
    {#each suggestions as suggestion (suggestion.id)}
      <div 
        class="chip-card slide-up"
        style="animation-delay: {suggestions.indexOf(suggestion) * 100}ms"
        on:click={() => handleSuggestionClick(suggestion)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
      >
        <div class="chip-icon-wrapper">
          <suggestion.component size={24} class="chip-icon" />
        </div>
        <div class="chip-content">
          <div class="chip-title">{suggestion.title}</div>
          <div class="chip-description">{suggestion.description}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .suggestion-chips {
    max-width: var(--message-max-width);
    margin: 0 auto;
    padding: 0 20px;
    margin-bottom: 32px;
  }

  .greeting-section {
    text-align: center;
    margin-bottom: 48px;
  }

  .greeting {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .chips-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .chip-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 24px;
    cursor: pointer;
    transition: all 200ms ease;
    position: relative;
    overflow: hidden;
  }

  .chip-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.05) 0%, 
      transparent 50%);
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .chip-card:hover {
    background: var(--bg-elevated);
    border-color: var(--border-default);
    transform: translateY(-4px);
    box-shadow: var(--shadow-elevated);
  }

  .chip-card:hover::before {
    opacity: 1;
  }

  .chip-icon-wrapper {
    width: 48px;
    height: 48px;
    background: var(--accent-muted);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .chip-icon {
    color: var(--accent);
  }

  .chip-content {
    position: relative;
    z-index: 1;
  }

  .chip-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .chip-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  /* Animation delays for staggered appearance */
  .chip-card:nth-child(1) { animation-delay: 0ms; }
  .chip-card:nth-child(2) { animation-delay: 100ms; }
  .chip-card:nth-child(3) { animation-delay: 200ms; }
  .chip-card:nth-child(4) { animation-delay: 300ms; }

  @media (max-width: 640px) {
    .greeting {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }

    .chips-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .chip-card {
      padding: 20px;
    }

    .chip-icon-wrapper {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }

    .chip-icon {
      width: 20px;
      height: 20px;
    }

    .chip-title {
      font-size: 15px;
    }

    .chip-description {
      font-size: 13px;
    }
  }
</style>
