import { motion } from "framer-motion";
import { 
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  Plus,
  Layers,
  Clock,
  Brain,
  FileText,
  MoreVertical,
  ChevronRight,
  Zap,
  Target,
  Sparkles,
  MousePointer2,
  Hand
} from "lucide-react";

export default function Study() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
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
      className="h-full w-full relative flex overflow-hidden max-w-[1600px] mx-auto"
    >
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-transparent p-8">
        {/* Header Overlay */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-8 z-30 space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategy Canvas</h1>
          <p className="text-lg font-semibold text-slate-400 tracking-tight">Visualizing your path to mastery protocol.</p>
        </motion.div>

        {/* Nodes Container */}
        <div className="relative h-full w-full flex items-center justify-center gap-20">
          {/* Node 1 */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="w-[400px] bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-xl relative z-10 group cursor-grab active:cursor-grabbing"
          >
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4 px-5 py-2.5 bg-indigo-500/10 backdrop-blur-3xl rounded-full border border-indigo-500/20 text-indigo-600 shadow-inner">
                <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Core Module v1.0</span>
              </div>
              <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors bg-white/40 rounded-2xl border border-white/40">
                <MoreVertical strokeWidth={2.5} className="w-6 h-6" />
              </button>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4 relative z-10">Calculus III</h3>
            <p className="text-base font-semibold text-slate-500 leading-relaxed mb-8 relative z-10">
              Multi-variable differentiation and integration strategies for engineering applications.
            </p>
            <div className="flex items-center justify-between relative z-10">
              <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-emerald-500/20 shadow-inner">
                Active Session
              </div>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-4 border-white shadow-xl z-${40-i*10} bg-gradient-to-br from-indigo-${200+i*100} to-purple-${300+i*100}`} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Connecting Line (SVG) */}
          <div className="w-48 h-1 bg-gradient-to-r from-indigo-500/40 to-amber-500/40 relative rounded-full">
            <motion.div 
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] border-2 border-indigo-500/20"
            />
          </div>

          {/* Node 2 */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="w-[400px] bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-xl relative z-10 group cursor-grab active:cursor-grabbing"
          >
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4 px-5 py-2.5 bg-amber-500/10 backdrop-blur-3xl rounded-full border border-amber-500/20 text-amber-600 shadow-inner">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Target Objective</span>
              </div>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4 relative z-10">Exam Mastery</h3>
            <p className="text-base font-semibold text-slate-500 leading-relaxed mb-8 relative z-10">
              Final comprehensive review with 95% proficiency target for upcoming finals.
            </p>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
                  <Target strokeWidth={3} className="w-7 h-7 text-amber-600" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">95%</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileActive={{ scale: 0.9 }}
                className="p-4 bg-white/80 hover:bg-white border border-white/60 rounded-2xl transition-all shadow-xl"
              >
                <Sparkles strokeWidth={3} className="w-7 h-7 text-amber-500" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-full p-3 shadow-xl flex items-center gap-8"
        >
          <div className="flex items-center gap-8 px-6 text-slate-400">
            <motion.button whileHover={{ scale: 1.2 }} className="hover:text-slate-900 transition-all"><ZoomOut strokeWidth={2.5} className="w-6 h-6" /></motion.button>
            <span className="text-base font-bold tracking-tight text-slate-900">85%</span>
            <motion.button whileHover={{ scale: 1.2 }} className="hover:text-slate-900 transition-all"><ZoomIn strokeWidth={2.5} className="w-6 h-6" /></motion.button>
            <div className="w-px h-6 bg-white/60" />
            <motion.button whileHover={{ scale: 1.2 }} className="hover:text-slate-900 transition-all"><Maximize strokeWidth={2.5} className="w-6 h-6" /></motion.button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            className="flex items-center gap-4 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold tracking-tight shadow-xl shadow-indigo-200"
          >
            <Play strokeWidth={3} className="w-5 h-5 fill-current" />
            Deploy Strategy
          </motion.button>
        </motion.div>
      </div>

      {/* Right Sidebar - AI Study Tools */}
      <div className="w-[400px] bg-white/10 backdrop-blur-3xl border-l border-white/20 p-8 flex flex-col h-full shadow-[-20px_0_50px_rgba(0,0,0,0.03)] z-20">
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Study Tools</h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Drag components to canvas</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {[
            { icon: Layers, title: "Flashcard Gen", desc: "Transforms lecture notes into active recall flashcard sets automatically.", color: "indigo" },
            { icon: Clock, title: "Schedule Opt", desc: "AI-driven time blocking based on syllabus urgency and personal energy.", color: "emerald" },
            { icon: Brain, title: "Cognitive AI", desc: "Identifies knowledge gaps and complex conceptual clusters.", color: "amber" },
            { icon: FileText, title: "Source Scraper", desc: "Extracts key theorems and formulas from PDF or video inputs.", color: "slate" }
          ].map((tool, i) => (
            <motion.div 
              key={i}
              whileHover={{ x: -10, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-3xl rounded-3xl p-6 shadow-xl border border-white/20 cursor-grab hover:border-indigo-500/40 transition-all group relative overflow-hidden"
            >
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${tool.color}-500/5 blur-[60px] rounded-full pointer-events-none`} />
              <div className="flex items-center gap-6 mb-6 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-${tool.color}-500/10 flex items-center justify-center border border-${tool.color}-500/20 group-hover:bg-${tool.color}-500/20 transition-all shadow-inner`}>
                  <tool.icon strokeWidth={2.5} className={`w-6 h-6 text-${tool.color}-600`} />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-slate-900">{tool.title}</h4>
              </div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed relative z-10">
                {tool.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 mt-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            className="w-full py-4 bg-white/60 hover:bg-white/80 backdrop-blur-3xl border border-white/40 text-slate-900 rounded-2xl font-bold transition-all flex items-center justify-center gap-4 shadow-xl"
          >
            <Plus strokeWidth={3} className="w-5 h-5" />
            New Tool
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
