import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Database, ExternalLink, Globe, Link2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

type IntegrationItem = {
  id: string;
  name: string;
  desc: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: "emerald" | "indigo" | "rose" | "slate";
  connected: boolean;
};

const integrations: IntegrationItem[] = [
  {
    id: "supabase",
    name: "Supabase DB",
    desc: "Real-time sync of your study data and archives.",
    icon: Database,
    color: "emerald",
    connected: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    desc: "AI core for optimized scheduling and chat support.",
    icon: Sparkles,
    color: "indigo",
    connected: true,
  },
  {
    id: "canvas",
    name: "Canvas LMS",
    desc: "One-way sync of assignments and syllabus.",
    icon: RefreshCw,
    color: "rose",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    desc: "Export study nodes and vault items directly to Notion.",
    icon: Globe,
    color: "slate",
    connected: false,
  },
];

function colorClasses(color: IntegrationItem["color"]) {
  if (color === "emerald") return "bg-emerald-50 border-emerald-100 text-emerald-600";
  if (color === "indigo") return "bg-indigo-50 border-indigo-100 text-indigo-600";
  if (color === "rose") return "bg-rose-50 border-rose-100 text-rose-600";
  return "bg-slate-50 border-slate-100 text-slate-600";
}

export default function IntegrationsSettings() {
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integrations</h1>
        <p className="text-slate-500 font-semibold">Connect external services and manage sync points.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Link2 strokeWidth={3} className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Connected Services</h2>
            <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Your academic stack</p>
          </div>
        </div>

        <div className="grid gap-6">
          {integrations.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/40 border border-white/60 hover:bg-white transition-all shadow-sm group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${colorClasses(item.color)}`}>
                  <item.icon className="w-7 h-7" strokeWidth={2.5} />
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
    </div>
  );
}
