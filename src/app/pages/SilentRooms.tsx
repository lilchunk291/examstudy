import { motion } from "framer-motion";
import { Users, Lock, MessageSquare, Headphones, Zap, ArrowRight, Search, Filter } from "lucide-react";
import { useState } from "react";

const rooms = [
  {
    id: 1,
    name: "Advanced Calculus Deep Work",
    occupants: 12,
    maxOccupants: 20,
    tags: ["Math", "University"],
    isPrivate: false,
    intensity: "High",
    color: "indigo"
  },
  {
    id: 2,
    name: "Quiet Library - No Chat",
    occupants: 45,
    maxOccupants: 100,
    tags: ["Silent", "Focus"],
    isPrivate: false,
    intensity: "Extreme",
    color: "slate"
  },
  {
    id: 3,
    name: "Physics Lab Study Group",
    occupants: 8,
    maxOccupants: 15,
    tags: ["Physics", "Collaboration"],
    isPrivate: true,
    intensity: "Medium",
    color: "blue"
  },
  {
    id: 4,
    name: "Organic Chemistry Sprint",
    occupants: 24,
    maxOccupants: 30,
    tags: ["Chemistry", "Exam Prep"],
    isPrivate: false,
    intensity: "High",
    color: "emerald"
  },
  {
    id: 5,
    name: "Late Night Coding Session",
    occupants: 15,
    maxOccupants: 25,
    tags: ["CS", "Project"],
    isPrivate: false,
    intensity: "Medium",
    color: "violet"
  },
  {
    id: 6,
    name: "Biology Flashcard Review",
    occupants: 6,
    maxOccupants: 10,
    tags: ["Biology", "Active Recall"],
    isPrivate: true,
    intensity: "Low",
    color: "orange"
  }
];

export default function SilentRooms() {
  const [searchQuery, setSearchQuery] = useState("");

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Silent Rooms</h1>
          <p className="text-slate-500 font-semibold tracking-tight text-lg max-w-2xl">Focus together, separately. Join thousands of students in deep work sessions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Find a room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 pr-8 py-4 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-2xl w-full md:w-[400px] text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-2xl text-slate-600 hover:bg-white/60 transition-all shadow-xl"
          >
            <Filter className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full text-base font-bold tracking-tight shadow-xl shadow-indigo-200 transition-all"
          >
            Create Room
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
      >
        {[
          { label: "Active Students", value: "1,284", icon: Users, color: "text-indigo-600", bg: "bg-indigo-500/10" },
          { label: "Total Rooms", value: "156", icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Deep Focus Hours", value: "4.2k", icon: Headphones, color: "text-emerald-600", bg: "bg-emerald-500/10" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white/40 backdrop-blur-3xl border border-white/20 p-6 rounded-3xl flex items-center gap-6 shadow-xl group transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner border border-white/40 transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Rooms Grid */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10"
      >
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl overflow-hidden transition-all"
          >
            {/* Background Accent */}
            <div className={`absolute -right-20 -top-20 w-48 h-48 bg-${room.color}-500/10 blur-3xl rounded-full group-hover:bg-${room.color}-500/20 transition-all duration-700`} />

            <div className="relative space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                  {room.isPrivate && (
                    <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                      <Lock className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-white/60 rounded-full border border-white/40 text-slate-500 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Occupancy</span>
                  <span className="text-base font-bold text-slate-900">{room.occupants}<span className="text-slate-300 mx-1">/</span>{room.maxOccupants}</span>
                </div>
                <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white/60 p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(room.occupants / room.maxOccupants) * 100}%` }}
                    className={`h-full rounded-full bg-${room.color}-500 shadow-lg shadow-${room.color}-500/20`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${room.color}-500 animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                  <span className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">{room.intensity} Intensity</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white/80 hover:bg-white border border-white/60 rounded-xl text-xs font-bold text-slate-900 transition-all shadow-lg group/btn"
                >
                  Join Room
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
