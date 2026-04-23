import { Task } from "../app/pages/Schedule";

export interface AIConfig {
  intensity: string;
  targetHours: number;
  topics: string;
  prioritizeBacklogs?: boolean;
  preferredTimeSlots?: string[]; // e.g. ["morning", "afternoon", "evening", "night"]
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
  
  // Time slot definitions
  const slotHours: Record<string, { start: number, end: number }> = {
    "morning": { start: 8, end: 12 },
    "afternoon": { start: 13, end: 17 },
    "evening": { start: 18, end: 22 },
    "night": { start: 22, end: 2 }, // Crosses midnight
    "early-bird": { start: 5, end: 9 }
  };

  const selectedSlots = aiConfig.preferredTimeSlots && aiConfig.preferredTimeSlots.length > 0 
    ? aiConfig.preferredTimeSlots 
    : ["morning", "afternoon"];

  // RL Agent State
  let currentFatigue = 0;

  // Sort tasks by priority (Simulating Q-value exploitation) globally for the week
  const availableTasks = [...uncompletedTasks].sort((a, b) => {
     let weightA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
     let weightB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
     
     if (aiConfig.prioritizeBacklogs) {
       if (a.isBacklog) weightA += 5;
       if (b.isBacklog) weightB += 5;
     }
     
     return weightB - weightA;
  });

  // Generate 7 days of schedule
  for (let i = 0; i < 7; i++) {
    let dailyHoursAllocated = 0;
    currentFatigue = 0; // Reset fatigue each day

    // Iterate through selected time slots
    for (const slotName of selectedSlots) {
      if (dailyHoursAllocated >= aiConfig.targetHours) break;

      const slot = slotHours[slotName];
      if (!slot) continue;

      let currentHour = slot.start;
      const endHour = slot.end;

      // Handle night shift crossing midnight
      const effectiveEndHour = endHour < currentHour ? endHour + 24 : endHour;

      while (dailyHoursAllocated < aiConfig.targetHours && currentHour < effectiveEndHour) {
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
      let topic = topicsList[Math.floor(Math.random() * topicsList.length)];
      
      let title = "";
      let color = "indigo";
      let reason = "";

      if (task) {
        title = task.isBacklog && aiConfig.prioritizeBacklogs ? `[BACKLOG] ${task.title}` : `Focus: ${task.title}`;
        color = task.isBacklog ? 'rose' : (task.priority === 'high' ? 'amber' : 'indigo');
        reason = task.isBacklog 
          ? "Urgent: Scheduled Arrear/Backlog clearance session to recover course credits."
          : "CSP matched high-priority task to optimal energy window.";

        if (task.isBacklog) currentFatigue += 15; // Extra mental fatigue for backlogs
      } else {
        title = `Deep Dive: ${topic}`;
        color = 'indigo';
        reason = `RL exploration: Scheduled ${topic} to balance knowledge graph.`;
      }
      
      const sessionStart = new Date(startDate);
      sessionStart.setDate(sessionStart.getDate() + i);
      sessionStart.setHours(Math.floor(currentHour), (currentHour % 1) * 60, 0, 0);
      
      plan.push({
         title,
         type: task?.isBacklog ? "Catch-Up Mode" : aiConfig.intensity,
         color,
         start_time: sessionStart.toISOString(),
         duration_minutes: baseDuration,
         reason
      });
      
      currentHour += (baseDuration / 60);
      dailyHoursAllocated += (baseDuration / 60);
      currentFatigue += (baseDuration === 120 ? 45 : 25); // Deep work causes more fatigue
    }
  }
}

return plan;
};
