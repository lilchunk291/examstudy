import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, MessageSquare, Headphones, Zap, ArrowRight, Search, Filter, X, Video, ExternalLink, Globe, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabase";
import { toast } from "sonner";

const MEETING_PLATFORMS = [
  { id: 'google', name: 'Google Meet', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'zoom', name: 'Zoom', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'teams', name: 'Microsoft Teams', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'discord', name: 'Discord', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'skype', name: 'Skype', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'other', name: 'Other', icon: ExternalLink, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export default function SilentRooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dbSchema, setDbSchema] = useState<{ hasMeetingLink: boolean; hasPlatform: boolean }>({ hasMeetingLink: true, hasPlatform: true });
  const [newRoom, setNewRoom] = useState({
    name: "",
    subject: "General",
    max_users: 25,
    is_locked: false,
    meeting_link: "",
    platform: "google"
  });

  useEffect(() => {
    async function fetchRooms() {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('silent_rooms').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data && data.length > 0) {
          setRooms(data);
          // Check schema from first row
          setDbSchema({
            hasMeetingLink: 'meeting_link' in data[0],
            hasPlatform: 'platform' in data[0]
          });
        } else {
          // Fallback initial data if empty
          const initialRooms = [
            { name: "Advanced Calculus Deep Work", subject: "Math", active_users: 12, max_users: 20, is_locked: false },
            { name: "Quiet Library - No Chat", subject: "Focus", active_users: 45, max_users: 100, is_locked: false },
            { name: "Physics Lab Study Group", subject: "Physics", active_users: 8, max_users: 15, is_locked: true },
          ];
          
          // Try to insert with meeting links, if it fails, try without
          const { data: inserted, error: insertError } = await supabase.from('silent_rooms').insert(initialRooms.map(r => ({
            ...r,
            platform: 'google',
            meeting_link: 'https://meet.google.com'
          }))).select();

          if (insertError) {
            // Fallback to basic insert
            const { data: basicInserted } = await supabase.from('silent_rooms').insert(initialRooms).select();
            if (basicInserted) setRooms(basicInserted);
            setDbSchema({ hasMeetingLink: false, hasPlatform: false });
          } else if (inserted) {
            setRooms(inserted);
            setDbSchema({ hasMeetingLink: true, hasPlatform: true });
          }
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Database connection issue. Please check your Supabase setup.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRooms();

    const supabase = getSupabase();
    const roomsSub = supabase
      .channel('public:silent_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'silent_rooms' }, payload => {
        if (payload.eventType === 'INSERT') {
          setRooms(current => [...current, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setRooms(current => current.map(r => r.id === payload.new.id ? payload.new : r));
        } else if (payload.eventType === 'DELETE') {
          setRooms(current => current.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSub);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    try {
      const supabase = getSupabase();
      
      const insertData: any = {
        name: newRoom.name,
        subject: newRoom.subject,
        active_users: 1,
        max_users: newRoom.max_users,
        is_locked: newRoom.is_locked
      };

      // Only include columns if they exist in schema
      if (dbSchema.hasMeetingLink) insertData.meeting_link = newRoom.meeting_link;
      if (dbSchema.hasPlatform) insertData.platform = newRoom.platform;

      const { data, error } = await supabase
        .from('silent_rooms')
        .insert([insertData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        if (error.message.includes("column") && error.message.includes("does not exist")) {
          toast.error("Database schema mismatch. Please update your silent_rooms table.");
        } else {
          toast.error(`Failed to create room: ${error.message}`);
        }
        return;
      }

      toast.success("Room created successfully!");
      setIsCreateModalOpen(false);
      setNewRoom({
        name: "",
        subject: "General",
        max_users: 25,
        is_locked: false,
        meeting_link: "",
        platform: "google"
      });
      
      if (data && data[0]) {
        setRooms(current => [data[0], ...current]);
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error(error.message || "Failed to create room");
    }
  };

  const joinRoom = (room: any) => {
    if (room.meeting_link) {
      window.open(room.meeting_link, '_blank');
      toast.success(`Joining ${room.name}...`);
    } else {
      toast.info("This room has no meeting link attached.");
    }
  };

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
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Silent Rooms</h1>
          <p className="text-muted-foreground font-semibold tracking-tight text-lg max-w-2xl">Focus together, separately. Join thousands of students in deep work sessions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-accent-primary transition-colors" strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Find a room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 pr-8 py-4 bg-card/40 backdrop-blur-3xl border border-border rounded-2xl w-full md:w-[400px] text-base font-bold focus:outline-none focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary transition-all shadow-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-card/40 backdrop-blur-3xl border border-border rounded-2xl text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all shadow-xl"
          >
            <Filter className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-4 bg-accent-primary text-white rounded-2xl text-base font-black tracking-tight shadow-xl shadow-accent-primary/20 transition-all"
          >
            Create Room
          </motion.button>
        </div>
      </motion.div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10 border border-slate-200 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create Silent Room</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Room Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Late Night Calculus" 
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-base font-bold transition-all outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    <select 
                      value={newRoom.subject}
                      onChange={(e) => setNewRoom({...newRoom, subject: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-base font-bold transition-all outline-none appearance-none"
                    >
                      {["General", "Math", "Science", "History", "Coding", "Art", "Focus"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Max Users</label>
                    <input 
                      type="number" 
                      value={newRoom.max_users}
                      onChange={(e) => setNewRoom({...newRoom, max_users: parseInt(e.target.value)})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-base font-bold transition-all outline-none" 
                    />
                  </div>
                </div>

                {!dbSchema.hasMeetingLink && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-900">Database Update Required</p>
                      <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                        Meeting links are currently disabled because the database schema is outdated. 
                        Please add 'meeting_link' and 'platform' columns to your 'silent_rooms' table.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Platform</label>
                  <div className={`grid grid-cols-3 gap-3 ${!dbSchema.hasPlatform ? 'opacity-50 pointer-events-none' : ''}`}>
                    {MEETING_PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setNewRoom({...newRoom, platform: p.id})}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          newRoom.platform === p.id 
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                            : 'border-slate-100 hover:border-indigo-200 bg-white'
                        }`}
                      >
                        <p.icon className={`w-5 h-5 ${p.color}`} />
                        <span className="text-[10px] font-bold text-slate-600">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Link</label>
                  <div className={`relative ${!dbSchema.hasMeetingLink ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://meet.google.com/..." 
                      value={newRoom.meeting_link}
                      onChange={(e) => setNewRoom({...newRoom, meeting_link: e.target.value})}
                      className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-sm font-bold transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="is_locked"
                    checked={newRoom.is_locked}
                    onChange={(e) => setNewRoom({...newRoom, is_locked: e.target.checked})}
                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_locked" className="text-sm font-bold text-slate-700 cursor-pointer">Private Room (Invite Only)</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-base font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateRoom}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-base font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        <AnimatePresence mode="popLayout">
          {filteredRooms.map((room) => (
            <motion.div
              layout
              key={room.id}
              variants={cardVariants}
              whileHover="hover"
              className="group relative bg-card/40 backdrop-blur-3xl border border-border p-8 rounded-3xl shadow-xl overflow-hidden transition-all"
            >
              {/* Background Accent */}
              <div className={`absolute -right-20 -top-20 w-48 h-48 bg-accent-primary/10 blur-3xl rounded-full group-hover:bg-accent-primary/20 transition-all duration-700`} />

              <div className="relative space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight text-foreground leading-tight group-hover:text-accent-primary transition-colors">{room.name}</h3>
                      <div className="flex items-center gap-2">
                        {MEETING_PLATFORMS.find(p => p.id === room.platform)?.icon && (
                          <div className={`p-1 rounded-md ${MEETING_PLATFORMS.find(p => p.id === room.platform)?.bg}`}>
                            {(() => {
                              const PlatformIcon = MEETING_PLATFORMS.find(p => p.id === room.platform)?.icon || Globe;
                              return <PlatformIcon className={`w-3 h-3 ${MEETING_PLATFORMS.find(p => p.id === room.platform)?.color}`} />;
                            })()}
                          </div>
                        )}
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          {MEETING_PLATFORMS.find(p => p.id === room.platform)?.name || 'General'}
                        </span>
                      </div>
                    </div>
                    {room.is_locked && (
                      <div className="p-2 bg-card border border-border rounded-xl">
                        <Lock className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 bg-card/60 rounded-full border border-border text-muted-foreground shadow-sm">
                      {room.subject}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase">Occupancy</span>
                    <span className="text-base font-black text-foreground">{room.active_users}<span className="text-muted-foreground mx-1">/</span>{room.max_users}</span>
                  </div>
                  <div className="h-3 bg-card/60 rounded-full overflow-hidden border border-border p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(room.active_users / room.max_users) * 100}%` }}
                      className={`h-full rounded-full bg-accent-primary shadow-lg shadow-accent-primary/20`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                    <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">High Intensity</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => joinRoom(room)}
                    className="flex items-center gap-3 px-5 py-2.5 bg-card/80 hover:bg-card border border-border rounded-xl text-xs font-black text-foreground transition-all shadow-lg group/btn"
                  >
                    {room.meeting_link ? "Visit Room" : "Join Room"}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
