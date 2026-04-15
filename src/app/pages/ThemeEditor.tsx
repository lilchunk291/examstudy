import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Palette, Sun, Moon, Monitor, Check, Paintbrush } from "lucide-react";

const ACCENT_COLORS = [
  { name: "Indigo", value: "indigo", hex: "#4f46e5" },
  { name: "Rose", value: "rose", hex: "#e11d48" },
  { name: "Emerald", value: "emerald", hex: "#10b981" },
  { name: "Amber", value: "amber", hex: "#f59e0b" },
  { name: "Sky", value: "sky", hex: "#0ea5e9" },
  { name: "Violet", value: "violet", hex: "#7c3aed" },
];

export default function ThemeEditor() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState("indigo");

  useEffect(() => {
    setMounted(true);
    const savedAccentValue = localStorage.getItem("theme-accent") || "indigo";
    const savedAccent = ACCENT_COLORS.find(c => c.value === savedAccentValue) || ACCENT_COLORS[0];
    setAccent(savedAccentValue);
    
    // Apply saved accent on mount
    document.documentElement.style.setProperty('--accent-primary', savedAccent.hex);
    document.documentElement.style.setProperty('--accent-soft', `${savedAccent.hex}1a`);
    document.documentElement.style.setProperty('--primary', savedAccent.hex);
    document.documentElement.style.setProperty('--ring', savedAccent.hex);
  }, []);

  const handleAccentChange = (color: { name: string, value: string, hex: string }) => {
    setAccent(color.value);
    localStorage.setItem("theme-accent", color.value);
    
    // Update CSS variables dynamically
    document.documentElement.style.setProperty('--accent-primary', color.hex);
    document.documentElement.style.setProperty('--accent-soft', `${color.hex}1a`);
    document.documentElement.style.setProperty('--primary', color.hex);
    document.documentElement.style.setProperty('--ring', color.hex);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
          <Palette strokeWidth={2.5} className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Theme Editor</h1>
          <p className="text-slate-500 font-medium tracking-tight">Customize your StudyVault experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            Appearance
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "light", icon: Sun, label: "Light" },
              { id: "dark", icon: Moon, label: "Dark" },
              { id: "system", icon: Monitor, label: "System" },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    isActive 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md" 
                      : "border-white/60 bg-white/40 hover:border-indigo-300 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                  <span className={`text-sm font-bold ${isActive ? "text-indigo-900" : "text-slate-600"}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Accent Color Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-indigo-600" />
            Accent Color
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            {ACCENT_COLORS.map((color) => {
              const isActive = accent === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => handleAccentChange(color)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    isActive 
                      ? "border-accent-primary bg-accent-soft shadow-md" 
                      : "border-border bg-card/40 hover:border-accent-primary/50 hover:bg-card/60"
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Preview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/40 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-xl"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Preview</h2>
        
        <div className="p-6 rounded-2xl border border-white/40 bg-white/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Sample Card</h3>
              <p className="text-sm text-slate-500">This is how your UI components will look.</p>
            </div>
            <button 
              className="px-6 py-2 rounded-xl text-white font-bold shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: ACCENT_COLORS.find(c => c.value === accent)?.hex }}
            >
              Action Button
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full w-2/3 rounded-full"
                style={{ backgroundColor: ACCENT_COLORS.find(c => c.value === accent)?.hex }}
              />
            </div>
            <div className="flex gap-2">
              <span 
                className="px-3 py-1 text-xs font-bold rounded-full"
                style={{ 
                  backgroundColor: `${ACCENT_COLORS.find(c => c.value === accent)?.hex}20`,
                  color: ACCENT_COLORS.find(c => c.value === accent)?.hex 
                }}
              >
                Active Tag
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-200/50 text-slate-600">
                Inactive Tag
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
