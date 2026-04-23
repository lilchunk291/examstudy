import { 
  Play, 
  TrendingUp, 
  Activity,
  Target,
  Zap,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Headphones,
  Sparkles,
  Calendar as CalendarIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { getSupabase } from "../../lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
  };
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [sessionTime, setSessionTime] = useState(2720); // 45:20 in seconds
  const [isLoading, setIsLoading] = useState(true);

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const xpPerTask = 150;
  const xp = completedTasksCount * xpPerTask;
  const xpToNextLevel = 1000;
  const level = Math.floor(xp / xpToNextLevel) + 1;
  const xpInCurrentLevel = xp % xpToNextLevel;
  const progressToNextLevel = totalTasksCount > 0 ? (xpInCurrentLevel / xpToNextLevel) * 100 : 0;

  useEffect(() => {
    // Timer reduction simulation
    const timer = setInterval(() => {
      setSessionTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const [userName, setUserName] = useState<string>("Username");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : "Username");
        setUserName(name);
        setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
      }
    }
    fetchUser();

    async function fetchTasksAndEvents() {
      try {
        const supabase = getSupabase();
        const [tasksResponse, eventsResponse] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('events').select('*').order('start_time', { ascending: true })
        ]);
        
        if (tasksResponse.error) throw tasksResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;
        
        if (tasksResponse.data) {
          setTasks(tasksResponse.data.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            completed: t.completed,
            dueDate: t.due_date
          })));
        }

        if (eventsResponse.data) {
          setEvents(eventsResponse.data.map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            color: e.color,
            start: new Date(e.start_time),
            duration: e.duration_minutes,
            goal: e.goal,
            goalAchieved: e.goal_achieved
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasksAndEvents();

    const supabase = getSupabase();
    const tasksSubscription = supabase
      .channel('public:tasks:dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        if (payload.eventType === 'INSERT') {
          setTasks(current => {
            if (current.find(t => t.id === payload.new.id)) return current;
            return [...current, {
              id: payload.new.id,
              title: payload.new.title,
              priority: payload.new.priority,
              completed: payload.new.completed,
              dueDate: payload.new.due_date
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTasks(current => current.map(t => t.id === payload.new.id ? {
            id: payload.new.id,
            title: payload.new.title,
            priority: payload.new.priority,
            completed: payload.new.completed,
            dueDate: payload.new.due_date
          } : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(current => current.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const eventsSubscription = supabase
      .channel('public:events:dashboard')
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

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    try {
      const supabase = getSupabase();
      if (!taskId.startsWith('t')) {
        await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', taskId);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: currentStatus } : t));
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="p-8 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 relative z-10"
      >
        <div className="flex items-center gap-6">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h1>
            <p className="text-slate-500 font-semibold tracking-tight text-lg max-w-3xl leading-relaxed">Welcome back, {userName}. Your focus protocol is active and optimized for peak cognitive performance.</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-4 shadow-xl shadow-emerald-500/5 backdrop-blur-xl"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 uppercase">System Optimal</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Top Grid - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        
        {/* Large Card: Current Study Timer */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="lg:col-span-2 bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[500px] group"
        >
          {/* Decorative background element */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-md rounded-full border border-white/40 shadow-lg">
              <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-900 uppercase">Focus Protocol v2.4</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 shadow-lg">
              <Clock strokeWidth={3} className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold tracking-tight">Advanced Calculus</span>
            </div>
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-12">
            {/* Massive high-contrast digits */}
            <h1 className="text-7xl leading-none font-bold text-slate-900 tracking-tight select-none group-hover:scale-105 transition-transform duration-700">
              {formatTime(sessionTime)}
            </h1>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-slate-400 mt-8 bg-white/40 px-8 py-2 rounded-full border border-white/40 shadow-inner">Remaining in Active Study Block</p>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Target strokeWidth={3} className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800 tracking-tight">Active Focus Session</div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">Concentration Protocol</div>
              </div>
            </div>
            
            <motion.button 
              onClick={() => navigate("/app/focus")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-4 px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-lg font-bold tracking-tight transition-all shadow-xl shadow-slate-900/30"
            >
              Enter Deep Focus
              <Play strokeWidth={3} className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column: Two Small Cards */}
        <div className="space-y-12 flex flex-col">
          {/* Gamification & Streaks */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="flex-1 bg-white/40 backdrop-blur-3xl rounded-3xl p-6 border border-white/20 shadow-xl relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all duration-700" />
            
            <div className="relative z-10 space-y-6" id="progress-stats-card">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Zap strokeWidth={3} className="w-8 h-8 text-orange-600 fill-current" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-500/10 px-4 py-1 rounded-full border border-orange-500/20 shadow-lg animate-pulse">
                    <span className="tracking-[0.2em] uppercase">Live Sync</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">Level {level}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                      {level < 5 ? "Novice Protocol" : level < 15 ? "Scholar Protocol" : "Archon Protocol"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600">{xpInCurrentLevel} / {xpToNextLevel} XP</div>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-white/60 p-0.5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNextLevel}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7].slice(0, 4).map(i => (
                  <div key={i} className={`h-1.5 rounded-full ${i <= 3 ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-slate-200"}`} />
                ))}
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-wider">Next Reward: Focus Master Badge</span>
              </div>
            </div>
          </motion.div>

          {/* Silent Rooms Quick Access */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="flex-1 bg-indigo-600 backdrop-blur-3xl rounded-3xl p-6 border border-indigo-500 shadow-xl relative overflow-hidden group cursor-pointer"
            onClick={() => navigate("/app/rooms")}
          >
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                  <Users strokeWidth={3} className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-white bg-white/10 px-4 py-1 rounded-full border border-white/20 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <span className="tracking-[0.2em] uppercase">156 Active</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight leading-none">Silent Rooms</h3>
                <p className="text-indigo-100/60 font-bold tracking-tight text-base">Join a deep focus session with the global community.</p>
              </div>
              
              <div className="flex items-center gap-4 text-white font-bold text-base tracking-tight group-hover:gap-6 transition-all">
                <span>Join Session</span>
                <ArrowRight strokeWidth={4} className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        
        {/* Activity Flow */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="lg:col-span-3 bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl group"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Target strokeWidth={3} className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">Focus Progress</h3>
                <p className="text-base font-medium text-slate-400 tracking-tight">
                  {completedTasksCount} of {totalTasksCount} milestones achieved ({Math.round((completedTasksCount / (totalTasksCount || 1)) * 100)}%)
                </p>
              </div>
            </div>
            <div className="flex bg-white/60 backdrop-blur-md border border-white/60 rounded-full p-2 shadow-lg">
              <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2 text-sm font-bold tracking-tight bg-indigo-600 rounded-full shadow-lg shadow-indigo-100 text-white transition-all">Month</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2 text-sm font-bold tracking-tight text-slate-400 hover:text-slate-900 transition-all">Week</motion.button>
            </div>
          </div>

          {/* Heatmap Mockup - Refined */}
          <div className="space-y-6 mb-12">
            {events.length > 0 ? (
              <div className="flex gap-2 h-16 w-full">
                {events.slice(0, 10).map((event, idx) => {
                  const colorMap: Record<string, string> = {
                    indigo: "bg-indigo-500/20 border-indigo-500/20 hover:bg-indigo-500/40",
                    emerald: "bg-emerald-500/20 border-emerald-500/20 hover:bg-emerald-500/40",
                    violet: "bg-violet-500/20 border-violet-500/20 hover:bg-violet-500/40",
                    amber: "bg-amber-500/20 border-amber-500/20 hover:bg-amber-500/40",
                    rose: "bg-rose-500/20 border-rose-500/20 hover:bg-rose-500/40",
                    slate: "bg-slate-500/20 border-slate-500/20 hover:bg-slate-500/40"
                  };
                  const colorClass = colorMap[event.color] || colorMap.slate;
                  const flexBasis = Math.max(0.5, event.duration / 60); // Scale width by duration

                  return (
                    <motion.div 
                      key={event.id}
                      initial={{ scaleX: 0 }} 
                      animate={{ scaleX: 1 }} 
                      transition={{ delay: 0.5 + idx * 0.1 }} 
                      style={{ flex: flexBasis }}
                      className={`rounded-2xl border shadow-inner transition-colors relative group ${colorClass}`}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {event.title} ({event.duration}m)
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-6 h-16 opacity-50">
                <div className="flex-1 bg-slate-500/10 rounded-2xl border border-slate-500/10" />
                <div className="flex-[2] bg-slate-500/10 rounded-2xl border border-slate-500/10" />
                <div className="flex-1 bg-slate-500/10 rounded-2xl border border-slate-500/10" />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/40">
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { label: "Deep Work", color: "bg-indigo-500" },
                { label: "Sync", color: "bg-emerald-500" },
                { label: "Break", color: "bg-amber-500" }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg`} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] bg-white/40 px-6 py-3 rounded-full border border-white/40 shadow-inner">Protocol Synced 2m Ago</div>
          </div>
        </motion.div>

      </div>

      {/* Third Grid - Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="lg:col-span-3 bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl group"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                <Target strokeWidth={3} className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">Priority Tasks</h3>
                <p className="text-sm font-medium text-slate-400 tracking-tight">Your upcoming deadlines and action items</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/app/schedule")}
              className="px-6 py-2 bg-white/60 hover:bg-white text-slate-900 rounded-full text-sm font-bold tracking-tight transition-all shadow-sm border border-slate-200 flex items-center gap-2"
            >
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedTasks.slice(0, 4).map(task => (
              <div key={task.id} className={`p-5 rounded-2xl border transition-all ${task.completed ? 'bg-slate-50/50 border-slate-100' : 'bg-white/60 border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority} Priority
                  </div>
                  <button 
                    onClick={() => toggleTaskCompletion(task.id, task.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-indigo-500"
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
                <h4 className={`font-bold text-base mb-2 line-clamp-2 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100/50">
                  <CalendarIcon className={`w-4 h-4 ${task.completed ? 'text-slate-300' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${task.completed ? 'text-slate-300' : 'text-slate-500'}`}>
                    Due {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
