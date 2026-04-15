import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  Settings, 
  Volume2, 
  Shield, 
  Lock, 
  Zap,
  Music,
  Wind,
  CloudRain,
  Moon,
  Target,
  CheckCircle2,
  Edit2,
  Check,
  VolumeX,
  Maximize2,
  History,
  Trash2,
  Coffee,
  Trees,
  Waves,
  ExternalLink,
  Youtube
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface FocusSession {
  id: string;
  title: string;
  date: string;
  duration: number; // in seconds
}

interface AmbientSound {
  id: string;
  name: string;
  icon: any;
  url: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Heavy Rain', icon: CloudRain, url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'cafe', name: 'Coffee Shop', icon: Coffee, url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'forest', name: 'Forest Day', icon: Trees, url: 'https://actions.google.com/sounds/v1/ambiences/forest_daybreak.ogg' },
  { id: 'ocean', name: 'Ocean Waves', icon: Waves, url: 'https://actions.google.com/sounds/v1/ambiences/ocean_waves.ogg' },
];

export default function Focus() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [initialTime] = useState(45 * 60); // 45 minutes
  const [time, setTime] = useState(initialTime);
  const [isFinished, setIsFinished] = useState(false);
  
  // Goal tracking state
  const [sessionGoal, setSessionGoal] = useState("");
  const [isGoalAchieved, setIsGoalAchieved] = useState(false);
  const [isGoalEditing, setIsGoalEditing] = useState(true);
  
  // Time tracking state
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [totalDuration, setTotalDuration] = useState(0); // in seconds

  // History state
  const [history, setHistory] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem("focus_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Ambient Sound State
  const [currentSoundId, setCurrentSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSource, setAudioSource] = useState<'native' | 'spotify' | 'youtube' | 'brainfm'>('native');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem("focus_history", JSON.stringify(history));
  }, [history]);

  // Initialize Audio Context and Analyser
  const initAudioContext = useCallback(() => {
    if (!audioRef.current || analyserRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      
      analyser.fftSize = 256;
      analyserRef.current = analyser;
    } catch (err) {
      console.error("Failed to initialize audio context:", err);
    }
  }, []);

  // Visualizer Animation
  const animate = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Use accent color for bars
        ctx.fillStyle = `rgba(var(--accent-primary-rgb), ${barHeight / 100})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  useEffect(() => {
    if (isActive && audioSource === 'native' && currentSoundId) {
      initAudioContext();
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioSource, currentSoundId, initAudioContext, animate]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      if (!startTime) setStartTime(new Date());
      
      interval = setInterval(() => {
        setTime((t) => t - 1);
        setTotalDuration((d) => d + 1);
      }, 1000);

      // Play audio if native
      if (audioSource === 'native' && currentSoundId && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    } else {
      if (time === 0 && isActive) {
        setIsActive(false);
        setIsFinished(true);
        const end = new Date();
        setEndTime(end);

        // Save to history
        const newSession: FocusSession = {
          id: Date.now().toString(),
          title: "Advanced Calculus • Block 2 of 4",
          date: end.toISOString(),
          duration: totalDuration + 1,
        };
        setHistory(prev => [newSession, ...prev]);

        toast.success("Focus session complete!");
      }
      
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, time, startTime, totalDuration, audioSource, currentSoundId]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle sound selection
  useEffect(() => {
    if (audioRef.current && currentSoundId) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === currentSoundId);
      if (sound) {
        audioRef.current.src = sound.url;
        audioRef.current.load();
        if (isActive) {
          audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
      }
    }
  }, [currentSoundId]);

  const handleEndSession = () => {
    setIsActive(false);
    setIsFinished(true);
    const end = new Date();
    setEndTime(end);

    // Save to history if session had some duration
    if (totalDuration > 10) {
      const newSession: FocusSession = {
        id: Date.now().toString(),
        title: "Advanced Calculus • Block 2 of 4",
        date: end.toISOString(),
        duration: totalDuration,
      };
      setHistory(prev => [newSession, ...prev]);
    }
  };

  const handleReset = useCallback(() => {
    setIsActive(false);
    setTime(initialTime);
    setTotalDuration(0);
    setStartTime(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    toast.info("Timer reset");
  }, [initialTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const progress = ((initialTime - time) / initialTime) * 100;

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
    hover: { 
      scale: 1.01, 
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="p-8 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden min-h-screen bg-background"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-primary/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10"
      >
        <div className="flex items-center gap-12">
          <motion.button 
            whileHover={{ scale: 1.1, x: -10 }}
            whileActive={{ scale: 0.9 }}
            onClick={() => navigate("/app")}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-card/40 backdrop-blur-3xl border border-border text-muted-foreground hover:text-foreground transition-all shadow-xl"
          >
            <ArrowLeft strokeWidth={4} className="w-7 h-7" />
          </motion.button>
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight drop-shadow-sm">Deep Focus</h1>
            <p className="text-base font-semibold text-muted-foreground tracking-tight max-w-3xl leading-relaxed">Session: Advanced Calculus • Block 2 of 4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileActive={{ scale: 0.95 }}
            className="flex items-center gap-6 px-6 py-3 bg-card/40 backdrop-blur-3xl border border-border rounded-full text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all shadow-xl"
          >
            <Settings strokeWidth={4} className="w-6 h-6" />
            Settings
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileActive={{ scale: 0.95 }}
            onClick={handleEndSession}
            className="flex items-center gap-6 px-6 py-3 bg-rose-500 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200"
          >
            End Session
          </motion.button>
        </div>
      </motion.div>

      {/* Main Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 flex-1 relative z-10">
        {/* Timer Card - The Hero */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="lg:col-span-2 bg-card/40 backdrop-blur-3xl rounded-[3rem] p-12 border border-border shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[700px] group"
        >
          {/* Ambient light effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full bg-accent-primary/10 blur-[200px] pointer-events-none group-hover:bg-accent-primary/20 transition-all duration-1000" />
          
          <div className="relative z-10 text-center w-full space-y-16">
            <div className="inline-flex items-center gap-8 px-10 py-5 bg-accent-primary/10 backdrop-blur-3xl rounded-full border border-accent-primary/20 text-accent-primary shadow-inner">
              <Zap strokeWidth={4} className="w-8 h-8 animate-pulse shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.5)]" />
              <span className="text-xs font-black uppercase tracking-widest">High Intensity Protocol Active</span>
            </div>
            
            <div className="relative flex items-center justify-center">
              {/* Progress Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="500" height="500" className="transform -rotate-90">
                  <circle
                    cx="250"
                    cy="250"
                    r="230"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/10"
                  />
                  <motion.circle
                    cx="250"
                    cy="250"
                    r="230"
                    stroke="var(--accent-primary)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={230 * 2 * Math.PI}
                    animate={{ strokeDashoffset: (230 * 2 * Math.PI) * (1 - progress / 100) }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_15px_var(--accent-primary)]"
                  />
                </svg>
              </div>

              <div className="relative z-20">
                <motion.h2 
                  key={time}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[10rem] leading-none font-black text-foreground tracking-tighter drop-shadow-2xl select-none tabular-nums group-hover:scale-105 transition-transform duration-700"
                >
                  {formatTime(time)}
                </motion.h2>
                <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground select-none mt-4">Minutes Remaining in Block</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-12 pt-8">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsActive(!isActive)}
                className={`w-32 h-32 flex items-center justify-center rounded-full shadow-2xl transition-all group ${isActive ? "bg-foreground text-background" : "bg-accent-primary text-white"}`}
              >
                {isActive ? (
                  <Pause strokeWidth={4} className="w-12 h-12 fill-current" />
                ) : (
                  <Play strokeWidth={4} className="w-12 h-12 fill-current ml-2" />
                )}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReset}
                className="w-24 h-24 flex items-center justify-center rounded-full bg-card/60 backdrop-blur-3xl border border-border text-muted-foreground hover:text-foreground shadow-2xl transition-all"
              >
                <RotateCcw strokeWidth={4} className="w-8 h-8" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-16">
          {/* Goal Tracking Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border shadow-2xl flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Target strokeWidth={4} className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Session Goal</h3>
              </div>
              {!isGoalEditing && sessionGoal && (
                <button 
                  onClick={() => setIsGoalEditing(true)}
                  className="p-2 hover:bg-card/60 rounded-xl transition-all text-muted-foreground hover:text-foreground"
                >
                  <Edit2 strokeWidth={3} className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              {isGoalEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(e.target.value)}
                    placeholder="e.g., Complete 2 practice problems..."
                    className="w-full p-4 bg-card/60 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none h-24 shadow-inner text-sm font-black"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (sessionGoal.trim()) {
                        setIsGoalEditing(false);
                      }
                    }}
                    disabled={!sessionGoal.trim()}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                  >
                    <Check strokeWidth={3} className="w-4 h-4" />
                    Set Goal
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsGoalAchieved(!isGoalAchieved)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                    isGoalAchieved 
                      ? "bg-emerald-500/10 border-emerald-500/20 shadow-inner" 
                      : "bg-card/60 border-border hover:bg-card/80 shadow-lg"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isGoalAchieved 
                      ? "bg-emerald-500 border-emerald-500 text-white scale-110" 
                      : "border-muted text-transparent"
                  }`}>
                    <Check strokeWidth={4} className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-black leading-relaxed transition-all ${
                    isGoalAchieved ? "text-emerald-700 line-through opacity-70" : "text-foreground"
                  }`}>
                    {sessionGoal}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Ambient Sound Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border shadow-2xl flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Music strokeWidth={4} className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Ambient</h3>
              </div>
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX strokeWidth={4} className="w-6 h-6 text-rose-500" /> : <Volume2 strokeWidth={4} className="w-6 h-6 text-muted-foreground" />}
              </button>
            </div>

            {/* Source Selector */}
            <div className="flex p-1 bg-muted/20 rounded-xl border border-border">
              {(['native', 'spotify', 'youtube', 'brainfm'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setAudioSource(source)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    audioSource === source ? 'bg-accent-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
            
            <div className="space-y-6 flex-1">
              {audioSource === 'native' && (
                <>
                  {AMBIENT_SOUNDS.map((sound) => (
                    <motion.button 
                      key={sound.id}
                      whileHover={{ x: 10, scale: 1.02 }}
                      onClick={() => setCurrentSoundId(sound.id === currentSoundId ? null : sound.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${
                        currentSoundId === sound.id 
                          ? "bg-accent-primary text-white border-accent-primary shadow-xl shadow-accent-primary/20" 
                          : "bg-card/40 text-muted-foreground border-border hover:bg-card/60 hover:text-foreground shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner ${
                          currentSoundId === sound.id ? "bg-white/20 border-white/20" : "bg-muted/10 border-border"
                        }`}>
                          <sound.icon strokeWidth={4} className={`w-4 h-4 ${currentSoundId === sound.id ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <span className="text-base font-black tracking-tight">{sound.name}</span>
                      </div>
                      {currentSoundId === sound.id && isActive && (
                        <div className="flex gap-2 items-end h-6">
                          <canvas 
                            ref={canvasRef} 
                            width="60" 
                            height="24" 
                            className="w-15 h-6"
                          />
                        </div>
                      )}
                    </motion.button>
                  ))}
                  <audio ref={audioRef} loop crossOrigin="anonymous" />
                </>
              )}

              {audioSource === 'spotify' && (
                <div className="space-y-4">
                  <iframe 
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0Ex7X?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    className="rounded-2xl border border-border"
                  />
                  <p className="text-[10px] font-black text-muted-foreground text-center uppercase tracking-widest">Connect your Spotify for full control</p>
                </div>
              )}

              {audioSource === 'youtube' && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black flex items-center justify-center group/yt relative">
                    <Youtube className="w-12 h-12 text-rose-600" />
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=1" 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground text-center uppercase tracking-widest">Lofi Girl • 24/7 Radio</p>
                </div>
              )}

              {audioSource === 'brainfm' && (
                <div className="p-8 rounded-2xl bg-card/60 border border-border flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-accent-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-foreground">Brain.fm Integration</h4>
                    <p className="text-xs font-black text-muted-foreground leading-relaxed">Scientifically proven focus music.</p>
                  </div>
                  <a 
                    href="https://www.brain.fm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary/90 transition-all"
                  >
                    Open Brain.fm
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            
            {audioSource === 'native' && (
              <div className="space-y-10">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground px-2">
                  <span>Volume Intensity</span>
                  <span className="text-accent-primary">{Math.round(volume * 100)}%</span>
                </div>
                <div className="relative w-full h-6 bg-muted/30 rounded-full border border-border p-2 shadow-inner group/slider">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${volume * 100}%` }}
                    className="h-full bg-accent-primary rounded-full shadow-2xl shadow-accent-primary/20 relative" 
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl scale-0 group-hover/slider:scale-100 transition-transform" />
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Distraction Blocker */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border shadow-2xl flex-1 flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Shield strokeWidth={4} className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Shield</h3>
              </div>
              <Lock strokeWidth={4} className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-6 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-3xl shadow-xl flex items-center justify-center border border-border group-hover:rotate-12 transition-transform">
                <Lock strokeWidth={4} className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-black text-foreground tracking-tight">Active</div>
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">12 Apps Blocked</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-card/40 rounded-2xl border border-border shadow-xl group-hover:bg-card/60 transition-all">
                <div className="space-y-2">
                  <span className="text-base font-black text-foreground tracking-tight">Strict Mode</span>
                  <p className="text-sm font-black text-muted-foreground tracking-tight leading-relaxed">No exit until block ends</p>
                </div>
                <div className="w-16 h-10 bg-emerald-500 rounded-full relative p-1.5 cursor-pointer shadow-inner">
                  <div className="absolute right-1.5 top-1.5 w-7 h-7 bg-white rounded-full shadow-2xl" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* History Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border shadow-2xl flex flex-col space-y-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <History strokeWidth={4} className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-black text-foreground tracking-tight">History</h3>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    setHistory([]);
                    toast.info("History cleared");
                  }}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mx-auto">
                    <History className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No sessions yet</p>
                </div>
              ) : (
                history.map((session) => (
                  <div key={session.id} className="p-4 rounded-2xl bg-card/60 border border-border flex items-center justify-between group/item hover:border-accent-primary/30 transition-all">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-foreground">{session.title}</div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-sm font-black text-accent-primary">
                      {Math.floor(session.duration / 60)}m
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Session Complete Modal */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-background/40 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card rounded-[40px] p-12 max-w-2xl w-full shadow-2xl border border-border relative overflow-hidden text-center space-y-12"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-primary" />
              <div className="w-24 h-24 rounded-3xl bg-accent-primary flex items-center justify-center mx-auto shadow-2xl shadow-accent-primary/20">
                <Zap className="text-white w-12 h-12 fill-current" strokeWidth={2.5} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-foreground tracking-tight">Protocol Complete</h2>
                <p className="text-lg font-black text-muted-foreground tracking-tight">You've successfully completed the High Intensity Block.</p>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="p-6 rounded-3xl bg-muted/10 border border-border">
                  <div className="text-2xl font-black text-accent-primary">{formatDateTime(startTime)}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Start Time</div>
                </div>
                <div className="p-6 rounded-3xl bg-muted/10 border border-border">
                  <div className="text-2xl font-black text-emerald-600">{formatDateTime(endTime)}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">End Time</div>
                </div>
                <div className="p-6 rounded-3xl bg-muted/10 border border-border">
                  <div className="text-2xl font-black text-orange-600">{Math.floor(totalDuration / 60)}m {totalDuration % 60}s</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Total Duration</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/app")}
                  className="w-full py-5 bg-accent-primary text-white rounded-2xl text-lg font-black tracking-tight shadow-2xl shadow-accent-primary/20 hover:bg-accent-primary/90 transition-all"
                >
                  Return to Dashboard
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsFinished(false);
                    setTime(initialTime);
                    setStartTime(null);
                    setEndTime(null);
                    setTotalDuration(0);
                  }}
                  className="w-full py-5 bg-card border border-border text-muted-foreground rounded-2xl text-lg font-black tracking-tight hover:bg-card/60 transition-all"
                >
                  Start New Block
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
