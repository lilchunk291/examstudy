<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Sparkles, Plus, Trash2, Check } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  // Processing styles
  const processingStyles = [
    { id: 'linear', label: 'Linear', desc: 'Sequential, step-by-step learning' },
    { id: 'relational', label: 'Relational', desc: 'Connect concepts and ideas' },
    { id: 'systemic', label: 'Systemic', desc: 'Holistic, pattern-based approach' },
  ];

  // Learning types (VAK + Omni)
  const learningTypes = [
    { id: 'visual', label: 'Visual', icon: '👁️' },
    { id: 'auditory', label: 'Auditory', icon: '🎧' },
    { id: 'kinesthetic', label: 'Kinesthetic', icon: '🎮' },
    { id: 'omni', label: 'Omni-Learner', icon: '🧠' },
  ];

  // Exam types
  const examTypes = [
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'essay', label: 'Essay' },
    { id: 'practical', label: 'Practical' },
    { id: 'mixed', label: 'Mixed Format' },
  ];

  // State
  let selectedProcessingStyle: string = 'relational';
  let selectedLearningType: string = 'visual';
  let selectedExamType: string = 'mixed';
  let focusSubjects: string[] = [];
  let dailyHours: number = 4;
  let newSubject: string = '';
  let targetDate: string = '';
  let isGenerating: boolean = false;

  function addSubject() {
    if (newSubject.trim() && !focusSubjects.includes(newSubject.trim())) {
      focusSubjects = [...focusSubjects, newSubject.trim()];
      newSubject = '';
    }
  }

  function removeSubject(subject: string) {
    focusSubjects = focusSubjects.filter(s => s !== subject);
  }

  async function generateSchedule() {
    if (focusSubjects.length === 0) return;
    
    isGenerating = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSchedule = focusSubjects.map((subject, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      time: `${9 + idx * 2}:00 AM`,
      subject,
      type: idx % 2 === 0 ? 'study' : 'deep-work',
      duration: `${90 + idx * 15}m`,
      durationMinutes: 90 + idx * 15,
      status: 'upcoming',
      difficulty: ['easy', 'medium', 'hard'][idx % 3],
      isAIGenerated: true,
      generatedWith: {
        processingStyle: selectedProcessingStyle,
        learningType: selectedLearningType,
        examType: selectedExamType,
        course: subject,
      },
    }));
    
    isGenerating = false;
    dispatch('schedule-generated', { schedule: newSchedule });
  }
</script>

<div class="modal-overlay" on:click={() => dispatch('close')}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <h2><Sparkles size={16} /> AI Schedule Generator</h2>
      <button class="close-btn" on:click={() => dispatch('close')}><X size={16} /></button>
    </div>

    <div class="modal-body">
      <!-- Processing Style Selection -->
      <div class="section">
        <h3>Processing Style</h3>
        <div class="option-grid">
          {#each processingStyles as style}
            <button
              class="style-option"
              class:selected={selectedProcessingStyle === style.id}
              on:click={() => selectedProcessingStyle = style.id}
            >
              <div class="option-label">{style.label}</div>
              <div class="option-desc">{style.desc}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Learning Type Selection -->
      <div class="section">
        <h3>Learning Type (VAK Model)</h3>
        <div class="learning-grid">
          {#each learningTypes as type}
            <button
              class="learning-option"
              class:selected={selectedLearningType === type.id}
              on:click={() => selectedLearningType = type.id}
            >
              <div class="learning-icon">{type.icon}</div>
              <div class="learning-label">{type.label}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Exam Type Selection -->
      <div class="section">
        <h3>Exam Type</h3>
        <div class="option-grid-row">
          {#each examTypes as exam}
            <button
              class="exam-option"
              class:selected={selectedExamType === exam.id}
              on:click={() => selectedExamType = exam.id}
            >
              {exam.label}
              {#if selectedExamType === exam.id}
                <Check size={14} />
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Focus Subjects -->
      <div class="section">
        <h3>Focus Subjects/Courses</h3>
        <div class="subject-input">
          <input
            type="text"
            placeholder="Enter subject or course name"
            bind:value={newSubject}
            on:keydown={e => e.key === 'Enter' && addSubject()}
          />
          <button class="add-subject-btn" on:click={addSubject}>
            <Plus size={14} /> Add
          </button>
        </div>
        <div class="subjects-list">
          {#each focusSubjects as subject}
            <div class="subject-chip">
              {subject}
              <button on:click={() => removeSubject(subject)}>
                <X size={12} />
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Daily Study Hours -->
      <div class="section">
        <h3>Daily Study Hours</h3>
        <div class="hours-input">
          <input
            type="range"
            min="1"
            max="12"
            bind:value={dailyHours}
            class="hour-slider"
          />
          <span class="hours-value">{dailyHours} hours</span>
        </div>
      </div>

      <!-- Target Date (Optional) -->
      <div class="section">
        <h3>Target Exam Date (Optional)</h3>
        <input
          type="date"
          bind:value={targetDate}
          class="date-input"
        />
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-cancel" on:click={() => dispatch('close')}>Cancel</button>
      <button
        class="btn-generate"
        disabled={focusSubjects.length === 0 || isGenerating}
        on:click={generateSchedule}
      >
        {#if isGenerating}
          <span class="spinner"></span> Generating...
        {:else}
          <Sparkles size={14} /> Generate Schedule
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #0e0e10;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a3e635;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 4px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .section h3 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.4);
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .style-option {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 200ms ease;
    text-align: left;
  }

  .style-option.selected {
    background: rgba(163, 230, 53, 0.1);
    border-color: #a3e635;
  }

  .option-label {
    font-weight: 600;
    font-size: 13px;
    color: white;
    margin-bottom: 4px;
  }

  .option-desc {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }

  .learning-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .learning-option {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 200ms ease;
  }

  .learning-option.selected {
    background: rgba(163, 230, 53, 0.1);
    border-color: #a3e635;
  }

  .learning-icon {
    font-size: 24px;
  }

  .learning-label {
    font-size: 11px;
    font-weight: 600;
    color: white;
  }

  .option-grid-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .exam-option {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 200ms ease;
  }

  .exam-option.selected {
    background: rgba(163, 230, 53, 0.1);
    border-color: #a3e635;
    color: #a3e635;
  }

  .subject-input {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .subject-input input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    font-size: 13px;
  }

  .subject-input input::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  .add-subject-btn {
    background: #a3e635;
    color: #000;
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .subjects-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .subject-chip {
    background: rgba(163, 230, 53, 0.1);
    border: 1px solid rgba(163, 230, 53, 0.2);
    border-radius: 6px;
    padding: 6px 12px;
    color: #a3e635;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .subject-chip button {
    background: transparent;
    border: none;
    color: #a3e635;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .hours-input {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hour-slider {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
  }

  .hour-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #a3e635;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(163, 230, 53, 0.5);
  }

  .hour-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #a3e635;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 8px rgba(163, 230, 53, 0.5);
  }

  .hours-value {
    font-weight: 600;
    color: #a3e635;
    min-width: 80px;
    text-align: right;
  }

  .date-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    font-size: 13px;
    width: 100%;
  }

  .modal-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-cancel,
  .btn-generate {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    border: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-generate {
    background: #a3e635;
    color: #000;
  }

  .btn-generate:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
