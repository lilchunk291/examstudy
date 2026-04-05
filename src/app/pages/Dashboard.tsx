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
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

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
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };
  
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
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h1>
          <p className="text-slate-500 font-semibold tracking-tight text-lg max-w-3xl leading-relaxed">Welcome back, Julian. Your focus protocol is active and optimized for peak cognitive performance.</p>
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
              45:20
            </h1>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-slate-400 mt-8 bg-white/40 px-8 py-2 rounded-full border border-white/40 shadow-inner">Remaining in Focus Block</p>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5, zIndex: 50 }}
                    className={`w-12 h-12 rounded-full border-4 border-white shadow-lg z-${40-i*10} bg-gradient-to-br from-indigo-${200+i*100} to-purple-${300+i*100} cursor-pointer transition-all`} 
                  />
                ))}
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800 tracking-tight">Collaborating with 3 peers</div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">Silent Room Active</div>
              </div>
            </div>
            
            <motion.button 
              onClick={() => navigate("/focus")}
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
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Zap strokeWidth={3} className="w-8 h-8 text-orange-600 fill-current" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-500/10 px-4 py-1 rounded-full border border-orange-500/20 shadow-lg">
                    <span className="tracking-[0.2em] uppercase">12 Day Streak</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">Level 12</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Scholar Protocol</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600">2,450 / 3,000 XP</div>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-white/60 p-0.5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "81%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full shadow-lg shadow-orange-200" 
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
            onClick={() => navigate("/rooms")}
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
          className="lg:col-span-2 bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl group"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Activity strokeWidth={3} className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">Activity Flow</h3>
                <p className="text-base font-medium text-slate-400 tracking-tight">Visualizing peak focus hours across domains</p>
              </div>
            </div>
            <div className="flex bg-white/60 backdrop-blur-md border border-white/60 rounded-full p-2 shadow-lg">
              <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2 text-sm font-bold tracking-tight bg-indigo-600 rounded-full shadow-lg shadow-indigo-100 text-white transition-all">Month</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2 text-sm font-bold tracking-tight text-slate-400 hover:text-slate-900 transition-all">Week</motion.button>
            </div>
          </div>

          {/* Heatmap Mockup - Refined */}
          <div className="space-y-6 mb-12">
            {[1, 2].map(row => (
              <div key={row} className="flex gap-6 h-16">
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 + row * 0.1 }} className="flex-1 bg-indigo-500/10 rounded-2xl border border-indigo-500/10 shadow-inner hover:bg-indigo-500/20 transition-colors" />
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6 + row * 0.1 }} className="flex-[2] bg-slate-500/5 rounded-2xl border border-slate-500/10 shadow-inner hover:bg-slate-500/10 transition-colors" />
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7 + row * 0.1 }} className="flex-1 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 shadow-inner hover:bg-indigo-500/30 transition-colors" />
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8 + row * 0.1 }} className="flex-[0.5] bg-emerald-500/10 rounded-2xl border border-emerald-500/10 shadow-inner hover:bg-emerald-500/20 transition-colors" />
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9 + row * 0.1 }} className="flex-1 bg-slate-500/5 rounded-2xl border border-slate-500/10 shadow-inner hover:bg-slate-500/10 transition-colors" />
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/40">
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { label: "Computer Science", color: "bg-indigo-500" },
                { label: "Architecture", color: "bg-emerald-500" },
                { label: "Philosophy", color: "bg-slate-400" }
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

        {/* Live Pulse */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute top-10 left-10 text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">Biometric Pulse</div>
          <div className="absolute top-10 right-10">
            <Zap strokeWidth={3} className="w-7 h-7 text-indigo-500 animate-bounce" />
          </div>
          
          <div className="w-40 h-40 rounded-3xl bg-white/80 backdrop-blur-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mb-10 relative border-4 border-white group-hover:scale-110 transition-transform duration-700">
            <div className="absolute inset-0 rounded-3xl border-8 border-indigo-500/20 animate-ping" />
            <Headphones strokeWidth={3} className="w-12 h-12 text-indigo-600" />
          </div>
          
          <div className="text-center space-y-2 mb-10">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Live Sync</h3>
            <p className="text-base font-medium text-slate-400 tracking-tight">StudyRing v2.4 connected</p>
          </div>
          
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between text-xs font-bold tracking-[0.3em] uppercase">
              <span className="text-slate-400">Heart Rate</span>
              <span className="text-indigo-600">72 BPM</span>
            </div>
            <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden border border-white/60 p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "66%" }}
                className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" 
              />
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
