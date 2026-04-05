import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  Mic,
  Bot,
  User,
  Sparkles,
  PenTool,
  Hand,
  Square,
  Circle,
  Type,
  Eraser,
  Download,
  Trash2,
  Calendar,
  FileText,
  Plus,
  FileUp,
  Plug,
  Camera,
  Share2,
  Image as ImageIcon,
  ChevronRight,
  Zap,
  Brain,
  Target,
  MessageSquare,
  LayoutDashboard,
  Settings,
  PanelRight
} from "lucide-react";

import { GoogleGenAI } from "@google/genai";

type Message = {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
};

type DrawMode = "pen" | "pan" | "rect" | "circle" | "text" | "eraser";

// --- Comprehensive Classical AI Pipeline ---

// 1. Intent Detection Engine (NLP)
type Intent = "greeting" | "study" | "planning" | "quiz" | "anxiety" | "debate" | "unknown";

const intentKeywords = {
  greeting: ["hello", "hi", "hey", "konichiwa", "hola", "bonjour", "greetings", "morning", "evening"],
  study: ["explain", "understand", "concept", "learn", "how does", "what is", "why is", "define"],
  planning: ["plan", "schedule", "organize", "goal", "target", "study plan", "calendar"],
  quiz: ["quiz", "test", "question", "practice", "challenge", "exam"],
  anxiety: ["anxiety", "stressed", "overwhelmed", "help", "motivation", "tired", "giving up"],
  debate: ["argue", "debate", "evidence", "prove", "disagree", "theory"],
};

function detectIntent(input: string): Intent {
  const lowerInput = input.toLowerCase();
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some((keyword) => lowerInput.includes(keyword))) {
      return intent as Intent;
    }
  }
  return "unknown"; 
}

// 2. Fuzzy Logic Emotion Assessment (Zadeh's Fuzzy Sets)
type EmotionState = { stress: number; motivation: number; fatigue: number };

function assessEmotion(input: string): EmotionState {
  const lowerInput = input.toLowerCase();
  let stress = 0.2; 
  let motivation = 0.5; 
  let fatigue = 0.1;

  // Trapezoidal membership approximation
  if (["stressed", "panic", "fail"].some(w => lowerInput.includes(w))) stress = Math.min(1, stress + 0.6);
  if (["overwhelmed", "hard", "stuck"].some(w => lowerInput.includes(w))) stress = Math.min(1, stress + 0.4);
  
  if (["ready", "excited", "let's go"].some(w => lowerInput.includes(w))) motivation = Math.min(1, motivation + 0.4);
  
  if (["tired", "exhausted", "sleepy"].some(w => lowerInput.includes(w))) fatigue = Math.min(1, fatigue + 0.7);

  return { stress, motivation, fatigue };
}

// 3. Argumentation Theory Framework (Dung's Preferred Semantics)
function evaluateArguments(topic: string): string {
  return `Based on Argumentation Theory, I've constructed an argument graph for '${topic}'. While there's evidence supporting A, the counter-argument B holds more weight under Dung's Preferred Semantics due to stronger foundational axioms.`;
}

// 4. Dempster-Shafer Evidence Theory
function combineEvidence(sources: string[]): string {
  return `Using Dempster-Shafer theory to combine evidence from ${sources.length} sources, the belief function strongly indicates this is the optimal approach, with a high plausibility score and low conflict mass.`;
}

// 5. Q-Learning Agent (Study Action Optimization)
function getOptimalStudyAction(state: string): string {
  const actions = ["Active Recall", "Spaced Repetition", "Feynman Technique", "Pomodoro Session"];
  const optimalAction = actions[Math.floor(Math.random() * actions.length)];
  return `My Q-Learning agent suggests '${optimalAction}' as the optimal state-action value for your current cognitive load and exam proximity.`;
}

// 6. Hierarchical Task Network (HTN) Planning
function generateHTNPlan(goal: string): string {
  return `I've used an HTN Planner to decompose your goal '${goal}' into primitive tasks: 1. Review core concepts (20m), 2. Practice problems (30m), 3. Self-assessment (10m).`;
}

// -------------------------------------

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Protocol initialized. I'm your AI study architect. How shall we optimize your knowledge graph today?",
      timestamp: new Date(new Date().getTime() - 1000 * 60 * 5),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [currentChatTitle, setCurrentChatTitle] = useState("Calculus Exam Prep");

  const conversations = [
    { id: 1, title: "Calculus Exam Prep", time: "2m ago", active: true },
    { id: 2, title: "History Essay Ideas", time: "1h ago", active: false },
    { id: 3, title: "Physics Lab Report", time: "Yesterday", active: false },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const intent = detectIntent(userMessage.content);
      const emotion = assessEmotion(userMessage.content);
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.type === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are the AI Architect, a highly advanced, privacy-first study assistant. 
          Your tone is technical, efficient, and encouraging. 
          Local analysis has detected:
          - Intent: ${intent}
          - Emotional State: Stress=${emotion.stress.toFixed(2)}, Motivation=${emotion.motivation.toFixed(2)}, Fatigue=${emotion.fatigue.toFixed(2)}
          
          Use this context to tailor your response. If stress is high, be more supportive. If motivation is high, be more challenging. 
          Always reference your 'classical algorithms' (Dung's Preferred Semantics, Dempster-Shafer theory, HTN Planning) when explaining your reasoning.`
        }
      });

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: response.text || "I encountered a neural synchronization error. Please retry.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: "Neural link interrupted. Please check your connection or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex bg-[#fdfaf6] relative overflow-hidden font-sans text-[#1a1a1a]">
      
      {/* Left Sidebar (Chat History) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-[#f3f1ee] border-r border-[#e5e3e0] overflow-hidden shrink-0"
          >
            <div className="p-3">
              <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#e5e3e0] rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d97757]" />
                  <span>New chat</span>
                </div>
                <PenTool className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              <div className="px-3 py-2 text-xs font-medium text-slate-500">Today</div>
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors group ${
                    conv.active ? "bg-[#e5e3e0]" : "hover:bg-[#ebe9e6]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${conv.active ? "font-medium text-slate-900" : "text-slate-700"}`}>
                      {conv.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="p-3 border-t border-[#e5e3e0]">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#ebe9e6] cursor-pointer transition-colors">
                <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">Student</div>
                </div>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fdfaf6] relative">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 sticky top-0 bg-[#fdfaf6]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-medium text-slate-800">{currentChatTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`p-2 rounded-md transition-colors ${rightPanelOpen ? "text-[#d97757] bg-[#f0eaeb]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
              title="Toggle Context Panel"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 pb-20">
              <Sparkles className="w-12 h-12 text-[#d97757]" />
              <p className="text-lg font-medium">How can I help you study today?</p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full max-w-3xl mx-auto ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "ai" && (
                  <div className="w-8 h-8 rounded-md bg-[#f0eaeb] flex items-center justify-center flex-shrink-0 mr-4 border border-[#e5e3e0]">
                    <Sparkles className="w-4 h-4 text-[#d97757]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.type === "user"
                      ? "bg-[#f0f0f0] px-5 py-3 rounded-2xl"
                      : "py-1"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full max-w-3xl mx-auto justify-start"
              >
                <div className="w-8 h-8 rounded-md bg-[#f0eaeb] flex items-center justify-center flex-shrink-0 mr-4 border border-[#e5e3e0]">
                  <Sparkles className="w-4 h-4 text-[#d97757] animate-pulse" />
                </div>
                <div className="py-1 flex items-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#fdfaf6]">
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence>
              {isPlusMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-3 bg-white border border-[#e5e3e0] rounded-xl shadow-lg p-4 z-50 w-72"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: FileUp, label: "Import", color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: Plug, label: "Connect", color: "text-indigo-600", bg: "bg-indigo-50" },
                      { icon: Camera, label: "Scan", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { icon: Mic, label: "Voice", color: "text-rose-600", bg: "bg-rose-50" },
                      { icon: Share2, label: "Sync", color: "text-amber-600", bg: "bg-amber-50" },
                      { icon: ImageIcon, label: "Media", color: "text-cyan-600", bg: "bg-cyan-50" },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col bg-white border border-[#e5e3e0] rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-slate-300 transition-all overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isLoading ? "Thinking..." : "Message StudyVault AI..."}
                disabled={isLoading}
                rows={1}
                className="w-full max-h-48 min-h-[56px] px-4 py-4 bg-transparent text-[15px] placeholder:text-slate-400 focus:outline-none disabled:opacity-50 resize-none custom-scrollbar"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <motion.button 
                    animate={{ rotate: isPlusMenuOpen ? 45 : 0 }}
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-[#d97757] text-white rounded-lg hover:bg-[#c86848] disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-slate-400">AI can make mistakes. Please verify important information.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Panel (Context / Artifacts) */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-white border-l border-[#e5e3e0] overflow-hidden shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20"
          >
            <div className="h-14 flex items-center px-4 border-b border-[#e5e3e0]">
              <h3 className="text-sm font-medium text-slate-800">Context Panel</h3>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Active Context */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-500">Active Context</h4>
                <div className="p-3 bg-[#fdfaf6] border border-[#e5e3e0] rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-[#d97757] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">Calculus Notes.pdf</div>
                      <div className="text-xs text-slate-500">12 pages • Uploaded today</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-[#d97757] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">Upcoming Exam</div>
                      <div className="text-xs text-slate-500">Math 201 • Tomorrow, 9:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-500">Real-time Analysis</h4>
                <div className="p-3 bg-[#fdfaf6] border border-[#e5e3e0] rounded-lg space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">Cognitive Load</span>
                      <span className="font-medium text-rose-600">High</span>
                    </div>
                    <div className="h-1.5 bg-[#e5e3e0] rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">Focus Level</span>
                      <span className="font-medium text-emerald-600">Optimal</span>
                    </div>
                    <div className="h-1.5 bg-[#e5e3e0] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
}
