import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Smartphone, Shield, ArrowRight, Key, QrCode } from "lucide-react";
import { useNavigate } from "react-router";

export default function Login() {
  const [mode, setMode] = useState<"login" | "pair">("login");
  const navigate = useNavigate();

  const handleLogin = (e: any) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[160px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-12">
        {/* Logo/Header */}
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-white/40 backdrop-blur-3xl rounded-3xl shadow-xl border border-white/20 flex items-center justify-center mx-auto group hover:scale-110 transition-transform duration-700"
          >
            <Shield strokeWidth={3} className="w-12 h-12 text-indigo-600" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none drop-shadow-sm">StudyVault</h1>
            <p className="text-xl font-bold text-slate-400 tracking-tight uppercase tracking-[0.4em]">Privacy-First AI Academic Scheduler</p>
          </div>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 shadow-xl border border-white/20 relative overflow-hidden group"
        >
          <div className="absolute -right-40 -top-40 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
          
          {/* Tabs */}
          <div className="flex p-2 bg-white/30 backdrop-blur-md rounded-full mb-8 border border-white/40 shadow-inner relative z-10">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-500 ${
                mode === "login"
                  ? "bg-white text-indigo-600 shadow-xl scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Master Password
            </button>
            <button
              onClick={() => setMode("pair")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-500 ${
                mode === "pair"
                  ? "bg-white text-indigo-600 shadow-xl scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Device Pairing
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-10 relative z-10">
              <div className="space-y-6">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">
                  Master Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                    <Key strokeWidth={3} className="h-8 w-8 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-16 pr-8 py-4 border border-white/60 rounded-full bg-white/50 backdrop-blur-md text-lg font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl"
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                <div className="flex items-center gap-4 px-5 py-2.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 w-fit">
                  <Lock strokeWidth={4} className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.1em]">AES-256 Client-Side Encryption Active</span>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -5 }}
                whileActive={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-6 py-4 px-8 border border-transparent rounded-full shadow-xl text-lg font-bold uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
              >
                Decrypt & Login
                <ArrowRight strokeWidth={4} className="w-6 h-6" />
              </motion.button>
            </form>
          ) : (
            <div className="space-y-10 text-center relative z-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/80 p-6 rounded-3xl border border-white/60 inline-block shadow-xl group/qr"
              >
                <QrCode strokeWidth={1} className="w-48 h-48 text-slate-800 group-hover/qr:scale-105 transition-transform duration-700" />
              </motion.div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Pair New Device</h3>
                <p className="text-lg font-bold text-slate-400 leading-relaxed max-w-lg mx-auto tracking-tight">
                  Scan this QR code with your primary device to securely transfer your encryption keys. Data never leaves your devices in plaintext.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 shadow-xl">
                <Smartphone strokeWidth={3} className="w-8 h-8 animate-bounce" />
                Waiting for connection...
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-400"
        >
          <p>Local Source of Truth • Offline-First • Zero-Knowledge</p>
        </motion.div>
      </div>
    </div>
  );
}
