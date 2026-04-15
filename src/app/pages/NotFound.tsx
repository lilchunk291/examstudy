import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-center max-w-2xl bg-white/40 backdrop-blur-3xl p-10 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full" />

        <motion.div 
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200 relative z-10"
        >
          <AlertTriangle className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">404</h1>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lost in the Vault?</h2>
            <p className="text-slate-500 font-semibold tracking-tight text-sm max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a different sector.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold tracking-tight transition-all shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              <Home className="w-5 h-5" strokeWidth={2.5} />
              Back to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/80 border border-white/60 text-slate-900 rounded-full font-bold tracking-tight transition-all hover:bg-white shadow-lg hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
