import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, addHours, startOfDay } from "date-fns";

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
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Review Calculus Notes", priority: "high", completed: false },
    { id: "t2", title: "Submit Bio Assignment", priority: "medium", completed: true },
    { id: "t3", title: "Read Ethics Chapter 4", priority: "low", completed: false },
  ]);

  // Calendar logic
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const handleGenerateAiSchedule = () => {
    setIsGenerating(true);
    // Simulate AI generation logic from SPEC.md (Q-Learning / Genetic Algorithms)
    setTimeout(() => {
      const newAiEvents = [
        { id: "ai-1", title: "AI Optimized: Ethics", type: "Deep Work", color: "amber", start: new Date(2026, 8, 18, 10, 0), duration: 120, icon: Sparkles },
        { id: "ai-2", title: "AI Optimized: Lab", type: "Deep Work", color: "rose", start: new Date(2026, 8, 18, 14, 0), duration: 180, icon: Sparkles },
      ];
      setEvents([...events, ...newAiEvents]);
      setIsGenerating(false);
      setIsAiPanelOpen(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col font-sans text-slate-900">
      {/* Notion-style Toolbar */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex items-center ml-4 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-1 hover:bg-white rounded-md transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold hover:bg-white rounded-md transition-all">Today</button>
              <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1 hover:bg-white rounded-md transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />
          
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1 text-xs font-bold capitalize rounded-md transition-all ${
                  view === v ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-sm transition-all w-48 focus:w-64"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileActive={{ scale: 0.98 }}
            onClick={() => setIsAiPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileActive={{ scale: 0.98 }}
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Mini Calendar & Calendars */}
        <div className="w-64 border-r border-slate-200 bg-slate-50/50 p-6 space-y-8 overflow-y-auto hidden xl:block">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mini Calendar</h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map(d => (
                <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <button 
                  key={i} 
                  className={`text-xs font-bold p-1.5 rounded-lg transition-all ${
                    i + 1 === currentDate.getDate() ? "bg-indigo-600 text-white" : "hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">My Calendars</h3>
            <div className="space-y-2">
              {[
                { name: "Academic Protocol", color: "bg-indigo-500", active: true },
                { name: "LMS Sync: Canvas", color: "bg-emerald-500", active: true },
                { name: "AI Recommendations", color: "bg-amber-500", active: false },
                { name: "Personal", color: "bg-slate-400", active: true }
              ].map(cal => (
                <label key={cal.name} className="flex items-center gap-3 p-2 hover:bg-slate-200 rounded-xl cursor-pointer transition-all">
                  <input type="checkbox" checked={cal.active} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" readOnly />
                  <div className={`w-2 h-2 rounded-full ${cal.color}`} />
                  <span className="text-sm font-bold text-slate-700">{cal.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
              Your cognitive load is high on Wednesday. Consider moving "Ethics" to Thursday morning.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tasks & Priorities</h3>
              <button className="p-1 hover:bg-slate-200 rounded-md transition-all">
                <Plus className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <button 
                    onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-indigo-500"
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <span className={`text-xs font-bold flex-1 truncate ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                    {task.title}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === "high" ? "bg-rose-500" : 
                    task.priority === "medium" ? "bg-amber-500" : "bg-slate-300"
                  }`} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sync Options</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "LMS", icon: LayoutGrid },
                { name: "Google", icon: CalendarIcon },
                { name: "Outlook", icon: Clock },
                { name: "Notion", icon: Target },
              ].map(sync => (
                <button key={sync.name} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 hover:shadow-sm transition-all group">
                  <sync.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-500">{sync.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Grid Header */}
            <div className="flex border-b border-slate-200 sticky top-0 bg-white z-20">
              <div className="w-20 border-r border-slate-200" />
              {weekDays.map((day, i) => (
                <div key={i} className={`flex-1 p-4 text-center border-r border-slate-100 last:border-r-0 ${isSameDay(day, new Date()) ? "bg-indigo-50/30" : ""}`}>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isSameDay(day, new Date()) ? "text-indigo-600" : "text-slate-400"}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-2xl font-bold tracking-tight inline-flex items-center justify-center w-10 h-10 rounded-full ${
                    isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-900"
                  }`}>
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="relative flex">
              {/* Time Labels */}
              <div className="w-20 flex-shrink-0 bg-slate-50/50">
                {hours.map(hour => (
                  <div key={hour} className="h-24 border-b border-slate-100 p-2 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 flex relative">
                {weekDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="flex-1 border-r border-slate-100 last:border-r-0 relative">
                    {hours.map(hour => (
                      <div key={hour} className="h-24 border-b border-slate-100" />
                    ))}
                    
                    {/* Events for this day */}
                    {events
                      .filter(e => isSameDay(e.start, day))
                      .map(event => {
                        const startHour = event.start.getHours() + event.start.getMinutes() / 60;
                        const top = (startHour - 8) * 96; // 96px per hour
                        const height = (event.duration / 60) * 96;
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02, zIndex: 10 }}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            className={`absolute left-1 right-1 rounded-xl border p-3 shadow-sm cursor-pointer overflow-hidden group transition-all ${
                              event.color === "indigo" ? "bg-indigo-50 border-indigo-200 text-indigo-900" :
                              event.color === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                              event.color === "violet" ? "bg-violet-50 border-violet-200 text-violet-900" :
                              event.color === "amber" ? "bg-amber-50 border-amber-200 text-amber-900" :
                              event.color === "rose" ? "bg-rose-50 border-rose-200 text-rose-900" :
                              "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-black truncate leading-tight mb-1">{event.title}</div>
                                <div className="text-[10px] font-bold opacity-60 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(event.start, "HH:mm")} - {format(addHours(event.start, event.duration/60), "HH:mm")}
                                </div>
                              </div>
                              <event.icon className="w-4 h-4 opacity-40 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ))}

                {/* Current Time Indicator */}
                <div className="absolute left-0 right-0 border-t-2 border-rose-500 z-10 pointer-events-none" style={{ top: '300px' }}>
                  <div className="w-3 h-3 bg-rose-500 rounded-full -ml-1.5 -mt-1.5 shadow-lg" />
                </div>
              </div>
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
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Focus Hours</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[4, 6, 8].map(h => (
                      <button key={h} className="py-3 rounded-xl border border-slate-200 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all">{h}h</button>
                    ))}
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
                      <button key={p.name} className="w-full p-4 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-indigo-500 group transition-all text-left">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-all">
                          <p.icon className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.desc}</div>
                        </div>
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
                    Our Q-Learning agent analyzes your past performance to find your peak cognitive windows.
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileActive={{ scale: 0.98 }}
                  onClick={handleGenerateAiSchedule}
                  disabled={isGenerating}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold tracking-tight shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Optimizing Protocol...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Optimized Schedule
                    </>
                  )}
                </motion.button>
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
              onClick={() => setIsManualModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-10 relative z-10 border border-white/20"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-8">New Study Session</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Session Title</label>
                  <input type="text" placeholder="e.g. Quantum Physics Review" className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Start Time</label>
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Duration</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl font-bold transition-all appearance-none">
                      <option>60 Minutes</option>
                      <option>90 Minutes</option>
                      <option>120 Minutes</option>
                      <option>180 Minutes</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setIsManualModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                  <button onClick={() => setIsManualModalOpen(false)} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all">Create Session</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
