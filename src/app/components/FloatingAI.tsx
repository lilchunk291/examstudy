import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  Brain,
  Plus,
  Mic
} from "lucide-react";

import { GoogleGenAI } from "@google/genai";

type Message = {
  id: number;
  type: "user" | "ai";
  content: string;
};

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: "ai", content: "Protocol active. I'm your AI Architect. How shall we optimize your study flow?" }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), type: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg].map(m => ({
          role: m.type === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are the AI Architect, a highly advanced, privacy-first study assistant. Your tone is technical, efficient, and encouraging. You help students optimize their study sessions using classical AI algorithms and modern learning techniques."
        }
      });

      const aiMsg: Message = { 
        id: Date.now() + 1, 
        type: "ai", 
        content: response.text || "I encountered a neural synchronization error. Please retry." 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        type: "ai", 
        content: "Neural link interrupted. Please check your connection or try again later." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "80px" : "550px",
              width: "400px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white/40 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 bg-white/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
                  <Brain className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tighter text-slate-900">AI Architect</h3>
                  {!isMinimized && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Link Active</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/40 rounded-lg transition-all text-slate-400 hover:text-slate-900"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" strokeWidth={2.5} /> : <Minimize2 className="w-4 h-4" strokeWidth={2.5} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-rose-50 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-transparent">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-4 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${
                        msg.type === "ai" ? "bg-indigo-600 text-white" : "bg-white border border-white/40"
                      }`}>
                        {msg.type === "ai" ? <Bot className="w-4 h-4" strokeWidth={2.5} /> : <User className="w-4 h-4 text-slate-600" strokeWidth={2.5} />}
                      </div>
                      <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-bold tracking-tight border shadow-xl backdrop-blur-md ${
                        msg.type === "user" 
                          ? "bg-indigo-600 text-white rounded-tr-none border-indigo-500 shadow-indigo-100/50" 
                          : "bg-white/80 border-white/40 text-slate-800 rounded-tl-none"
                      }`}>
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg bg-indigo-600 text-white">
                        <Bot className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                      </div>
                      <div className="bg-white/80 border border-white/40 p-4 rounded-[24px] rounded-tl-none shadow-xl backdrop-blur-md">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/20 bg-white/20">
                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-3xl border border-white/40 rounded-full p-1.5 pr-3 shadow-xl focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                      <Plus className="w-5 h-5" strokeWidth={3} />
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={isLoading ? "Thinking..." : "Ask the Architect..."}
                      disabled={isLoading}
                      className="flex-1 bg-transparent px-2 py-2 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                    />
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-all">
                        <Mic className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={handleSend}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        <Send className="w-4 h-4 ml-0.5" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all relative group ${
          isOpen ? "bg-white text-indigo-600 border border-white/40" : "bg-indigo-600 text-white shadow-indigo-200/50"
        }`}
      >
        {isOpen ? <X className="w-8 h-8" strokeWidth={2.5} /> : <Brain className="w-8 h-8" strokeWidth={2.5} />}
        {!isOpen && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-4 border-white rounded-full shadow-lg"
          />
        )}
        <div className="absolute inset-0 rounded-[24px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>
    </div>
  );
}
