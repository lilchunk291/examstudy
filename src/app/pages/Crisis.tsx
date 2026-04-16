import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  Target,
  Coffee,
  Brain,
  CheckCircle2,
  Zap,
  ChevronRight,
  Sparkles,
  Download,
  Moon
} from "lucide-react";

const intensiveSessions = [
  { time: "08:00 - 10:00", task: "Practice Papers - High Yield Topics", type: "practice", priority: "critical" },
  { time: "10:15 - 10:30", task: "Power Nap (Recovery)", type: "break", priority: "mandatory" },
  { time: "10:30 - 12:30", task: "Weak Topics Review - Focus Areas", type: "review", priority: "critical" },
  { time: "12:30 - 13:00", task: "Lunch Break", type: "break", priority: "mandatory" },
  { time: "13:00 - 15:00", task: "Quick Recall - Flashcards & Formulas", type: "recall", priority: "high" },
  { time: "15:00 - 15:15", task: "Power Nap (Recovery)", type: "break", priority: "mandatory" },
  { time: "15:15 - 17:15", task: "Mock Test - Timed Practice", type: "practice", priority: "critical" },
  { time: "17:15 - 18:00", task: "Dinner Break", type: "break", priority: "mandatory" },
  { time: "18:00 - 20:00", task: "Last Minute Review - Key Concepts", type: "review", priority: "high" },
  { time: "20:00 - 22:00", task: "Light Review & Sleep Preparation", type: "light", priority: "low" },
  { time: "22:00", task: "Sleep (Mandatory)", type: "sleep", priority: "mandatory" },
];

const priorityColors: Record<string, string> = {
  critical: "border-l-rose-500 bg-rose-50/50",
  high: "border-l-orange-500 bg-orange-50/50",
  mandatory: "border-l-blue-500 bg-blue-50/50",
  low: "border-l-emerald-500 bg-emerald-50/50",
};

export default function Crisis() {
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
    hover: { scale: 1.02, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rose-500/5 blur-[200px] animate-pulse pointer-events-none" />

      {/* Header / Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-rose-500/10 backdrop-blur-3xl rounded-3xl p-8 border border-rose-500/20 shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-3 h-full bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-200 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-rose-900">Crisis Mode Active</h1>
              <p className="text-rose-700/80 font-semibold tracking-tight text-lg">
                Emergency exam preparation protocol engaged. Optimizing remaining time for maximum retention.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4 bg-white/40 px-5 py-2.5 rounded-xl border border-white/40 shadow-sm">
                <Clock className="w-6 h-6 text-rose-600" strokeWidth={3} />
                <span className="text-sm font-bold text-rose-900 uppercase tracking-tight">Calculus Final in <span className="text-xl ml-2">72h</span></span>
              </div>
              <div className="flex items-center gap-4 bg-white/40 px-5 py-2.5 rounded-xl border border-white/40 shadow-sm">
                <Target className="w-6 h-6 text-rose-600" strokeWidth={3} />
                <span className="text-sm font-bold text-rose-900 uppercase tracking-tight">Target Score: <span className="text-xl ml-2">85%+</span></span>
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-base font-bold tracking-tight shadow-xl shadow-rose-200 transition-all"
          >
            Deactivate Protocol
          </motion.button>
        </div>
      </motion.div>

      {/* Crisis Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {[
          { label: "Time Remaining", value: "72h", sub: "Until exam", icon: Clock, color: "rose" },
          { label: "Topics to Cover", value: "12", sub: "8 completed", icon: Target, color: "orange" },
          { label: "Intensive Hours", value: "14h", sub: "Per day", icon: Brain, color: "indigo" },
          { label: "Predicted Score", value: "87%", sub: "AI forecast", icon: Zap, color: "blue" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl border border-white/20 p-6 rounded-3xl shadow-xl relative overflow-hidden group"
          >
            <div className={`absolute -right-8 -top-8 w-24 h-24 bg-${stat.color}-500/10 blur-3xl rounded-full group-hover:bg-${stat.color}-500/20 transition-all`} />
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20 shadow-inner`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} strokeWidth={2.5} />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-tight">{stat.label}</div>
            </div>
            <div className="space-y-2 relative z-10">
              <div className={`text-3xl font-bold tracking-tight ${stat.color === 'rose' ? 'text-rose-600' : stat.color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'}`}>{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Emergency Protocol Info Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "High-Intensity Learning", desc: "Focus on high-yield topics using active recall and practice testing. Prioritize weak areas identified by AI analysis.", icon: Brain, color: "indigo" },
          { title: "Mandatory Recovery", desc: "Regular power naps (15 min) every 2 hours to maintain cognitive performance. Sleep 7-8 hours the night before exam.", icon: Coffee, color: "blue" },
          { title: "Performance Tracking", desc: "AI monitors your progress in real-time. Schedule adjusts dynamically based on practice test results and retention rates.", icon: CheckCircle2, color: "emerald" }
        ].map((protocol, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-2 h-full bg-${protocol.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.1)]`}></div>
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-${protocol.color}-500/10 flex items-center justify-center border border-${protocol.color}-500/20 shadow-inner`}>
                <protocol.icon className={`w-6 h-6 text-${protocol.color}-600`} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{protocol.title}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed tracking-tight relative z-10">
              {protocol.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Intensive Schedule Bento */}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="bg-white/40 backdrop-blur-3xl border border-white/20 p-12 rounded-[40px] shadow-2xl space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Hour-by-Hour Intensive Schedule</h3>
            <p className="text-slate-500 font-semibold tracking-tight text-sm">Optimized for maximum retention and performance</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white/80 border border-white/60 text-slate-900 rounded-full text-sm font-bold tracking-tight flex items-center gap-4 hover:bg-white transition-all shadow-lg"
          >
            <Download className="w-5 h-5" strokeWidth={2.5} />
            Download PDF
          </motion.button>
        </div>

        <div className="grid gap-6">
          {intensiveSessions.map((session, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 15 }}
              className={`rounded-3xl p-5 border border-white/40 shadow-lg transition-all flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden ${priorityColors[session.priority]}`}
            >
              <div className="text-sm font-bold text-slate-500 w-32 tracking-tight uppercase">{session.time}</div>
              <div className="flex-1 space-y-4">
                <div className="text-lg font-bold tracking-tight text-slate-900">{session.task}</div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm ${
                    session.type === "practice" ? "bg-rose-500 text-white" :
                    session.type === "review" ? "bg-orange-500 text-white" :
                    session.type === "recall" ? "bg-indigo-500 text-white" :
                    session.type === "break" ? "bg-blue-500 text-white" :
                    session.type === "sleep" ? "bg-slate-900 text-white" :
                    "bg-emerald-500 text-white"
                  }`}>
                    {session.type}
                  </span>
                  <span className={`px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] border border-white/40 ${
                    session.priority === "critical" ? "text-rose-600" :
                    session.priority === "high" ? "text-orange-600" :
                    session.priority === "mandatory" ? "text-blue-600" :
                    "text-emerald-600"
                  }`}>
                    {session.priority}
                  </span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 border border-white/60 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-lg"
              >
                <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Resources Bento */}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl space-y-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">Quick Access Resources</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Key Formulas", count: 24, color: "indigo" },
            { label: "Practice Problems", count: 156, color: "blue" },
            { label: "Summary Notes", count: 12, color: "emerald" },
            { label: "Flashcards", count: 89, color: "orange" },
          ].map((resource, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -15, scale: 1.02 }}
              className="p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all text-left group shadow-xl"
            >
              <div className={`text-3xl font-bold tracking-tight text-slate-900 mb-4 group-hover:text-${resource.color}-600 transition-colors`}>{resource.count}</div>
              <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.3em]">{resource.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
