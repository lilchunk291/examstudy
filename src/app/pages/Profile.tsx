import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette,
  Moon,
  Globe,
  Download,
  Trash2,
  Edit,
  Camera,
  ChevronRight,
  Lock,
  Smartphone,
  Eye,
  Sun,
  Languages
} from "lucide-react";

export default function Profile() {
  const [notifications, setNotifications] = useState([
    { label: "Study Reminders", enabled: true },
    { label: "Break Notifications", enabled: true },
    { label: "Achievement Alerts", enabled: false },
    { label: "Weekly Reports", enabled: true },
    { label: "Crisis Mode Alerts", enabled: true },
  ]);

  const toggleNotification = (index: number) => {
    setNotifications(prev => prev.map((item, i) => 
      i === index ? { ...item, enabled: !item.enabled } : item
    ));
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
    hover: { scale: 1.02, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
  };

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4 relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">Profile</h1>
        <p className="text-slate-500 font-semibold tracking-tight text-lg max-w-3xl leading-relaxed">Manage your account, security, and study preferences across all blocks</p>
      </motion.div>

      {/* Profile Card Bento */}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden group"
      >
        <div className="absolute -right-40 -top-40 w-[800px] h-[800px] bg-indigo-500/10 blur-[160px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-200 group-hover:scale-105 transition-transform duration-700">
              SU
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center transition-all border border-white/60 shadow-lg"
            >
              <Camera className="w-6 h-6" strokeWidth={3} />
            </motion.button>
          </div>
          
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student User</h2>
                <span className="px-4 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-200">
                  Premium
                </span>
              </div>
              <p className="text-slate-500 font-semibold tracking-tight text-lg">student@university.edu</p>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-base font-bold tracking-tight transition-all shadow-xl shadow-indigo-200"
              >
                <Edit className="w-5 h-5" strokeWidth={4} />
                Edit Profile
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/80 border border-white/60 text-slate-900 rounded-full text-base font-bold tracking-tight transition-all hover:bg-white shadow-lg"
              >
                Change Password
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Grid Bento */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10"
      >
        {/* Study Preferences */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-indigo-600" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Study Preferences</h3>
          </div>
          
          <div className="space-y-8">
            {[
              { label: "Processing Style", options: ["Linear", "Relational", "Systemic"] },
              { label: "Learning Type", options: ["Visual", "Auditory", "Kinesthetic", "Omni-Learner"] },
              { label: "Default Session Duration", options: ["25 minutes (Pomodoro)", "45 minutes", "60 minutes", "90 minutes"] }
            ].map((pref, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">{pref.label}</label>
                <div className="relative group/select">
                  <select className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-lg group-hover/select:bg-white/60">
                    {pref.options.map((opt, j) => <option key={j}>{opt}</option>)}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 rotate-90 pointer-events-none group-hover/select:text-indigo-600 transition-colors" strokeWidth={4} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Bell className="w-8 h-8 text-blue-600" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Notifications</h3>
          </div>
          
          <div className="space-y-6">
            {notifications.map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/20 border border-white/40 hover:bg-white/40 transition-all group/toggle shadow-lg">
                <span className="text-lg font-bold text-slate-700 tracking-tight">{setting.label}</span>
                <button
                  onClick={() => toggleNotification(index)}
                  className={`w-16 h-10 rounded-full transition-all relative ${
                    setting.enabled ? "bg-indigo-600 shadow-xl shadow-indigo-200" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: setting.enabled ? 30 : 4 }}
                    className="w-8 h-8 rounded-full bg-white shadow-lg absolute top-1"
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-emerald-600" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Privacy & Security</h3>
          </div>
          
          <div className="grid gap-6">
            {[
              { label: "Two-Factor Authentication", status: "Enabled", icon: Smartphone, color: "emerald" },
              { label: "Connected Accounts", status: "2 connected", icon: Globe, color: "blue" },
              { label: "Privacy Settings", status: "Configure", icon: Eye, color: "indigo" },
              { label: "Data Protection", status: "View Policy", icon: Lock, color: "purple" }
            ].map((item, i) => (
              <motion.button 
                key={i} 
                whileHover={{ x: 10, scale: 1.02 }}
                className="w-full flex items-center justify-between p-5 rounded-xl bg-white/40 border border-white/60 hover:bg-white transition-all group/btn shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <item.icon className="w-6 h-6 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" strokeWidth={3} />
                  <span className="text-lg font-bold tracking-tight text-slate-700 group-hover/btn:text-indigo-900">{item.label}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-lg ${
                  item.status === 'Enabled' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{item.status}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <Palette className="w-8 h-8 text-purple-600" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Appearance</h3>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Theme</label>
              <div className="grid grid-cols-2 gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 rounded-xl bg-white/40 border border-white/60 text-slate-600 hover:bg-white/80 hover:border-indigo-200 transition-all flex flex-col items-center gap-3 group/theme shadow-lg"
                >
                  <Moon className="w-8 h-8 group-hover/theme:text-indigo-600 transition-colors" strokeWidth={3} />
                  <span className="text-lg font-bold tracking-tight">Dark</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 rounded-xl bg-indigo-600 border-4 border-indigo-400 text-white transition-all flex flex-col items-center gap-3 shadow-xl shadow-indigo-200"
                >
                  <Sun className="w-8 h-8" strokeWidth={3} />
                  <span className="text-lg font-bold tracking-tight">Light</span>
                </motion.button>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Language</label>
              <div className="relative group/lang">
                <Languages className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-hover/lang:text-indigo-600 transition-colors" strokeWidth={3} />
                <select className="w-full pl-16 pr-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-lg group-hover/lang:bg-white/60">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 rotate-90 pointer-events-none group-hover/lang:text-indigo-600 transition-colors" strokeWidth={4} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Data Management Bento */}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 relative z-10 group"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner group-hover:scale-110 transition-transform">
            <Download className="w-8 h-8 text-orange-600" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Data Management</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 px-6 py-3 bg-white/80 border border-white/60 hover:bg-white text-slate-900 rounded-full text-base font-bold tracking-tight transition-all shadow-lg"
          >
            <Download className="w-5 h-5" strokeWidth={3} />
            Export Study Data
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 px-6 py-3 bg-white/80 border border-white/60 hover:bg-white text-slate-900 rounded-full text-base font-bold tracking-tight transition-all shadow-lg"
          >
            <Download className="w-5 h-5" strokeWidth={3} />
            Download Analytics
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 px-6 py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-600 rounded-full text-base font-bold tracking-tight transition-all ml-auto shadow-lg"
          >
            <Trash2 className="w-5 h-5" strokeWidth={3} />
            Delete Account
          </motion.button>
        </div>
      </motion.div>

      {/* Account Stats Bento */}
      <motion.div 
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 relative z-10 group"
      >
        <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Study Hours", value: "428", color: "indigo" },
            { label: "Sessions", value: "127", color: "blue" },
            { label: "Day Streak", value: "45", color: "emerald" },
            { label: "Subjects", value: "18", color: "purple" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8, scale: 1.05 }}
              className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-lg group/stat transition-all"
            >
              <div className={`text-3xl font-bold tracking-tight text-${stat.color}-600 mb-4 group-hover/stat:scale-110 transition-transform origin-center`}>{stat.value}</div>
              <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.3em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
