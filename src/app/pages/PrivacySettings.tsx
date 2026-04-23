import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Smartphone } from "lucide-react";
import { getSupabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [aiFeedbackLoops, setAiFeedbackLoops] = useState(false);

  const sendResetLink = async () => {
    try {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("You need to be signed in to request a reset link.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy & Security</h1>
        <p className="text-slate-500 font-semibold">Manage account protection and data visibility preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
      >
        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 space-y-6">
          <h3 className="text-base font-black uppercase tracking-widest text-slate-800">Account Access</h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-slate-100">
            <div className="flex items-center gap-6">
              <Lock className="w-8 h-8 text-indigo-600" />
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-900">Change Password</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">Send a reset link to your email</div>
              </div>
            </div>
            <button
              onClick={sendResetLink}
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

        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 space-y-4">
          <h3 className="text-base font-black uppercase tracking-widest text-slate-800">Data Visibility</h3>

          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/60 transition-all">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">Profile Visibility</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Allow other users to see your study progress in Silent Rooms.
              </div>
            </div>
            <button
              onClick={() => setProfileVisibility((prev) => !prev)}
              className={`w-12 h-6 rounded-full relative transition-all ${profileVisibility ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 ${profileVisibility ? "right-1" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/60 transition-all">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">AI Feedback Loops</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Send anonymized usage data to help improve recommendation quality.
              </div>
            </div>
            <button
              onClick={() => setAiFeedbackLoops((prev) => !prev)}
              className={`w-12 h-6 rounded-full relative transition-all ${aiFeedbackLoops ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 ${aiFeedbackLoops ? "right-1" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-700" />
          <p className="text-xs font-semibold text-emerald-800">All security controls on this page use the same protections as your core account settings.</p>
        </div>
      </motion.div>
    </div>
  );
}
