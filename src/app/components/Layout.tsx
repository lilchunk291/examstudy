import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
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
  Zap
} from "lucide-react";
import FloatingAI from "./FloatingAI";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/study", icon: BookOpen, label: "Study Plan" },
  { to: "/rooms", icon: Users, label: "Silent Rooms" },
  { to: "/chat", icon: MessageSquare, label: "AI Assistant" },
  { to: "/vault", icon: Lock, label: "Knowledge Vault" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/focus", icon: Zap, label: "Deep Session" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#F3F0FF] via-[#FFFFFF] to-[#FFF5F0] text-slate-900 overflow-hidden flex font-sans relative">
      {/* Neo Glassmorphism Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#D0BCFF] opacity-20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FFE6D9] opacity-20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[30%] right-[30%] w-[40%] h-[40%] rounded-full bg-[#E8DEF8] opacity-30 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-64 flex flex-col bg-white/10 backdrop-blur-3xl border-r border-white/20 z-20 shadow-2xl"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">StudyVault</span>
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
            const isActive = item.to === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.to);
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 group relative ${
                  isActive
                    ? "bg-white/60 text-indigo-600 font-black shadow-lg shadow-indigo-100 border border-white/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/40 font-bold border border-transparent"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white/60 rounded-2xl -z-10 shadow-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileActive={{ scale: 0.98 }}
            className="flex items-center gap-4 p-3 rounded-3xl bg-white/40 border border-white/50 shadow-lg backdrop-blur-3xl hover:bg-white/60 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 border-2 border-white shadow-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black truncate text-slate-800 tracking-tight">Julian Voss</div>
              <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] truncate">Premium Protocol</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate("/login");
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut strokeWidth={2.5} className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navigation Bar */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="h-20 flex items-center justify-between px-8 bg-white/10 backdrop-blur-3xl border-b border-white/20"
        >
          <div className="flex items-center gap-6">
            <div className="relative w-64 group">
              <Search strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search knowledge protocol..."
                className="w-full pl-12 pr-6 py-3.5 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-full text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 shadow-xl transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-lg">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level 12</span>
                <span className="text-sm font-black text-indigo-600 tracking-tight">2,450 XP</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Zap className="text-white w-5 h-5 fill-current" strokeWidth={2.5} />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileActive={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-3xl border border-white/60 text-slate-500 hover:bg-white hover:text-indigo-600 transition-all shadow-lg"
            >
              <Lock strokeWidth={2.5} className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileActive={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-3xl border border-white/60 text-slate-500 hover:bg-white hover:text-indigo-600 transition-all shadow-lg relative"
            >
              <Bell strokeWidth={2.5} className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileActive={{ scale: 0.9 }}
              onClick={() => navigate("/login")}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-lg cursor-pointer hover:shadow-indigo-200 transition-all" 
            />
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-8 pb-8 pt-6 custom-scrollbar">
          <Outlet />
        </main>
        
        {/* Footer Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-8 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase pointer-events-none z-0">
          <span className="hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer">© 2026 StudyVault Protocol</span>
          <span className="hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer">Manifesto</span>
          <span className="hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer">Quantum Encryption</span>
          <span className="hover:text-indigo-600 transition-colors pointer-events-auto cursor-pointer">Privacy Protocol</span>
        </div>
        <FloatingAI />
      </div>
    </div>
  );
}
