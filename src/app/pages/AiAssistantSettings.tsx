import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, Info, Sparkles, Zap, Bell } from "lucide-react";

type AiSettingsState = {
  improveResponses: boolean;
  suggestTopics: boolean;
  voiceEnabled: boolean;
  autoFocus: boolean;
};

export default function AiAssistantSettings() {
  const [aiSettings, setAiSettings] = useState<AiSettingsState>({
    improveResponses: true,
    suggestTopics: true,
    voiceEnabled: false,
    autoFocus: true,
  });

  const settings = [
    {
      id: "improveResponses" as const,
      label: "Adaptive Insights",
      desc: "Allow AI to learn from your study patterns to provide better advice.",
      icon: Zap,
    },
    {
      id: "suggestTopics" as const,
      label: "Proactive Suggestions",
      desc: "AI will periodically suggest study topics based on your syllabus.",
      icon: Sparkles,
    },
    {
      id: "voiceEnabled" as const,
      label: "Multimodal Voice",
      desc: "Enable text-to-speech for AI assistant interactions.",
      icon: Bell,
    },
    {
      id: "autoFocus" as const,
      label: "Auto Focus Mode",
      desc: "AI automatically enters focus mode when starting a deep work session.",
      icon: Eye,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Assistant Settings</h1>
        <p className="text-slate-500 font-semibold">Configure how your assistant supports your study flow.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain strokeWidth={3} className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Assistant Preferences</h2>
            <p className="text-sm font-bold text-slate-400 tracking-tight uppercase">Personalize behavior</p>
          </div>
        </div>

        <div className="grid gap-6">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <setting.icon className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold tracking-tight text-slate-900">{setting.label}</div>
                  <div className="text-xs font-bold text-slate-500 tracking-tight">{setting.desc}</div>
                </div>
              </div>
              <button
                onClick={() =>
                  setAiSettings((prev) => ({
                    ...prev,
                    [setting.id]: !prev[setting.id],
                  }))
                }
                className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${
                  aiSettings[setting.id] ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <motion.div
                  animate={{ x: aiSettings[setting.id] ? 28 : 4 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1"
                />
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-900">Privacy Note</span>
          </div>
          <p className="text-xs text-amber-800 font-semibold leading-relaxed">
            AI preferences are synced across your devices using encrypted metadata.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
