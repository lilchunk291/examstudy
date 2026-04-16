import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Database, 
  CreditCard,
  LogOut,
  Brain,
  Sparkles,
  Link2,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Camera,
  Trash2,
  Settings as SettingsIcon,
  Smartphone,
  Lock,
  Eye,
  Sun,
  Languages
} from "lucide-react";

export default function Settings() {
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
    <div className="p-8 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 relative z-10"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight drop-shadow-sm">Settings</h1>
        <p className="text-lg font-semibold text-slate-500 tracking-tight max-w-3xl leading-relaxed">Manage your account preferences, AI assistant, and integrations</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
        {/* Navigation Sidebar Bento */}
        <motion.div 
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-1 space-y-8"
        >
          <div className="bg-white/40 backdrop-blur-3xl rounded-3xl p-5 border border-white/20 shadow-xl space-y-4">
            {[
              { label: "Profile", icon: User, active: true },
              { label: "AI Assistant", icon: Brain },
              { label: "Notifications", icon: Bell },
              { label: "Privacy & Security", icon: Shield },
              { label: "Integrations", icon: Link2 },
              { label: "Theme", icon: Sparkles, to: "/app/theme" },
              { label: "Billing", icon: CreditCard },
            ].map((item, i) => (
              <motion.button 
                key={i}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => item.to && (window.location.href = item.to)}
                className={`w-full flex items-center gap-6 px-6 py-3 rounded-2xl text-sm font-bold tracking-tight transition-all group ${
                  item.active 
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200" 
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-6 h-6 ${item.active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} strokeWidth={2.5} />
                {item.label}
              </motion.button>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-6 px-8 py-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold tracking-tight hover:bg-rose-500 hover:text-white transition-all group shadow-sm"
          >
            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" strokeWidth={3} />
            Sign Out
          </motion.button>
        </motion.div>

        {/* Content Area Bento */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="lg:col-span-3 space-y-12"
        >
          {/* Profile Section Bento */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 relative overflow-hidden group"
          >
            <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <h2 className="text-xl font-bold tracking-tight text-slate-900 relative z-10">Profile Information</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-200">
                  JD
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center transition-all border border-white/60 shadow-2xl"
                >
                  <Camera className="w-6 h-6" strokeWidth={2.5} />
                </motion.button>
              </div>
              <div className="space-y-6 text-center md:text-left">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/80 border border-white/60 text-slate-900 rounded-full text-sm font-bold tracking-tight transition-all hover:bg-white shadow-xl"
                >
                  Change Avatar
                </motion.button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid gap-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">First Name</label>
                  <input 
                    type="text" 
                    defaultValue="John"
                    className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white/60"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue="Doe"
                    className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white/60"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="john.doe@example.com"
                  className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white/60"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Bio</label>
                <textarea 
                  rows={4}
                  defaultValue="Computer Science student passionate about AI and machine learning."
                  className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none shadow-sm group-hover:bg-white/60"
                />
              </div>
            </div>

            <div className="flex justify-end pt-10 relative z-10">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-base font-bold tracking-tight shadow-xl shadow-indigo-200 transition-all"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>

          {/* Preferences Section Bento */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
          >
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Preferences</h2>
            
            <div className="grid gap-8">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20 shadow-inner">
                    <Moon className="w-7 h-7 text-slate-600" strokeWidth={2} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold tracking-tight text-slate-900">Dark Mode</div>
                    <div className="text-sm font-bold text-slate-500 tracking-tight">Adjust the application appearance</div>
                  </div>
                </div>
                <button className="w-16 h-9 rounded-full bg-slate-200 relative transition-all">
                  <motion.div className="w-7 h-7 rounded-full bg-white shadow-md absolute top-1 left-1" />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20 shadow-inner">
                    <Globe className="w-7 h-7 text-slate-600" strokeWidth={2} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold tracking-tight text-slate-900">Language</div>
                    <div className="text-sm font-bold text-slate-500 tracking-tight">Select your preferred language</div>
                  </div>
                </div>
                <div className="relative group">
                  <select className="px-6 py-3 bg-white/80 border border-white/60 rounded-full text-sm font-bold tracking-tight focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer appearance-none shadow-sm">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                  </select>
                  <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 rotate-90 pointer-events-none" strokeWidth={3} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Integrations Section Bento */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">LMS Integrations</h2>
              <p className="text-slate-500 font-semibold tracking-tight text-sm">Automatically sync assignments and schedules from your university.</p>
            </div>
            
            <div className="grid gap-8">
              {[
                { name: "Canvas LMS", initial: "C", color: "rose", connected: true, sync: "2h ago" },
                { name: "Moodle", initial: "M", color: "orange", connected: false },
                { name: "Blackboard", initial: "Bb", color: "slate", connected: false }
              ].map((lms, i) => (
                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border transition-all shadow-sm ${
                  lms.connected ? "bg-indigo-600/5 border-indigo-600/20" : "bg-white/40 border-white/60"
                }`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-xl ${
                      lms.color === 'rose' ? 'bg-rose-500' : lms.color === 'orange' ? 'bg-orange-500' : 'bg-slate-900'
                    }`}>
                      {lms.initial}
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-bold tracking-tight text-slate-900">{lms.name}</div>
                      {lms.connected ? (
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                          Connected • Synced {lms.sync}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Not connected</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-8 md:mt-0">
                    {lms.connected && (
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 bg-white/80 border border-white/60 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-xl"
                      >
                        <RefreshCw className="w-7 h-7" strokeWidth={2.5} />
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 rounded-full text-sm font-bold tracking-tight transition-all shadow-xl ${
                        lms.connected 
                          ? "bg-white/80 border border-white/60 text-slate-900 hover:bg-white" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                      }`}
                    >
                      {lms.connected ? "Configure" : "Connect"}
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone Bento */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-rose-500/5 backdrop-blur-3xl rounded-3xl p-8 border border-rose-500/20 shadow-xl space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-rose-600">Danger Zone</h2>
              <p className="text-rose-700/60 font-semibold tracking-tight text-sm">Irreversible and destructive actions</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 gap-8 shadow-sm">
              <div className="space-y-2">
                <div className="text-lg font-bold tracking-tight text-rose-900">Delete Account</div>
                <div className="text-sm font-bold text-rose-700/80 tracking-tight">Permanently delete your account and all study data</div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold tracking-tight shadow-xl shadow-rose-200 transition-all"
              >
                Delete Account
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
