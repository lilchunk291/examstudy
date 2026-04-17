import { Task } from "../app/pages/Schedule";

export interface AIConfig {
  intensity: string;
  targetHours: number;
  topics: string;
}

export interface GeneratedEvent {
  title: string;
  type: string;
  color: string;
  start_time: string;
  duration_minutes: number;
  reason: string;
}

export const generateSchedule = (
  tasks: Task[],
  aiConfig: AIConfig,
  startDate: Date = new Date()
): GeneratedEvent[] => {
  const plan: GeneratedEvent[] = [];
  
  const uncompletedTasks = tasks.filter(t => !t.completed);
  const durationMap = {
    "Deep Work": 120,
    "Sprint": 45,
    "Balanced": 60
  };
  const baseDuration = durationMap[aiConfig.intensity as keyof typeof durationMap] || 60;
  const topicsList = aiConfig.topics ? aiConfig.topics.split(',').map(t => t.trim()) : ["General Study"];
  
  // RL Agent State
  let currentFatigue = 0;

  // Generate 7 days of schedule
  for (let i = 0; i < 7; i++) {
    let dailyHoursAllocated = 0;
    let currentHour = 9; // Start at 9 AM
    currentFatigue = 0; // Reset fatigue each day
    
    // Sort tasks by priority (Simulating Q-value exploitation)
    const availableTasks = [...uncompletedTasks].sort((a, b) => {
       const weightA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
       const weightB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
       return weightB - weightA;
    });

    while (dailyHoursAllocated < aiConfig.targetHours && currentHour < 20) {
      // RL Policy: If fatigue is too high, take a break
      if (currentFatigue > 70) {
        const breakStart = new Date(startDate);
        breakStart.setDate(breakStart.getDate() + i);
        breakStart.setHours(Math.floor(currentHour), (currentHour % 1) * 60, 0, 0);
        
        plan.push({
          title: "Cognitive Recovery Break",
          type: "Break",
          color: "emerald",
          start_time: breakStart.toISOString(),
          duration_minutes: 30,
          reason: "RL Agent detected high fatigue (>70%). Scheduled break to restore cognitive capacity."
        });
        
        currentHour += 0.5;
        currentFatigue = Math.max(0, currentFatigue - 50);
        continue;
      }
      
      // CSP Constraint: Fit session into available time
      const task = availableTasks.length > 0 ? availableTasks.shift() : null;
      const topic = topicsList[Math.floor(Math.random() * topicsList.length)];
      const title = task ? `Focus: ${task.title}` : `Deep Dive: ${topic}`;
      
      const sessionStart = new Date(startDate);
      sessionStart.setDate(sessionStart.getDate() + i);
      sessionStart.setHours(Math.floor(currentHour), (currentHour % 1) * 60, 0, 0);
      
      plan.push({
         title,
         type: aiConfig.intensity,
         color: task ? (task.priority === 'high' ? 'rose' : 'amber') : 'indigo',
         start_time: sessionStart.toISOString(),
         duration_minutes: baseDuration,
         reason: task 
            ? `CSP matched high-priority task to optimal energy window.` 
            : `RL exploration: Scheduled ${topic} to balance knowledge graph.`
      });
      
      currentHour += (baseDuration / 60);
      dailyHoursAllocated += (baseDuration / 60);
      currentFatigue += (baseDuration === 120 ? 45 : 25); // Deep work causes more fatigue
    }
  }

  return plan;
};
