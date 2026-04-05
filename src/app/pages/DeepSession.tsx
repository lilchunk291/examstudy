import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  Settings, 
  Volume2, 
  Shield, 
  Lock, 
  Zap,
  Music,
  Wind,
  CloudRain,
  Moon
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export default function Focus() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(45 * 60 + 20); // 45:20 to match ref
  const [isFinished, setIsFinished] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((t) => t - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      scale: 1.01, 
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

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10"
      >
        <div className="flex items-center gap-12">
          <motion.button 
            whileHover={{ scale: 1.1, x: -10 }}
            whileActive={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/40 backdrop-blur-3xl border border-white/20 text-slate-500 hover:text-slate-900 transition-all shadow-xl"
          >
            <ArrowLeft strokeWidth={4} className="w-7 h-7" />
          </motion.button>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight drop-shadow-sm">Deep Focus</h1>
            <p className="text-base font-semibold text-slate-400 tracking-tight max-w-3xl leading-relaxed">Session: Advanced Calculus • Block 2 of 4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileActive={{ scale: 0.95 }}
            className="flex items-center gap-6 px-6 py-3 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-full text-sm font-bold uppercase tracking-widest text-slate-600 hover:bg-white/60 transition-all shadow-xl"
          >
            <Settings strokeWidth={4} className="w-6 h-6" />
            Settings
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileActive={{ scale: 0.95 }}
            className="flex items-center gap-6 px-6 py-3 bg-rose-500 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200"
          >
            End Session
          </motion.button>
        </div>
      </motion.div>

      {/* Main Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 flex-1 relative z-10">
        {/* Timer Card - The Hero */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="lg:col-span-2 bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] group"
        >
          {/* Ambient light effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full bg-indigo-500/10 blur-[200px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000" />
          
          <div className="relative z-10 text-center w-full space-y-20">
            <div className="inline-flex items-center gap-8 px-10 py-5 bg-indigo-500/10 backdrop-blur-3xl rounded-full border border-indigo-500/20 text-indigo-600 shadow-inner">
              <Zap strokeWidth={4} className="w-8 h-8 animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-widest">High Intensity Protocol Active</span>
            </div>
            
            <div className="relative inline-block">
              <motion.h2 
                key={time}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl leading-none font-bold text-slate-900 tracking-tight drop-shadow-2xl select-none tabular-nums group-hover:scale-105 transition-transform duration-700"
              >
                {formatTime(time)}
              </motion.h2>
              <div className="absolute -right-32 top-1/2 -translate-y-1/2 flex flex-col gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-6 h-6 rounded-full transition-all duration-700 ${i === 1 ? "bg-indigo-600 shadow-[0_0_60px_rgba(79,70,229,0.8)] scale-150" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>
            
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 select-none">Minutes Remaining in Block</p>
            
            <div className="flex items-center justify-center gap-16">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                whileActive={{ scale: 0.9 }}
                onClick={() => setIsActive(!isActive)}
                className={`w-40 h-40 flex items-center justify-center rounded-full shadow-2xl transition-all group ${isActive ? "bg-white/80 backdrop-blur-3xl border-8 border-white text-slate-900" : "bg-slate-900 text-white"}`}
              >
                {isActive ? (
                  <Pause strokeWidth={4} className="w-14 h-14 fill-current" />
                ) : (
                  <Play strokeWidth={4} className="w-14 h-14 fill-current ml-4" />
                )}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileActive={{ scale: 0.9 }}
                onClick={() => setTime(45 * 60 + 20)}
                className="w-28 h-28 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-3xl border border-white/40 text-slate-400 hover:text-slate-900 shadow-2xl transition-all"
              >
                <RotateCcw strokeWidth={4} className="w-10 h-10" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-16">
          {/* Ambient Sound Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-2xl flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Music strokeWidth={4} className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ambient</h3>
              </div>
              <Volume2 strokeWidth={4} className="w-6 h-6 text-slate-400" />
            </div>
            
            <div className="space-y-6 flex-1">
              {[
                { name: 'Lofi Beats', icon: Music },
                { name: 'Rainforest', icon: CloudRain },
                { name: 'White Noise', icon: Wind },
                { name: 'Deep Space', icon: Moon }
              ].map((sound, i) => (
                <motion.button 
                  key={sound.name}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${
                    i === 0 
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-200" 
                      : "bg-white/40 text-slate-600 border-white/40 hover:bg-white/60 shadow-lg"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner ${
                      i === 0 ? "bg-white/20 border-white/20" : "bg-slate-500/10 border-slate-500/20"
                    }`}>
                      <sound.icon strokeWidth={4} className={`w-4 h-4 ${i === 0 ? "text-white" : "text-slate-400"}`} />
                    </div>
                    <span className="text-base font-bold tracking-tight">{sound.name}</span>
                  </div>
                  {i === 0 && (
                    <div className="flex gap-2">
                      {[1, 2, 3].map(j => (
                        <motion.div 
                          key={j}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                          className="w-1 bg-white rounded-full" 
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            
            <div className="space-y-10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 px-2">
                <span>Volume Intensity</span>
                <span className="text-indigo-600">65%</span>
              </div>
              <div className="w-full h-6 bg-white/60 rounded-full overflow-hidden border border-white/60 p-2 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-indigo-600 rounded-full shadow-2xl shadow-indigo-200" 
                />
              </div>
            </div>
          </motion.div>

          {/* Distraction Blocker */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-2xl flex-1 flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Shield strokeWidth={4} className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Shield</h3>
              </div>
              <Lock strokeWidth={4} className="w-6 h-6 text-slate-400" />
            </div>
            
            <div className="flex items-center gap-6 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-3xl shadow-xl flex items-center justify-center border border-white/60 group-hover:rotate-12 transition-transform">
                <Lock strokeWidth={4} className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-slate-900 tracking-tight">Active</div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">12 Apps Blocked</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/40 rounded-2xl border border-white/40 shadow-xl group-hover:bg-white/60 transition-all">
                <div className="space-y-2">
                  <span className="text-base font-bold text-slate-900 tracking-tight">Strict Mode</span>
                  <p className="text-sm font-bold text-slate-400 tracking-tight leading-relaxed">No exit until block ends</p>
                </div>
                <div className="w-16 h-10 bg-emerald-500 rounded-full relative p-1.5 cursor-pointer shadow-inner">
                  <div className="absolute right-1.5 top-1.5 w-7 h-7 bg-white rounded-full shadow-2xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Session Complete Modal */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-12 max-w-2xl w-full shadow-2xl border border-white/20 relative overflow-hidden text-center space-y-12"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200">
                <Zap className="text-white w-12 h-12 fill-current" strokeWidth={2.5} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Protocol Complete</h2>
                <p className="text-lg font-bold text-slate-400 tracking-tight">You've successfully completed the High Intensity Block.</p>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-black text-indigo-600">45m</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Focused</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-black text-emerald-600">+120</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">XP Gained</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-black text-orange-600">98%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Efficiency</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileActive={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-lg font-black tracking-tight shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Return to Dashboard
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileActive={{ scale: 0.98 }}
                  onClick={() => {
                    setIsFinished(false);
                    setTime(45 * 60);
                  }}
                  className="w-full py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-lg font-black tracking-tight hover:bg-slate-50 transition-all"
                >
                  Start New Block
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
