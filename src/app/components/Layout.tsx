import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Users,
  BarChart3, 
  AlertTriangle, 
  User,
  Lock,
  Search,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  Zap,
  Menu,
  Moon,
  Sun,
  Target
} from "lucide-react";
import FloatingAI from "./FloatingAI";
import { getSupabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/study-plan", icon: Target, label: "Study Plan" },
  { to: "/app/rooms", icon: Users, label: "Silent Rooms" },
  { to: "/app/chat", icon: MessageSquare, label: "AI Assistant" },
  { to: "/app/vault", icon: Lock, label: "Knowledge Vault" },
  { to: "/app/schedule", icon: Calendar, label: "Schedule" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [userName, setUserName] = useState<string>("Username");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : "Username");
      setUserName(name);
      setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
    }
  }, [user]);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const supabase = getSupabase();
      
      // Fetch Stats
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);
      
      const xpPerTask = 150;
      const totalXp = (count || 0) * xpPerTask;
      const level = Math.floor(totalXp / 1000) + 1;
      const currentLevelXp = totalXp % 1000;
      
      setUserStats({ level, xp: currentLevelXp });
    }
    
    if (user) {
      fetchStats();
    }

    // Subscribe to task changes to update XP in real-time
    const supabase = getSupabase();
    const channel = supabase
      .channel('header-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async (e: any) => {
    e.stopPropagation();
    await signOut();
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex font-sans relative transition-colors duration-300">
      {/* Neo Glassmorphism Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[30%] right-[30%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 256 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-card/30 backdrop-blur-3xl border-r border-border z-20 shadow-2xl overflow-hidden flex-shrink-0"
      >
        <div className="w-64 flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/app")}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                <Sparkles className="text-white w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="font-black text-xl tracking-tighter text-foreground">StudyVault</span>
            </motion.div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3 h-3 text-emerald-600" strokeWidth={3} />
              <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Vault Secured</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === "/app" 
                ? location.pathname === "/app" || location.pathname === "/app/"
                : location.pathname.startsWith(item.to);
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 group relative ${
                    isActive
                      ? "bg-card/60 text-accent-primary font-black shadow-lg border border-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/40 font-bold border border-transparent"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-card/60 rounded-2xl -z-10 shadow-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-accent-primary" : "text-muted-foreground group-hover:text-accent-primary"}`} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-5">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-3 rounded-3xl bg-card/40 border border-border shadow-lg backdrop-blur-3xl hover:bg-card/60 transition-all cursor-pointer group"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-xl border-2 border-border shadow-lg flex-shrink-0 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 border-2 border-border shadow-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black truncate text-foreground tracking-tight">{userName}</div>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] truncate">Active Session</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut strokeWidth={2.5} className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navigation Bar */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="h-20 flex items-center justify-between px-8 bg-card/10 backdrop-blur-3xl border-b border-border"
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-muted-foreground hover:text-accent-primary hover:bg-card/60 rounded-xl transition-all shadow-sm border border-transparent hover:border-border"
              title="Toggle Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-64 group">
              <Search strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent-primary transition-colors" />
              <input
                type="text"
                placeholder="Search knowledge protocol..."
                className="w-full pl-12 pr-6 py-3.5 bg-card/60 backdrop-blur-3xl border border-border rounded-full text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary/30 shadow-xl transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 bg-card/60 backdrop-blur-3xl border border-border rounded-2xl shadow-lg">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Level {userStats.level}</span>
                <span className="text-sm font-black text-accent-primary tracking-tight">{userStats.xp} XP</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                <Zap className="text-white w-5 h-5 fill-current" strokeWidth={2.5} />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/app/vault")}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-card/60 backdrop-blur-3xl border border-border text-muted-foreground hover:bg-card hover:text-accent-primary transition-all shadow-lg"
            >
              <Lock strokeWidth={2.5} className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-card/60 backdrop-blur-3xl border border-border text-muted-foreground hover:bg-card hover:text-accent-primary transition-all shadow-lg relative"
            >
              <Bell strokeWidth={2.5} className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-background rounded-full" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-card/60 backdrop-blur-3xl border border-border text-muted-foreground hover:bg-card hover:text-accent-primary transition-all shadow-lg"
            >
              {theme === "dark" ? (
                <Sun strokeWidth={2.5} className="w-5 h-5" />
              ) : (
                <Moon strokeWidth={2.5} className="w-5 h-5" />
              )}
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/app/settings")}
              className="w-12 h-12 rounded-xl border-2 border-border shadow-lg cursor-pointer hover:shadow-accent-primary/20 transition-all overflow-hidden" 
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
              )}
            </motion.div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-8 pb-8 pt-6 custom-scrollbar">
          <Outlet />
        </main>
        
        {/* Footer Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-8 text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase pointer-events-none z-0">
          <span className="hover:text-accent-primary transition-colors pointer-events-auto cursor-pointer">© 2026 StudyVault</span>
          <span className="hover:text-accent-primary transition-colors pointer-events-auto cursor-pointer">Resources</span>
          <span className="hover:text-accent-primary transition-colors pointer-events-auto cursor-pointer">Privacy</span>
          <span className="hover:text-accent-primary transition-colors pointer-events-auto cursor-pointer">Security</span>
        </div>
        <FloatingAI />
      </div>
    </div>
  );
}
