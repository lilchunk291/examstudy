import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Database, 
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
  Languages,
  Save,
  Loader2,
  Mail,
  Zap,
  Info,
  ExternalLink
} from "lucide-react";
import { getSupabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type ActiveTab = "profile" | "ai" | "notifications" | "privacy" | "integrations";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    learning_style: "Visual",
    avatar_url: ""
  });

  const [aiSettings, setAiSettings] = useState({
    improveResponses: true,
    suggestTopics: true,
    voiceEnabled: false,
    autoFocus: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    pushStudyReminders: true,
    emailWeeklyReport: false,
    roomInvites: true,
    backlogAlerts: true
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = getSupabase();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate("/login");
          return;
        }
        
        setUser(authUser);

        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            bio: data.bio || "",
            learning_style: data.learning_style || "Visual",
            avatar_url: data.avatar_url || ""
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("student_profiles")
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          bio: profile.bio,
          learning_style: profile.learning_style,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast.error("Error signing out");
    }
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
    hover: { scale: 1.01, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

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
              { id: "profile", label: "Profile", icon: User },
              { id: "ai", label: "AI Assistant", icon: Brain },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "privacy", label: "Privacy & Security", icon: Shield },
              { id: "integrations", label: "Integrations", icon: Link2 },
              { id: "theme", label: "Theme", icon: Sparkles, to: "/app/theme" },
            ].map((item, i) => (
              <motion.button 
                key={i}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.to) {
                    navigate(item.to);
                  } else {
                    setActiveTab(item.id as ActiveTab);
                  }
                }}
                className={`w-full flex items-center gap-6 px-6 py-3 rounded-2xl text-sm font-bold tracking-tight transition-all group ${
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200" 
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} strokeWidth={2.5} />
                {item.label}
              </motion.button>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
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
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Profile Section Bento */}
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8 relative overflow-hidden group"
                >
                  <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
                  
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 relative z-10">Profile Information</h2>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-200">
                        {profile.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center transition-all border border-white/60 shadow-2xl"
                      >
                        <Camera className="w-6 h-6" strokeWidth={2.5} />
                      </motion.button>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Avatar Identity</p>
                      <p className="text-sm font-semibold text-slate-600">Avatars are currently linked to your study network identity.</p>
                      <div className="flex gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-tight shadow-lg"
                        >
                          Upload New
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-2 bg-white/60 border border-white/80 text-slate-900 rounded-full text-xs font-bold tracking-tight"
                        >
                          Remove
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-8 relative z-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        placeholder="Your full name"
                        className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Email Address (Read-only)</label>
                      <div className="w-full px-6 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-base font-bold text-slate-400 cursor-not-allowed flex items-center gap-3">
                        <Mail className="w-5 h-5" />
                        {user?.email}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Learning Style Protocol</label>
                      <select 
                        value={profile.learning_style}
                        onChange={(e) => setProfile({...profile, learning_style: e.target.value})}
                        className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm outline-none appearance-none"
                      >
                        <option>Visual</option>
                        <option>Auditory</option>
                        <option>Kinesthetic</option>
                        <option>Reading/Writing</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-4">Profile Bio</label>
                      <textarea 
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        placeholder="Tell the study network about your academic mission..."
                        className="w-full px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-10 relative z-10">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSaving}
                      onClick={handleSaveProfile}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-base font-bold tracking-tight shadow-xl shadow-indigo-200 transition-all flex items-center gap-3"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSaving ? "Syncing..." : "Save Profile"}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div 
                  variants={cardVariants}
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
                      onClick={() => toast.error("Account deletion is restricted in preview mode.")}
                      className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold tracking-tight shadow-xl shadow-rose-200 transition-all flex items-center gap-3"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
                      <Brain strokeWidth={3} className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">AI Assistant Configuration</h2>
                      <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Calibrate your cognitive companion</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { id: 'improveResponses', label: "Adaptive Insights", desc: "Allow AI to learn from your study patterns to provide better advice.", icon: Zap },
                      { id: 'suggestTopics', label: "Proactive Suggestions", desc: "AI will periodically suggest study topics based on your syllabus.", icon: Sparkles },
                      { id: 'voiceEnabled', label: "Multimodal Voice", desc: "Enable text-to-speech for AI architect interactions.", icon: Bell },
                      { id: 'autoFocus', label: "Auto Focus Mode", desc: "AI automatically enters focus mode when starting a deep work session.", icon: Eye }
                    ].map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                            <setting.icon className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" strokeWidth={2} />
                          </div>
                          <div className="space-y-1">
                            <div className="text-base font-bold tracking-tight text-slate-900">{setting.label}</div>
                            <div className="text-xs font-bold text-slate-500 tracking-tight">{setting.desc}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAiSettings(prev => ({ ...prev, [setting.id]: !prev[setting.id as keyof typeof aiSettings] }))}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${aiSettings[setting.id as keyof typeof aiSettings] ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                          <motion.div 
                            animate={{ x: aiSettings[setting.id as keyof typeof aiSettings] ? 28 : 4 }}
                            className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1" 
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-amber-900">Cognitive Privacy Note</span>
                    </div>
                    <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                      AI preferences are synced across your devices using encrypted metadata. Your learning data is never shared with third parties.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                      <Bell strokeWidth={3} className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Communication Channels</h2>
                      <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Manage how you stay in the loop</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { id: 'pushStudyReminders', label: "Push Study Reminders", desc: "Browser notifications for upcoming study sessions.", icon: Bell },
                      { id: 'emailWeeklyReport', label: "Email Weekly Insights", desc: "Receive your productivity performance report every Monday.", icon: Mail },
                      { id: 'roomInvites', label: "Silent Room Invites", desc: "Allow friends to invite you to deep work rooms.", icon: Globe },
                      { id: 'backlogAlerts', label: "Backlog Critical State", desc: "Alerts when arrears clearance targets are at risk.", icon: Zap }
                    ].map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <setting.icon className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" strokeWidth={2} />
                          </div>
                          <div className="space-y-1">
                            <div className="text-base font-bold tracking-tight text-slate-900">{setting.label}</div>
                            <div className="text-xs font-bold text-slate-500 tracking-tight">{setting.desc}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setNotificationSettings(prev => ({ ...prev, [setting.id]: !prev[setting.id as keyof typeof notificationSettings] }))}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${notificationSettings[setting.id as keyof typeof notificationSettings] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <motion.div 
                            animate={{ x: notificationSettings[setting.id as keyof typeof notificationSettings] ? 28 : 4 }}
                            className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1" 
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                      <Shield strokeWidth={3} className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Security & Privacy</h2>
                      <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Protect your data and access</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="p-6 rounded-3xl bg-white/40 border border-white/60 space-y-6">
                      <h3 className="text-base font-black uppercase tracking-widest text-slate-800">Account Access</h3>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-slate-100">
                        <div className="flex items-center gap-6">
                          <Lock className="w-8 h-8 text-indigo-600" />
                          <div className="space-y-1">
                            <div className="text-base font-bold text-slate-900">Change Password</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">Send a reset link to {user?.email}</div>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              const supabase = getSupabase();
                              const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                              });
                              if (error) throw error;
                              toast.success("Password reset link sent to your email!");
                            } catch (error: any) {
                              toast.error(error.message || "Failed to send reset link");
                            }
                          }}
                          className="px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold tracking-tight hover:bg-slate-800 transition-all"
                        >
                          Send Reset Link
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-slate-100">
                        <div className="flex items-center gap-6">
                          <Smartphone className="w-8 h-8 text-emerald-600" />
                          <div className="space-y-1">
                            <div className="text-base font-bold text-slate-900">Two-Factor Authentication</div>
                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Enabled via Email</div>
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-white border border-slate-200 text-slate-900 rounded-full text-xs font-bold tracking-tight hover:bg-slate-50 transition-all">
                          Manage 2FA
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/40 border border-white/60 space-y-6">
                      <h3 className="text-base font-black uppercase tracking-widest text-slate-800">Data Visibility</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Profile Visibility", desc: "Allow other users to see your study progress in Silent Rooms.", initial: true },
                          { label: "AI Feedback Loops", desc: "Send anonymized usage data to help us build better models.", initial: false }
                        ].map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/60 transition-all">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-slate-900">{p.label}</div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{p.desc}</div>
                            </div>
                            <button className="w-12 h-6 rounded-full bg-emerald-500 relative transition-all">
                               <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 right-1" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "integrations" && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                      <Link2 strokeWidth={3} className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Ecosystem Integrations</h2>
                      <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Connect your academic stack</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { id: 'supabase', name: "Supabase DB", desc: "Real-time sync of your study data and archives.", icon: Database, color: "emerald", connected: true },
                      { id: 'gemini', name: "Google Gemini", desc: "AI core for optimized scheduling and chat help.", icon: Sparkles, color: "indigo", connected: true },
                      { id: 'canvas', name: "Canvas LMS", desc: "One-way sync of assignments and syllabus.", icon: RefreshCw, color: "rose", connected: false },
                      { id: 'notion', name: "Notion", desc: "Export study nodes and vault items directly to Notion.", icon: Globe, color: "slate", connected: false }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/40 border border-white/60 hover:bg-white transition-all shadow-sm group">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 ${
                            item.color === 'emerald' ? 'bg-emerald-50 border-emerald-100' :
                            item.color === 'indigo' ? 'bg-indigo-50 border-indigo-100' :
                            item.color === 'rose' ? 'bg-rose-50 border-rose-100' :
                            'bg-slate-50 border-slate-100'
                          }`}>
                            <item.icon className={`w-7 h-7 ${
                              item.color === 'emerald' ? 'text-emerald-600' :
                              item.color === 'indigo' ? 'text-indigo-600' :
                              item.color === 'rose' ? 'text-rose-600' :
                              'text-slate-600'
                            }`} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="text-lg font-black tracking-tight text-slate-900">{item.name}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">{item.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           {item.connected ? (
                             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                               <CheckCircle2 className="w-4 h-4" />
                               Active
                             </div>
                           ) : (
                             <button 
                               onClick={() => toast.info(`Connecting to ${item.name} service...`)}
                               className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-tight hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                             >
                               Connect
                             </button>
                           )}
                           <button 
                             onClick={() => toast.info(`Opening ${item.name} dashboard...`)}
                             className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                           >
                              <ExternalLink className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
