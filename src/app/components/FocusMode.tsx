import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, AlertTriangle, ShieldAlert, CheckCircle2, Volume2, VolumeX, Music, CloudRain, Coffee, Waves, Trees } from "lucide-react";

interface FocusModeProps {
  sessionTitle: string;
  durationMinutes: number;
  onClose: () => void;
  onComplete: (violations: number) => void;
}

const AMBIENT_SOUNDS = [
  { id: "rain", name: "Rain", icon: CloudRain, url: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3" },
  { id: "cafe", name: "Cafe", icon: Coffee, url: "https://assets.mixkit.co/sfx/preview/mixkit-restaurant-ambience-loop-2462.mp3" },
  { id: "ocean", name: "Ocean", icon: Waves, url: "https://assets.mixkit.co/sfx/preview/mixkit-waves-crashing-on-shore-loop-1195.mp3" },
  { id: "forest", name: "Forest", icon: Trees, url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3" },
];

export default function FocusMode({ sessionTitle, durationMinutes, onClose, onComplete }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  // Audio state
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request fullscreen on mount
  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }
    
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0 && !isFailed) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFailed) {
      setIsActive(false);
      onComplete(violations);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isFailed, onComplete, violations]);

  // Visibility change listener (Distraction Blocker)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isFailed) {
        // User switched tabs or minimized the window
        if (strictMode) {
          setIsFailed(true);
          setIsActive(false);
        } else {
          setViolations((prev) => prev + 1);
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, isFailed, strictMode]);

  // Audio volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio management effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let isMounted = true;

    const handleAudioState = async () => {
      if (!selectedSound || !isActive || isFailed) {
        audio.pause();
        return;
      }

      try {
        // Only update src if it changed to avoid interrupting playback
        if (audio.src !== selectedSound) {
          audio.src = selectedSound;
          audio.loop = true;
          audio.load();
        }
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error: any) {
        // Ignore AbortError as it's expected when pausing/switching quickly
        if (isMounted && error.name !== 'AbortError') {
          console.warn("Audio play failed:", error.message);
        }
      }
    };

    handleAudioState();

    return () => {
      isMounted = false;
      audio.pause();
    };
  }, [selectedSound, isActive, isFailed]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleGiveUp = () => {
    if (window.confirm("Are you sure you want to end this focus session early?")) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center font-sans overflow-hidden">
      <audio ref={audioRef} />
      {/* Distraction Warning Overlay */}
      <AnimatePresence>
        {showWarning && !isFailed && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-10 bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
          >
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Distraction Detected!</h3>
              <p className="text-rose-100 text-sm">Please stay on this page to maintain focus.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <ShieldAlert className={`w-5 h-5 ${strictMode ? "text-rose-500" : "text-amber-500"}`} />
          <span className="text-sm font-bold text-slate-300">
            {strictMode ? "Strict Mode ON" : "Lenient Mode"}
          </span>
        </div>
        <button 
          onClick={() => setStrictMode(!strictMode)}
          className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors"
        >
          Toggle
        </button>
      </div>

      <button 
        onClick={handleGiveUp}
        className="absolute top-8 right-8 p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all border border-slate-800 text-slate-400 hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {isFailed ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/50">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-white">Session Failed</h2>
          <p className="text-slate-400 mb-8 text-lg">
            You left the focus window while Strict Mode was active. Focus requires discipline.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all text-lg"
          >
            Return to Schedule
          </button>
        </motion.div>
      ) : timeLeft === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/50">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-white">Session Complete!</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Great job! You stayed focused for {durationMinutes} minutes with {violations} distractions.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all text-lg shadow-lg shadow-emerald-500/20"
          >
            Claim Reward & Continue
          </button>
        </motion.div>
      ) : (
        <div className="text-center flex flex-col items-center">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-400 mb-2 tracking-widest uppercase">Focusing On</h2>
            <h1 className="text-5xl font-black text-white">{sessionTitle}</h1>
          </div>

          <div className="relative mb-16 group">
            <svg className="w-96 h-96 transform -rotate-90">
              <circle
                cx="192"
                cy="192"
                r="180"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="192"
                cy="192"
                r="180"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 180}
                strokeDashoffset={2 * Math.PI * 180 * (1 - timeLeft / (durationMinutes * 60))}
                className="text-indigo-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-8xl font-black tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </span>
              {!isActive && timeLeft !== durationMinutes * 60 && (
                <span className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-sm">Paused</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isActive 
                  ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700" 
                  : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-600/20"
              }`}
            >
              {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
            </button>
          </div>

          <div className="mt-16 text-slate-500 text-sm max-w-md">
            <p>
              <strong>Distraction Blocker Active:</strong> Leaving this tab or minimizing the window will {strictMode ? "fail the session immediately" : "record a distraction violation"}.
            </p>
          </div>
        </div>
      )}

      {/* Ambient Sound Controls */}
      {!isFailed && timeLeft > 0 && (
        <div className="absolute bottom-8 right-8 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 w-72 shadow-2xl">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Music className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Ambient Sound</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {AMBIENT_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(selectedSound === sound.url ? null : sound.url)}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${
                  selectedSound === sound.url 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
                title={sound.name}
              >
                <sound.icon className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{sound.name}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedSound && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 pt-3 border-t border-slate-800 overflow-hidden"
              >
                <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-slate-400 hover:text-white transition-colors">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
