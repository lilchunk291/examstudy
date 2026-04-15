import { useState, useEffect, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import { 
  Plus, 
  MoreHorizontal,
  CheckCircle2,
  Zap,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  Sparkles,
  Target,
  Brain,
  Search,
  Settings,
  Filter,
  X,
  Loader2,
  Info,
  ArrowRight,
  Play,
  Pause,
  Bell,
  Video
} from "lucide-react";
import { useNavigate } from "react-router";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, addHours, startOfDay, isBefore, isAfter, subHours, subDays, parseISO, startOfMonth, endOfMonth, endOfWeek } from "date-fns";
import { getSupabase } from "../../lib/supabase";
import FocusMode from "../components/FocusMode";
import { toast } from "sonner";

// Mock data for initial state
const INITIAL_EVENTS = [
  { id: "1", title: "Advanced Algorithms", type: "Deep Work", color: "indigo", start: new Date(2026, 8, 17, 9, 0), duration: 150, icon: Zap },
  { id: "2", title: "Lunch & Rest", type: "Break", color: "slate", start: new Date(2026, 8, 17, 12, 30), duration: 60, icon: Clock },
  { id: "3", title: "LMS Sync: BioTech", type: "Sync", color: "emerald", start: new Date(2026, 8, 17, 14, 0), duration: 90, icon: LayoutGrid },
  { id: "4", title: "Neural Networks", type: "Deep Work", color: "violet", start: new Date(2026, 8, 17, 16, 0), duration: 120, icon: Brain }
];

export default function Schedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 17));
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [aiConfig, setAiConfig] = useState({ targetHours: 6, intensity: "Balanced", learningStyle: "Visual", examType: "MCQ", studyGoals: "", topics: "" });
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newSession, setNewSession] = useState({ 
    title: "", 
    startTime: "09:00", 
    duration: "60", 
    type: "Deep Work", 
    color: "indigo", 
    goal: "", 
    goalAchieved: false, 
    reminderType: "none", 
    reminderTime: "09:00",
    meetingLink: "",
    platform: "google"
  });
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dbSchema, setDbSchema] = useState<{ hasMeetingLink: boolean; hasPlatform: boolean }>({ hasMeetingLink: true, hasPlatform: true });
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", dueDate: format(new Date(), "yyyy-MM-dd"), reminderType: "none", reminderTime: "09:00" });
  const [activeFocusSession, setActiveFocusSession] = useState<any>(null);
  const [taskToConfirm, setTaskToConfirm] = useState<{id: string, status: boolean} | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Review Calculus Notes", priority: "high", completed: false, dueDate: "2026-09-18" },
    { id: "t2", title: "Submit Bio Assignment", priority: "medium", completed: true, dueDate: "2026-09-17" },
    { id: "t3", title: "Read Ethics Chapter 4", priority: "low", completed: false, dueDate: "2026-09-20" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakTimer, setBreakTimer] = useState({ seconds: 300, isActive: false, mode: 'break' as 'work' | 'break' });
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let interval: any;
    if (breakTimer.isActive && breakTimer.seconds > 0) {
      interval = setInterval(() => {
        setBreakTimer(prev => ({ ...prev, seconds: prev.seconds - 1 }));
      }, 1000);
    } else if (breakTimer.seconds === 0) {
      setBreakTimer(prev => ({ ...prev, isActive: false }));
      playSuccessSound();
      toast.success(`${breakTimer.mode === 'break' ? 'Break' : 'Focus'} session complete!`, {
        description: breakTimer.mode === 'break' ? "Time to get back to work!" : "Take a well-deserved break.",
        duration: 5000,
      });
    }
    return () => clearInterval(interval);
  }, [breakTimer.isActive, breakTimer.seconds, breakTimer.mode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getSupabase();
        
        const [tasksResponse, eventsResponse] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('events').select('*').order('start_time', { ascending: true })
        ]);

        if (tasksResponse.error) throw tasksResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;

        if (tasksResponse.data && tasksResponse.data.length > 0) {
          setTasks(tasksResponse.data.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            completed: t.completed,
            dueDate: t.due_date,
            reminderType: t.reminder_type || 'none',
            reminderTime: t.reminder_time || '09:00'
          })));
        }

        if (eventsResponse.data && eventsResponse.data.length > 0) {
          const mappedEvents = eventsResponse.data.map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            color: e.color,
            start: new Date(e.start_time),
            duration: e.duration_minutes,
            icon: e.icon_name === 'Sparkles' ? Sparkles : Zap,
            icon_name: e.icon_name,
            goal: e.goal,
            goalAchieved: e.goal_achieved,
            reminderType: e.reminder_type,
            reminderTime: e.reminder_time,
            meetingLink: e.meeting_link,
            platform: e.platform
          }));
          setEvents(mappedEvents);
          
          // Check schema
          setDbSchema({
            hasMeetingLink: 'meeting_link' in eventsResponse.data[0],
            hasPlatform: 'platform' in eventsResponse.data[0]
          });
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
        // Fallback to initial data is already set in state
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Set up Realtime subscriptions
    const supabase = getSupabase();
    
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        if (payload.eventType === 'INSERT') {
          setTasks(current => {
            if (current.find(t => t.id === payload.new.id)) return current;
            return [...current, {
              id: payload.new.id,
              title: payload.new.title,
              priority: payload.new.priority,
              completed: payload.new.completed,
              dueDate: payload.new.due_date,
              reminderType: payload.new.reminder_type || 'none',
              reminderTime: payload.new.reminder_time || '09:00'
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTasks(current => current.map(t => t.id === payload.new.id ? {
            id: payload.new.id,
            title: payload.new.title,
            priority: payload.new.priority,
            completed: payload.new.completed,
            dueDate: payload.new.due_date,
            reminderType: payload.new.reminder_type || 'none',
            reminderTime: payload.new.reminder_time || '09:00'
          } : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(current => current.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const eventsSubscription = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        if (payload.eventType === 'INSERT') {
          setEvents(current => {
            if (current.find(e => e.id === payload.new.id)) return current;
            return [...current, {
              id: payload.new.id,
              title: payload.new.title,
              type: payload.new.type,
              color: payload.new.color,
              start: new Date(payload.new.start_time),
              duration: payload.new.duration_minutes,
              icon: payload.new.icon_name === 'Sparkles' ? Sparkles : Zap,
              icon_name: payload.new.icon_name,
              goal: payload.new.goal,
              goalAchieved: payload.new.goal_achieved
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          setEvents(current => current.map(e => e.id === payload.new.id ? {
            id: payload.new.id,
            title: payload.new.title,
            type: payload.new.type,
            color: payload.new.color,
            start: new Date(payload.new.start_time),
            duration: payload.new.duration_minutes,
            icon: payload.new.icon_name === 'Sparkles' ? Sparkles : Zap,
            icon_name: payload.new.icon_name,
            goal: payload.new.goal,
            goalAchieved: payload.new.goal_achieved
          } : e));
        } else if (payload.eventType === 'DELETE') {
          setEvents(current => current.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(eventsSubscription);
    };
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.completed || task.reminderType === 'none' || !task.reminderType || notifiedTasksRef.current.has(task.id)) {
          return;
        }

        let reminderTime: Date | null = null;
        const dueDate = parseISO(task.dueDate);

        if (task.reminderType === '1_hour') {
          // Assuming due date is at end of day, or use 00:00. Let's assume 00:00 of the due date for simplicity, 
          // or if it's just a date, maybe 1 hour before 9 AM? Let's assume 1 hour before 00:00 of due date.
          // Actually, if it's just a date, '1 hour before' is ambiguous. Let's assume due at 23:59.
          reminderTime = subHours(startOfDay(addDays(dueDate, 1)), 1); // 23:00 of due date
        } else if (task.reminderType === '1_day') {
          reminderTime = subDays(startOfDay(dueDate), 1); // 00:00 of day before
        } else if (task.reminderType === 'custom' && task.reminderTime) {
          const [hours, minutes] = task.reminderTime.split(':').map(Number);
          reminderTime = new Date(dueDate);
          reminderTime.setHours(hours, minutes, 0, 0);
        }

        if (reminderTime && isBefore(reminderTime, now) && isAfter(addHours(reminderTime, 24), now)) {
          // Reminder is due and we haven't notified yet (and it's not super old)
          toast(`Reminder: ${task.title}`, {
            description: `Due on ${format(dueDate, 'MMM d, yyyy')}`,
            icon: <Bell className="w-4 h-4 text-indigo-500" />,
            action: {
              label: "Complete",
              onClick: () => requestTaskCompletionToggle(task.id, false)
            }
          });
          notifiedTasksRef.current.add(task.id);
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately on mount/update

    return () => clearInterval(intervalId);
  }, [tasks]);

  // Sort tasks: uncompleted first, then by priority, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (priorityWeight[a.priority as keyof typeof priorityWeight] !== priorityWeight[b.priority as keyof typeof priorityWeight]) {
      return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Calendar logic
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const generateAiSuggestions = () => {
    setIsGeneratingSuggestions(true);
    
    setTimeout(() => {
      const pendingTasks = tasks.filter(t => !t.completed);
      const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
      
      const suggestions = [];
      
      if (highPriorityTasks.length > 0) {
        suggestions.push({
          id: `sug-${Date.now()}-1`,
          title: `Deep Work: ${highPriorityTasks[0].title}`,
          reason: `High priority task due ${formatDueDate(highPriorityTasks[0].dueDate).text.toLowerCase()}`,
          type: "Deep Work",
          color: "rose",
          duration: 120,
          start: addHours(startOfDay(new Date()), 10) // 10 AM today
        });
      }
      
      if (pendingTasks.length > 1) {
        suggestions.push({
          id: `sug-${Date.now()}-2`,
          title: `Review: ${pendingTasks[1].title}`,
          reason: "Based on your visual learning style, a review session is recommended.",
          type: "Sync",
          color: "indigo",
          duration: 60,
          start: addHours(startOfDay(new Date()), 14) // 2 PM today
        });
      }
      
      if (suggestions.length === 0) {
        suggestions.push({
          id: `sug-${Date.now()}-3`,
          title: "Explore New Topics",
          reason: "You have no pending tasks. Good time to explore new material.",
          type: "Deep Work",
          color: "emerald",
          duration: 90,
          start: addHours(startOfDay(new Date()), 16) // 4 PM today
        });
      }
      
      setAiSuggestions(suggestions);
      setIsGeneratingSuggestions(false);
    }, 1500);
  };

  const acceptSuggestion = async (suggestion: any) => {
    const newEvent = {
      title: suggestion.title,
      type: suggestion.type,
      color: suggestion.color,
      start_time: suggestion.start.toISOString(),
      duration_minutes: suggestion.duration,
      icon_name: 'Sparkles'
    };
    
    // Optimistic update
    const localEvent = {
      id: `ai-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type,
      color: newEvent.color,
      start: new Date(newEvent.start_time),
      duration: newEvent.duration_minutes,
      icon: Sparkles,
      icon_name: 'Sparkles',
      goal: "",
      goalAchieved: false
    };
    setEvents([...events, localEvent]);
    setAiSuggestions(aiSuggestions.filter(s => s.id !== suggestion.id));
    
    try {
      const supabase = getSupabase();
      await supabase.from('events').insert([newEvent]);
    } catch (error) {
      console.error("Error accepting suggestion:", error);
    }
  };

  const handleGenerateAiSchedule = () => {
    setIsGenerating(true);
    setGenerationStep("Analyzing cognitive patterns...");
    
    setTimeout(() => setGenerationStep("Applying CSP constraints..."), 800);
    setTimeout(() => setGenerationStep("Optimizing with RL Agent..."), 1600);

    // Simulate AI generation logic using CSP (k-consistency) and RL Agent (Q-Learning + Multi-Armed Bandit with GA)
    setTimeout(async () => {
      // --- Simulated RL Agent (Q-Learning + MAB with GA) ---
      // 1. Initialize Q-Table for state-action pairs (time slots vs intensity)
      // 2. Use Multi-Armed Bandit to balance exploration (new time slots) vs exploitation (known productive slots)
      // 3. Apply Genetic Algorithm to evolve the best sequence of study sessions over the week
      const baseHour = aiConfig.intensity === "Sprint" ? 8 : 10;
      const duration = aiConfig.intensity === "Deep Work" ? 180 : (aiConfig.intensity === "Sprint" ? 45 : 120);
      
      // --- Simulated CSP (k-consistency) ---
      // 1. Define variables: Study sessions
      // 2. Define domains: Available time slots in the week
      // 3. Define constraints: Target hours, no overlapping sessions, preferred intensity protocols
      // 4. Apply k-consistency to prune the search space and find a valid schedule
      
      const topicPrefix = aiConfig.topics ? aiConfig.topics.split(',')[0].trim() : aiConfig.learningStyle;
      const newAiEvents = [
        { title: `AI Optimized: ${topicPrefix} Study`, type: "Deep Work", color: "amber", start_time: new Date(2026, 8, 18, baseHour, 0).toISOString(), duration_minutes: duration, icon_name: 'Sparkles' },
        { title: `AI Optimized: ${aiConfig.examType} Prep`, type: "Deep Work", color: "rose", start_time: new Date(2026, 8, 18, baseHour + 4, 0).toISOString(), duration_minutes: duration, icon_name: 'Sparkles' },
      ];
      
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('events').insert(newAiEvents).select();
        
        if (error) throw error;
        
        const mappedEvents = data.map(e => ({
          id: e.id,
          title: e.title,
          type: e.type,
          color: e.color,
          start: new Date(e.start_time),
          duration: e.duration_minutes,
          icon: Sparkles,
          icon_name: 'Sparkles',
          goal: e.goal,
          goalAchieved: e.goal_achieved
        }));
        
        setEvents([...events, ...mappedEvents]);
      } catch (error) {
        console.error("Error adding AI events:", error);
        // Fallback
        const fallbackEvents = newAiEvents.map((e, i) => ({
          id: `ai-${Date.now()}-${i}`,
          title: e.title,
          type: e.type,
          color: e.color,
          start: new Date(e.start_time),
          duration: e.duration_minutes,
          icon: Sparkles
        }));
        setEvents([...events, ...fallbackEvents]);
      }
      
      setIsGenerating(false);
      setIsAiPanelOpen(false);
      setGenerationStep("");
    }, 2500);
  };

  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    setGenerationStep("Analyzing weekly goals...");
    
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const prompt = `
        You are an elite academic advisor. Create a comprehensive weekly study plan for a student.
        
        User Goals: ${aiConfig.studyGoals}
        Topics: ${aiConfig.topics}
        Learning Style: ${aiConfig.learningStyle}
        Target Hours per Day: ${aiConfig.targetHours}
        
        Current Tasks:
        ${JSON.stringify(tasks.filter(t => !t.completed).map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate })), null, 2)}
        
        Generate a list of study sessions for the next 7 days starting from ${format(new Date(), "yyyy-MM-dd")}.
        Each session should have:
        - title: Specific and actionable
        - type: "Deep Work", "Sync", or "Break"
        - color: "indigo", "emerald", "violet", "amber", or "rose"
        - start_time: ISO string
        - duration_minutes: number (30, 60, 90, 120, or 180)
        - reason: Why this session is scheduled at this time
        
        Return a JSON array of session objects. Only return the JSON array.
      `;

      setGenerationStep("Synthesizing study blocks...");
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const text = result.text;
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const plan = JSON.parse(cleanedText);

      setGenerationStep("Finalizing schedule...");
      
      const mappedSuggestions = plan.map((s: any, idx: number) => ({
        id: `plan-${Date.now()}-${idx}`,
        title: s.title,
        type: s.type,
        color: s.color,
        start: new Date(s.start_time),
        duration: s.duration_minutes,
        reason: s.reason,
        icon: Sparkles
      }));

      setAiSuggestions(mappedSuggestions);
      setIsAiPanelOpen(false);
      toast.success("Weekly Plan Generated", {
        description: "Review the AI suggestions in the Mission Control panel.",
      });
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      toast.error("Plan Generation Failed", {
        description: "Could not connect to AI service. Please try again later.",
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const openEditEvent = (event: any) => {
    setSelectedEvent(event);
    setNewSession({
      title: event.title,
      startTime: format(event.start, "HH:mm"),
      duration: event.duration.toString(),
      type: event.type,
      color: event.color,
      goal: event.goal || "",
      goalAchieved: event.goalAchieved || false,
      reminderType: event.reminderType || "none",
      reminderTime: event.reminderTime || "09:00",
      meetingLink: event.meetingLink || "",
      platform: event.platform || "google"
    });
    setIsManualModalOpen(true);
  };

  const closeEventModal = () => {
    setIsManualModalOpen(false);
    setSelectedEvent(null);
    setNewSession({ 
      title: "", 
      startTime: "09:00", 
      duration: "60", 
      type: "Deep Work", 
      color: "indigo", 
      goal: "", 
      goalAchieved: false, 
      reminderType: "none", 
      reminderTime: "09:00",
      meetingLink: "",
      platform: "google"
    });
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim()) return;
    
    const [hours, minutes] = newSession.startTime.split(':').map(Number);
    const startDate = new Date(selectedEvent ? selectedEvent.start : currentDate);
    startDate.setHours(hours, minutes, 0, 0);

    const eventData: any = {
      title: newSession.title,
      type: newSession.type,
      color: newSession.color,
      start_time: startDate.toISOString(),
      duration_minutes: parseInt(newSession.duration),
      icon_name: selectedEvent ? selectedEvent.icon_name : 'Zap',
      goal: newSession.goal,
      goal_achieved: newSession.goalAchieved,
      reminder_type: newSession.reminderType,
      reminder_time: newSession.reminderTime
    };

    if (dbSchema.hasMeetingLink) eventData.meeting_link = newSession.meetingLink;
    if (dbSchema.hasPlatform) eventData.platform = newSession.platform;

    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? { 
        ...e, 
        ...eventData, 
        start: startDate, 
        duration: eventData.duration_minutes, 
        goal: eventData.goal, 
        goalAchieved: eventData.goal_achieved, 
        reminderType: eventData.reminder_type, 
        reminderTime: eventData.reminder_time,
        meetingLink: eventData.meeting_link,
        platform: eventData.platform
      } : e));
      try {
        const supabase = getSupabase();
        if (!selectedEvent.id.toString().startsWith('m-') && !selectedEvent.id.toString().startsWith('ai-')) {
          await supabase.from('events').update(eventData).eq('id', selectedEvent.id);
        }
      } catch (error) {
        console.error("Error updating event:", error);
      }
    } else {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('events').insert([eventData]).select().single();
        
        if (error) throw error;
        
        setEvents([...events, {
          id: data.id,
          title: data.title,
          type: data.type,
          color: data.color,
          start: new Date(data.start_time),
          duration: data.duration_minutes,
          icon: Zap,
          goal: data.goal,
          goalAchieved: data.goal_achieved,
          meetingLink: data.meeting_link,
          platform: data.platform
        }]);
      } catch (error) {
        console.error("Error adding manual event:", error);
        // Fallback
        setEvents([...events, {
          id: `m-${Date.now()}`,
          ...eventData,
          start: new Date(eventData.start_time),
          duration: eventData.duration_minutes,
          icon: Zap,
          goal: eventData.goal,
          goalAchieved: eventData.goal_achieved,
          meetingLink: eventData.meeting_link,
          platform: eventData.platform
        }]);
      }
    }

    closeEventModal();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const previousEvents = [...events];
    setEvents(events.filter(e => e.id !== eventId));
    
    try {
      const supabase = getSupabase();
      if (!eventId.startsWith('m-') && !eventId.startsWith('ai-') && !eventId.startsWith('1') && !eventId.startsWith('2') && !eventId.startsWith('3') && !eventId.startsWith('4')) {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setEvents(previousEvents);
    }
  };

  const toggleGoalAchievement = async (event: any, e: MouseEvent) => {
    e.stopPropagation();
    const newStatus = !event.goalAchieved;
    
    // Optimistic update
    setEvents(events.map(ev => ev.id === event.id ? { ...ev, goalAchieved: newStatus } : ev));
    
    if (newStatus) {
      playSuccessSound();
    }

    try {
      const supabase = getSupabase();
      if (!event.id.toString().startsWith('m-') && !event.id.toString().startsWith('ai-')) {
        await supabase.from('events').update({ goal_achieved: newStatus }).eq('id', event.id);
      }
    } catch (error) {
      console.error("Error toggling goal achievement:", error);
      // Revert on error
      setEvents(events.map(ev => ev.id === event.id ? { ...ev, goalAchieved: !newStatus } : ev));
    }
  };

  const openEditTask = (task: any) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      reminderType: task.reminderType || 'none',
      reminderTime: task.reminderTime || '09:00'
    });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setNewTask({ title: "", priority: "medium", dueDate: format(new Date(), "yyyy-MM-dd"), reminderType: "none", reminderTime: "09:00" });
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    const taskData = {
      title: newTask.title,
      priority: newTask.priority,
      completed: selectedTask ? selectedTask.completed : false,
      due_date: newTask.dueDate,
      reminder_type: newTask.reminderType,
      reminder_time: newTask.reminderTime
    };

    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, title: taskData.title, priority: taskData.priority, dueDate: taskData.due_date, reminderType: taskData.reminder_type, reminderTime: taskData.reminder_time } : t));
      try {
        const supabase = getSupabase();
        if (!selectedTask.id.startsWith('t')) {
          await supabase.from('tasks').update(taskData).eq('id', selectedTask.id);
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('tasks').insert([taskData]).select().single();
        
        if (error) throw error;
        
        setTasks([...tasks, {
          id: data.id,
          title: data.title,
          priority: data.priority,
          completed: data.completed,
          dueDate: data.due_date,
          reminderType: data.reminder_type,
          reminderTime: data.reminder_time
        }]);
      } catch (error) {
        console.error("Error adding task:", error);
        // Fallback for local state if Supabase fails
        setTasks([...tasks, {
          id: `t${Date.now()}`,
          title: taskData.title,
          priority: taskData.priority,
          completed: false,
          dueDate: taskData.due_date,
          reminderType: taskData.reminder_type,
          reminderTime: taskData.reminder_time
        }]);
      }
    }

    closeTaskModal();
  };

  const prioritizeTasksWithAI = async () => {
    if (tasks.length === 0) return;
    setIsPrioritizing(true);
    
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const prompt = `
        You are an expert productivity coach. I have a list of tasks with their current priorities and due dates.
        Please re-prioritize them to optimize my focus and ensure I meet all deadlines.
        
        Current Tasks:
        ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate })), null, 2)}
        
        Return a JSON array of objects with the task 'id' and the new 'priority' (high, medium, or low).
        Only return the JSON array, no other text.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const text = result.text;
      
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const newPriorities = JSON.parse(cleanedText);

      const updatedTasks = tasks.map(task => {
        const update = newPriorities.find((p: any) => p.id === task.id);
        return update ? { ...task, priority: update.priority } : task;
      });

      setTasks(updatedTasks);
      toast.success("Tasks Re-prioritized", {
        description: "AI has optimized your task priorities based on deadlines.",
      });

      // Update in Supabase
      const supabase = getSupabase();
      for (const update of newPriorities) {
        if (!update.id.toString().startsWith('t')) {
          await supabase.from('tasks').update({ priority: update.priority }).eq('id', update.id);
        }
      }
    } catch (error) {
      console.error("Error prioritizing tasks:", error);
      toast.error("Prioritization Failed", {
        description: "Could not connect to AI service. Please try again later.",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    if (!dateString) return { text: "No due date", color: "text-slate-400" };
    const date = new Date(dateString);
    const today = startOfDay(new Date());
    const taskDate = startOfDay(date);
    
    if (isBefore(taskDate, today)) {
      return { text: `Overdue (${format(date, "MMM d")})`, color: "text-rose-500 font-bold" };
    } else if (isSameDay(taskDate, today)) {
      return { text: "Due Today", color: "text-amber-500 font-bold" };
    } else if (isSameDay(taskDate, addDays(today, 1))) {
      return { text: "Due Tomorrow", color: "text-indigo-500 font-bold" };
    } else {
      return { text: `Due ${format(date, "MMM d, yyyy")}`, color: "text-slate-500" };
    }
  };

  const requestTaskCompletionToggle = (taskId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // If marking as completed, show confirmation
      setTaskToConfirm({ id: taskId, status: currentStatus });
    } else {
      // If unmarking, just do it directly
      executeTaskCompletionToggle(taskId, currentStatus);
    }
  };

  const executeTaskCompletionToggle = async (taskId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      playSuccessSound();
    }
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    
    try {
      const supabase = getSupabase();
      // Only update if it's a real UUID (not a fallback local ID starting with 't')
      if (!taskId.startsWith('t')) {
        await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', taskId);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on error
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: currentStatus } : t));
    }
  };

  const confirmTaskCompletion = () => {
    if (taskToConfirm) {
      executeTaskCompletionToggle(taskToConfirm.id, taskToConfirm.status);
      setTaskToConfirm(null);
    }
  };

  const cancelTaskCompletion = () => {
    setTaskToConfirm(null);
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      // Check Task Reminders
      tasks.forEach(task => {
        if (task.completed || task.reminderType === 'none' || !task.reminderType || notifiedTasksRef.current.has(task.id)) {
          return;
        }

        let reminderTime: Date | null = null;
        const dueDate = parseISO(task.dueDate);

        if (task.reminderType === '1_hour') {
          reminderTime = subHours(startOfDay(addDays(dueDate, 1)), 1);
        } else if (task.reminderType === '1_day') {
          reminderTime = subDays(startOfDay(dueDate), 1);
        } else if (task.reminderType === 'custom' && task.reminderTime) {
          const [hours, minutes] = task.reminderTime.split(':').map(Number);
          reminderTime = new Date(dueDate);
          reminderTime.setHours(hours, minutes, 0, 0);
        }

        if (reminderTime && isBefore(reminderTime, now) && isAfter(addHours(reminderTime, 24), now)) {
          toast(`Task Reminder: ${task.title}`, {
            description: `Due on ${format(dueDate, 'MMM d, yyyy')}`,
            icon: <Bell className="w-4 h-4 text-indigo-500" />,
            action: {
              label: "Complete",
              onClick: () => requestTaskCompletionToggle(task.id, false)
            }
          });
          notifiedTasksRef.current.add(task.id);
        }
      });

      // Check Event Reminders
      events.forEach(event => {
        if (event.reminderType === 'none' || !event.reminderType || notifiedTasksRef.current.has(event.id)) {
          return;
        }

        let reminderTime: Date | null = null;
        const eventStart = new Date(event.start);

        if (event.reminderType === '1h') {
          reminderTime = subHours(eventStart, 1);
        } else if (event.reminderType === '1d') {
          reminderTime = subDays(eventStart, 1);
        } else if (event.reminderType === 'custom' && event.reminderTime) {
          const [hours, minutes] = event.reminderTime.split(':').map(Number);
          reminderTime = new Date(eventStart);
          reminderTime.setHours(hours, minutes, 0, 0);
        }

        if (reminderTime && isBefore(reminderTime, now) && isAfter(addHours(reminderTime, 1), now)) {
          toast(`Event Reminder: ${event.title}`, {
            description: `Starting at ${format(eventStart, 'HH:mm')}`,
            icon: <CalendarIcon className="w-4 h-4 text-indigo-500" />,
          });
          notifiedTasksRef.current.add(event.id);
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(intervalId);
  }, [tasks, events]);

  return (
    <div className="h-full flex flex-col font-sans text-slate-900">
      {/* Reclaim-style Top Navigation */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-semibold hover:bg-white rounded-md transition-all text-slate-700">Today</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1.5 hover:bg-white rounded-md transition-all text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 ml-2">{format(currentDate, "MMMM yyyy")}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                  view === v ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />
          
            <div className="relative group">
              <Search strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-accent-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search schedule..." 
                value={scheduleSearchQuery}
                onChange={(e) => setScheduleSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-card/40 border border-border focus:bg-card focus:border-accent-primary rounded-lg text-xs transition-all w-32 focus:w-48 outline-none font-bold text-foreground placeholder:text-muted-foreground"
              />
            </div>

          <button
            onClick={() => setIsAiPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-50/50">
        {/* Left Sidebar - Mini Calendar & Navigation */}
        <div className="w-64 border-r border-slate-200 bg-white p-6 space-y-8 overflow-y-auto hidden lg:block custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calendar</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentDate(subDays(currentDate, 30))}
                  className="p-1 hover:bg-slate-100 rounded-md transition-all"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                </button>
                <button 
                  onClick={() => setCurrentDate(addDays(currentDate, 30))}
                  className="p-1 hover:bg-slate-100 rounded-md transition-all"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-300 py-1">{d}</span>
              ))}
              {(() => {
                const monthStart = startOfMonth(currentDate);
                const monthEnd = endOfMonth(monthStart);
                const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
                const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
                const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                return calendarDays.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, currentDate);
                  const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

                  return (
                    <button 
                      key={i} 
                      onClick={() => setCurrentDate(day)}
                      className={`text-[11px] font-medium w-7 h-7 flex items-center justify-center rounded-lg transition-all relative ${
                        isSelected 
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 z-10" 
                          : isToday
                            ? "text-indigo-600 font-bold bg-indigo-50"
                            : isCurrentMonth 
                              ? "hover:bg-slate-100 text-slate-600" 
                              : "text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {format(day, "d")}
                      {isToday && !isSelected && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Smart Tasks</h3>
            <div className="space-y-2">
              {sortedTasks.filter(t => !t.completed).slice(0, 3).map(task => (
                <div key={task.id} className="p-3 bg-card/40 border border-border rounded-xl hover:border-accent-primary/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-foreground truncate group-hover:text-accent-primary transition-colors">{task.title}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Due {format(new Date(task.dueDate), 'MMM d')}</div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      task.priority === 'high' ? 'bg-rose-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full py-2 border border-dashed border-border rounded-xl text-[10px] font-black text-muted-foreground hover:text-accent-primary hover:border-accent-primary/50 transition-all"
              >
                + Add Smart Task
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Focus Tools</h3>
            <div className="space-y-2">
              <div className="p-4 bg-card/40 rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{breakTimer.mode === 'break' ? 'Break' : 'Focus'}</span>
                  <div className="flex gap-1">
                    {[300, 1500].map(s => (
                      <button 
                        key={s}
                        onClick={() => setBreakTimer({ seconds: s, isActive: false, mode: s === 1500 ? 'work' : 'break' })}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${breakTimer.seconds === s ? 'bg-accent-primary text-white' : 'text-muted-foreground hover:bg-card/60'}`}
                      >
                        {s/60}m
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-mono font-bold text-foreground tracking-tighter">
                    {Math.floor(breakTimer.seconds / 60).toString().padStart(2, '0')}:
                    {(breakTimer.seconds % 60).toString().padStart(2, '0')}
                  </div>
                  <button 
                    onClick={() => setBreakTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      breakTimer.isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-accent-primary/10 text-accent-primary'
                    }`}
                  >
                    {breakTimer.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-accent-primary rounded-xl space-y-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
                <div className="flex items-center gap-2 text-white/90 relative z-10">
                  <Brain className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Smart Tip</span>
                </div>
                <p className="text-[11px] text-white/90 font-medium leading-relaxed relative z-10">
                  High load on Wed. Move <span className="font-bold underline decoration-indigo-300">"Ethics"</span> to Thu?
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Integrations</h3>
            <div className="grid grid-cols-2 gap-2">
              {[{ name: "LMS", icon: LayoutGrid }, { name: "Google", icon: CalendarIcon }].map(sync => (
                <button key={sync.name} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-slate-50 transition-all group">
                  <sync.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-600">{sync.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar flex flex-col border-r border-slate-200">
          <div className="min-w-[800px] flex-1">
            {/* Grid Header */}
            <div className="flex border-b border-slate-200 sticky top-0 bg-white z-20">
              <div className="w-16 border-r border-slate-200" />
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, currentDate);
                
                return (
                  <div 
                    key={i} 
                    onClick={() => setCurrentDate(day)}
                    className={`flex-1 py-3 text-center border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors hover:bg-slate-50/50 ${
                      isSelected ? "bg-indigo-50/30" : isToday ? "bg-slate-50/30" : ""
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      isSelected ? "text-indigo-600" : isToday ? "text-indigo-500" : "text-slate-400"
                    }`}>
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-lg font-bold tracking-tight inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      isSelected 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" 
                        : isToday 
                          ? "bg-indigo-100 text-indigo-600" 
                          : "text-slate-900 hover:bg-slate-100"
                    }`}>
                      {format(day, "d")}
                    </div>
                    {isToday && !isSelected && (
                      <div className="w-1 h-1 bg-indigo-600 rounded-full mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="relative flex">
              {/* Time Labels */}
              <div className="w-16 flex-shrink-0 bg-white border-r border-slate-100">
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b border-slate-50 p-1.5 text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 flex relative">
                {/* Current Time Indicator */}
                <div 
                  className="absolute left-0 right-0 border-t border-rose-500 z-30 pointer-events-none flex items-center"
                  style={{ 
                    top: `${(currentTime.getHours() + currentTime.getMinutes() / 60 - 8) * 80}px`,
                    display: currentTime.getHours() >= 8 && currentTime.getHours() < 22 ? 'flex' : 'none'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 -ml-0.5" />
                </div>

                {weekDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="flex-1 border-r border-slate-100 last:border-r-0 relative">
                    {hours.map(hour => (
                      <div key={hour} className="h-20 border-b border-slate-50" />
                    ))}
                    
                    {/* Events for this day */}
                    {events
                      .filter(e => isSameDay(e.start, day))
                      .filter(e => e.title.toLowerCase().includes(scheduleSearchQuery.toLowerCase()))
                      .map(event => {
                        const startHour = event.start.getHours() + event.start.getMinutes() / 60;
                        const top = (startHour - 8) * 80; // 80px per hour
                        const height = (event.duration / 60) * 80;
                        
                        const colorMap: Record<string, string> = {
                          indigo: "border-indigo-600 bg-indigo-50/80 text-indigo-900",
                          emerald: "border-emerald-600 bg-emerald-50/80 text-emerald-900",
                          violet: "border-violet-600 bg-violet-50/80 text-violet-900",
                          amber: "border-amber-600 bg-amber-50/80 text-amber-900",
                          rose: "border-rose-600 bg-rose-50/80 text-rose-900",
                          slate: "border-slate-600 bg-slate-50/80 text-slate-900"
                        };

                        const barColorMap: Record<string, string> = {
                          indigo: "bg-indigo-600",
                          emerald: "bg-emerald-600",
                          violet: "bg-violet-600",
                          amber: "bg-amber-600",
                          rose: "bg-rose-600",
                          slate: "bg-slate-600"
                        };
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01, zIndex: 10 }}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            className={`absolute left-0.5 right-0.5 rounded-md border-l-4 shadow-sm cursor-pointer overflow-hidden group transition-all border-y border-r border-slate-200/50 ${colorMap[event.color] || colorMap.slate}`}
                            onClick={() => openEditEvent(event)}
                          >
                            <div className="p-2 h-full flex flex-col">
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold truncate leading-tight">{event.title}</div>
                                  <div className="text-[9px] font-semibold opacity-70 mt-0.5">
                                    {format(event.start, "h:mm a")}
                                  </div>
                                </div>
                                <event.icon className="w-3 h-3 opacity-40 flex-shrink-0" />
                              </div>
                              
                              {event.goal && height > 40 && (
                                <div className="mt-1.5 flex items-start gap-1.5">
                                  <div 
                                    onClick={(e) => toggleGoalAchievement(event, e)}
                                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all hover:scale-110 ${event.goalAchieved ? "bg-current border-current" : "border-current/30 hover:border-current"}`}
                                  >
                                    {event.goalAchieved && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <span className={`text-[9px] font-medium leading-tight line-clamp-2 ${event.goalAchieved ? "line-through opacity-50" : ""}`}>
                                    {event.goal}
                                  </span>
                                </div>
                              )}

                              {event.meetingLink && height > 30 && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <Video className="w-2.5 h-2.5 opacity-60" />
                                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 truncate">
                                    {event.platform || 'Meeting'}
                                  </span>
                                </div>
                              )}

                              <div className="mt-auto flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => toggleGoalAchievement(event, e)} 
                                  className={`p-1 rounded transition-all ${event.goalAchieved ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-black/5"}`}
                                  title={event.goalAchieved ? "Mark as Incomplete" : "Mark as Completed"}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                                {event.meetingLink && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); window.open(event.meetingLink, '_blank'); }} 
                                    className="p-1 hover:bg-black/5 rounded text-indigo-600"
                                    title="Join Meeting"
                                  >
                                    <Video className="w-3 h-3" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveFocusSession(event); }} 
                                  className="p-1 hover:bg-black/5 rounded text-amber-600"
                                  title="Start Focus Session"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} 
                                  className="p-1 hover:bg-black/5 rounded text-rose-600"
                                  title="Delete Event"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {event.goalAchieved && (
                              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
                            )}
                          </motion.div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Tasks Section */}
          <div className="p-8 border-t border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                  <Target strokeWidth={2.5} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-black italic text-slate-900 text-xl tracking-tight">Priority Tasks</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Action Items • Upcoming Deadlines</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={prioritizeTasksWithAI}
                  disabled={isPrioritizing}
                  className="px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl text-sm font-bold tracking-tight transition-all border border-indigo-100 flex items-center gap-3 disabled:opacity-50"
                >
                  {isPrioritizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI Prioritize
                </button>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-sm font-bold tracking-tight transition-all border border-slate-200 flex items-center gap-3"
                >
                  <Plus className="w-4 h-4 text-rose-500" /> Add Task
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedTasks.slice(0, 4).map((task, idx) => (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-[28px] border transition-all flex flex-col group ${
                    task.completed 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={() => openEditTask(task)}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {task.priority}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); requestTaskCompletionToggle(task.id, task.completed); }}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                        task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 hover:border-indigo-500 bg-white"
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </div>
                  <h4 className={`font-bold text-sm mb-4 line-clamp-2 leading-relaxed ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-auto pt-5 border-t border-slate-50">
                    <CalendarIcon className={`w-3.5 h-3.5 ${task.completed ? 'text-slate-300' : formatDueDate(task.dueDate).color.replace("font-bold", "")}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${task.completed ? 'text-slate-300' : formatDueDate(task.dueDate).color}`}>
                      {formatDueDate(task.dueDate).text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Suggestions Section */}
          <div className="p-8 border-t border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Sparkles strokeWidth={2.5} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-black italic text-slate-900 text-xl tracking-tight">AI Suggestions</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mission Control • Smart Scheduling</p>
                </div>
              </div>
              <button 
                onClick={generateAiSuggestions}
                disabled={isGeneratingSuggestions}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold tracking-tight transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
              >
                {isGeneratingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                {isGeneratingSuggestions ? "Analyzing..." : "Optimize Schedule"}
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiSuggestions.map((suggestion, idx) => (
                  <motion.div 
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-[28px] border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        suggestion.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                        suggestion.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-violet-50 text-violet-600'
                      }`}>
                        {suggestion.type}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {suggestion.duration}M
                      </div>
                    </div>
                    <h4 className="font-bold text-base mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6 flex-1">
                      {suggestion.reason}
                    </p>
                    <button 
                      onClick={() => acceptSuggestion(suggestion)}
                      className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-xs font-bold tracking-tight transition-all border border-slate-100 hover:border-indigo-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Schedule
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
            
            {aiSuggestions.length === 0 && !isGeneratingSuggestions && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm font-medium text-slate-500">Click "Optimize Schedule" to see personalized study recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Reclaim-style Tasks & Habits */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Tasks</h3>
              <div className="flex gap-2">
                <button onClick={prioritizeTasksWithAI} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-indigo-600" title="AI Prioritize">
                  <Sparkles className="w-4 h-4" />
                </button>
                <button onClick={() => setIsTaskModalOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => openEditTask(task)}
                  className={`group p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer ${task.completed ? 'opacity-50 bg-slate-50' : 'bg-white shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); requestTaskCompletionToggle(task.id, task.completed); }}
                      className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                        task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-indigo-500 bg-white"
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-bold truncate ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${formatDueDate(task.dueDate).color}`}>
                          {formatDueDate(task.dueDate).text}
                        </span>
                        <div className={`w-1 h-1 rounded-full ${
                          task.priority === "high" ? "bg-rose-500" : 
                          task.priority === "medium" ? "bg-amber-500" : "bg-slate-300"
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">AI Suggestions</h3>
              <button 
                onClick={generateAiSuggestions}
                disabled={isGeneratingSuggestions}
                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider disabled:opacity-50"
              >
                {isGeneratingSuggestions ? "Analyzing..." : "Refresh"}
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3 group">
                  <div className="flex items-start justify-between">
                    <div className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">
                      {suggestion.type}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{suggestion.duration}m</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">{suggestion.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{suggestion.reason}</p>
                  <button 
                    onClick={() => acceptSuggestion(suggestion)}
                    className="w-full py-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 transition-all shadow-sm"
                  >
                    Schedule Now
                  </button>
                </div>
              ))}
              
              {aiSuggestions.length === 0 && !isGeneratingSuggestions && (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-slate-200" />
                  <p className="text-[10px] font-medium text-slate-400">No suggestions yet.<br/>Click refresh to optimize.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Generator Panel */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiPanelOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 p-8 border-l border-slate-200 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">AI Scheduler</h2>
                </div>
                <button onClick={() => setIsAiPanelOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Study Goals</label>
                  <textarea
                    placeholder="What do you want to achieve this week?"
                    value={aiConfig.studyGoals}
                    onChange={(e) => setAiConfig({...aiConfig, studyGoals: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm resize-none h-24 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Topics</label>
                  <input
                    type="text"
                    placeholder="e.g. Neural Networks, Calculus, Ethics"
                    value={aiConfig.topics}
                    onChange={(e) => setAiConfig({...aiConfig, topics: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Focus Hours</label>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{aiConfig.targetHours}h</span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      step="0.5"
                      value={aiConfig.targetHours}
                      onChange={(e) => setAiConfig({...aiConfig, targetHours: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2">
                      <span>1h</span>
                      <span>4h</span>
                      <span>8h</span>
                      <span>12h</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intensity Protocol</label>
                  <div className="space-y-3">
                    {[
                      { name: "Balanced", desc: "Standard Pomodoro with regular breaks", icon: Zap },
                      { name: "Deep Work", desc: "Longer blocks for complex tasks", icon: Brain },
                      { name: "Sprint", desc: "High intensity, short duration", icon: Target }
                    ].map(p => (
                      <button 
                        key={p.name} 
                        onClick={() => setAiConfig({...aiConfig, intensity: p.name})}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 group transition-all text-left ${aiConfig.intensity === p.name ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-500'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${aiConfig.intensity === p.name ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                          <p.icon className={`w-5 h-5 ${aiConfig.intensity === p.name ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${aiConfig.intensity === p.name ? 'text-indigo-900' : 'text-slate-900'}`}>{p.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learning Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Visual", "Auditory", "Kinesthetic", "Reading/Writing"].map(style => (
                      <button 
                        key={style} 
                        onClick={() => setAiConfig({...aiConfig, learningStyle: style})}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${aiConfig.learningStyle === style ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["MCQ", "Essay", "Practical", "Oral"].map(type => (
                      <button 
                        key={type} 
                        onClick={() => setAiConfig({...aiConfig, examType: type})}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${aiConfig.examType === type ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Algorithm Info</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Our AI uses <strong>CSP (k-consistency)</strong> to ensure valid, conflict-free schedules and an <strong>RL Agent (Q-Learning + Multi-Armed Bandit with GA)</strong> to optimize your study plan based on past performance and goals.
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-4">
                {isGenerating ? (
                  <div className="w-full py-4 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center gap-3 border border-indigo-100">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900 animate-pulse">{generationStep}</span>
                    <div className="w-48 h-1.5 bg-indigo-200 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: "0%" }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: 2.5, ease: "linear" }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileActive={{ scale: 0.98 }}
                      onClick={generateWeeklyPlan}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-tight shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      Generate Weekly Plan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileActive={{ scale: 0.98 }}
                      onClick={handleGenerateAiSchedule}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold tracking-tight shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Optimized Schedule
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEventModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative z-10 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">{selectedEvent ? "Edit Event" : "Create Event"}</h2>
                <button onClick={closeEventModal} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    placeholder="What are you working on?" 
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-medium transition-all outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                    <input 
                      type="time" 
                      value={newSession.startTime}
                      onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-medium transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                    <select 
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-medium transition-all outline-none appearance-none"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1.5 Hours</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Color Label</label>
                  <div className="flex gap-3 pt-1">
                    {["indigo", "emerald", "violet", "amber", "rose", "slate"].map(c => (
                      <button
                        key={c}
                        onClick={() => setNewSession({...newSession, color: c})}
                        className={`w-6 h-6 rounded-full transition-all border-2 ${
                          newSession.color === c ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent'
                        } ${
                          c === "indigo" ? "bg-indigo-500" :
                          c === "emerald" ? "bg-emerald-500" :
                          c === "violet" ? "bg-violet-500" :
                          c === "amber" ? "bg-amber-500" :
                          c === "rose" ? "bg-rose-500" :
                          "bg-slate-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Goal (Optional)</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="e.g. Complete 2 practice problems" 
                      value={newSession.goal}
                      onChange={(e) => setNewSession({...newSession, goal: e.target.value})}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-medium transition-all outline-none" 
                    />
                    {selectedEvent && (
                      <button
                        onClick={() => setNewSession({...newSession, goalAchieved: !newSession.goalAchieved})}
                        className={`px-4 rounded-xl border font-bold text-xs transition-all flex items-center gap-2 ${
                          newSession.goalAchieved 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {newSession.goalAchieved ? "Completed" : "Mark Done"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meeting Integration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["google", "zoom", "teams", "discord", "skype", "other"].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewSession({...newSession, platform: p})}
                        className={`py-2 rounded-xl border text-[10px] font-bold capitalize transition-all ${
                          newSession.platform === p 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="Meeting Link (Zoom, Meet, etc.)" 
                      value={newSession.meetingLink}
                      onChange={(e) => setNewSession({...newSession, meetingLink: e.target.value})}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs font-medium transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedEvent && (
                    <button 
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="px-4 py-2.5 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-all text-sm border border-transparent hover:border-rose-100"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1" />
                  <button onClick={closeEventModal} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm">Cancel</button>
                  <button 
                    onClick={handleCreateSession} 
                    className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
                  >
                    {selectedEvent ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Add Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTaskModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-10 relative z-10 border border-white/20"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-8">{selectedTask ? "Edit Task" : "New Task"}</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Task Title</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Read Chapter 5" 
                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Priority</label>
                  <div className="flex gap-3">
                    {(["low", "medium", "high"] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm capitalize transition-all border ${
                          newTask.priority === p 
                            ? p === "high" ? "bg-rose-50 border-rose-200 text-rose-700" 
                            : p === "medium" ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-100 border-slate-300 text-slate-700"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all text-slate-700" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Reminder</label>
                  <select
                    value={newTask.reminderType}
                    onChange={(e) => setNewTask({ ...newTask, reminderType: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all appearance-none text-slate-700"
                  >
                    <option value="none">None</option>
                    <option value="1_hour">1 hour before</option>
                    <option value="1_day">1 day before</option>
                    <option value="custom">Custom time</option>
                  </select>
                  {newTask.reminderType === 'custom' && (
                    <input
                      type="time"
                      value={newTask.reminderTime}
                      onChange={(e) => setNewTask({ ...newTask, reminderTime: e.target.value })}
                      className="w-full mt-2 px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all text-slate-700"
                    />
                  )}
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={closeTaskModal} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                  <button 
                    onClick={handleAddTask} 
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    {selectedTask ? "Save Changes" : "Add Task"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Completion Confirmation Modal */}
      <AnimatePresence>
        {taskToConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelTaskCompletion}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Complete Task?</h3>
              <p className="text-sm text-slate-500 mb-8">
                Are you sure you want to mark this task as completed?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={cancelTaskCompletion} 
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmTaskCompletion} 
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                >
                  Complete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {activeFocusSession && (
          <FocusMode
            sessionTitle={activeFocusSession.title}
            durationMinutes={activeFocusSession.duration}
            onClose={() => setActiveFocusSession(null)}
            onComplete={(violations) => {
              console.log(`Session completed with ${violations} violations.`);
              setActiveFocusSession(null);
              // Optionally mark event as completed or add points
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
