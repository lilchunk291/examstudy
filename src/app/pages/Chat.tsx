import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Whiteboard from "../components/Whiteboard";

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
  PanelRight,
  Box,
  Book,
  Hexagon,
  Library,
  GraduationCap,
  Layers,
  X,
  CheckCircle2,
  Cloud,
  ShieldCheck,
  Loader2,
  ChevronDown,
  Cpu,
  Search,
  Globe,
  Workflow,
  MoreVertical,
  Settings2,
  Palette,
  History,
  Trash
} from "lucide-react";

import { GoogleGenAI } from "@google/genai";
import { API_CONFIG, getApiUrl } from "../../lib/config";
import { getSupabase } from "../../lib/supabase";
import { useAIWorker } from "../../lib/AIWorkerContext";
import { toast } from "sonner";

type Message = {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string }[];
};

type DrawMode = "pen" | "pan" | "rect" | "circle" | "text" | "eraser";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [currentChatTitle, setCurrentChatTitle] = useState("New Conversation");

  // Models Configuration
  const availableModels = [
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", type: "cloud", provider: "Google", icon: Cloud },
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", type: "cloud", provider: "Google", icon: Cloud },
    { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite", type: "cloud", provider: "Google", icon: Cloud },
    { id: "gpt-4o", name: "GPT-4o (Puter)", type: "puter", provider: "OpenAI", icon: Zap },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Puter)", type: "puter", provider: "Anthropic", icon: Brain },
    { id: "onnx-community/gemma-4-E4B-it-ONNX", name: "Gemma 4 (4B)", type: "local", provider: "Google", icon: ShieldCheck },
    { id: "onnx-community/gemma-4-E2B-it-ONNX", name: "Gemma 4 (2B)", type: "local", provider: "Google", icon: ShieldCheck },
    { id: "onnx-community/Llama-3.2-1B-Instruct", name: "Llama 3.2 (1B)", type: "local", provider: "Meta", icon: ShieldCheck },
    { id: "Xenova/Qwen1.5-0.5B-Chat", name: "Qwen 1.5 (0.5B)", type: "local", provider: "Alibaba", icon: ShieldCheck },
    { id: "Xenova/TinyLlama-1.1B-Chat-v1.0", name: "TinyLlama (1.1B)", type: "local", provider: "TinyLlama", icon: ShieldCheck },
  ];

  // AI Model State
  const [selectedModelId, setSelectedModelId] = useState<string>("gemini-3-flash-preview");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    theme: "system",
    showAnalysis: true
  });

  const { status: localModelStatus, progress: localModelProgress, loadModel, currentModelId, generateText } = useAIWorker();

  // Hugging Face Search State
  const [isModelHubOpen, setIsModelHubOpen] = useState(false);
  const [hfSearchQuery, setHfSearchQuery] = useState("");
  const [hfSearchResults, setHfSearchResults] = useState<any[]>([]);
  const [isSearchingHF, setIsSearchingHF] = useState(false);
  const [customModels, setCustomModels] = useState<any[]>([]);

  const allModels = [...availableModels, ...customModels];
  const currentModel = allModels.find(m => m.id === selectedModelId) || allModels[0];

  // Feature state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [isConnectorsModalOpen, setIsConnectorsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectedServices, setConnectedServices] = useState<string[]>(['supabase', 'gemini']);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [sessionFiles, setSessionFiles] = useState<File[]>([]);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchVaultFiles() {
      const supabase = getSupabase();
      const { data } = await supabase.from('vault_files').select('*');
      if (data) setVaultFiles(data);
    }
    fetchVaultFiles();
  }, []);

  const connectors = [
    {
      id: "vault",
      name: "Knowledge Vault",
      subtitle: "Integrated Protocol",
      description: "Direct access to your stored documents, study guides, and research archives.",
      icon: Library,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      category: "Personal Data",
      popular: true
    },
    {
      id: "supabase",
      name: "Supabase Database",
      subtitle: "Active Connection",
      description: "Real-time state synchronization and persistent secure storage.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      category: "Infrastructure",
      popular: true
    },
    {
      id: "gemini",
      name: "Google Gemini AI",
      subtitle: "Active Protocol",
      description: "Neural reasoning and multimodal architectural analysis.",
      icon: Cpu,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      category: "AI",
      popular: true
    },
    {
      id: "google-drive",
      name: "Google Drive",
      subtitle: "#2 popular",
      description: "Search, read, and upload files instantly",
      icon: Box,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      category: "Storage",
      popular: true
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      subtitle: "#3 popular",
      description: "Manage your schedule and coordinate meetings effortlessly",
      icon: Calendar,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      category: "Productivity",
      popular: true
    },
    {
      id: "monday",
      name: "monday.com",
      subtitle: "Interactive",
      description: "Manage projects, boards, and workflows in monday.com",
      icon: Workflow,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      category: "Productivity",
      interactive: true
    },
    {
      id: "notion",
      name: "Notion",
      subtitle: "Knowledge Base",
      description: "Connect your Notion workspace to sync notes and databases",
      icon: Book,
      color: "text-slate-900 dark:text-white",
      bg: "bg-slate-900/10 dark:bg-white/10",
      category: "Productivity"
    },
    {
      id: "slack",
      name: "Slack",
      subtitle: "Communication",
      description: "Get notifications and interact with StudyVault from Slack",
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      category: "Communication"
    },
    {
      id: "github",
      name: "GitHub",
      subtitle: "Development",
      description: "Sync your repositories and track issues directly",
      icon: Cpu,
      color: "text-slate-900 dark:text-white",
      bg: "bg-slate-900/10 dark:bg-white/10",
      category: "Development"
    },
    {
      id: "puter",
      name: "Puter.js AI",
      subtitle: "Free Protocol",
      description: "Direct serverless access to GPT-4o and Claude 3.5 without API keys.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      category: "AI",
      popular: true
    },
    {
      id: "obsidian",
      name: "Obsidian",
      subtitle: "Local First",
      description: "Index your local Obsidian vault for AI-powered search",
      icon: Hexagon,
      color: "text-purple-600",
      bg: "bg-purple-600/10",
      category: "Productivity"
    },
    {
      id: "canvas",
      name: "Canvas LMS",
      subtitle: "Education",
      description: "Import assignments, grades, and course materials",
      icon: GraduationCap,
      color: "text-red-500",
      bg: "bg-red-500/10",
      category: "Education"
    },
    {
      id: "anki",
      name: "Anki",
      subtitle: "Spaced Repetition",
      description: "Generate and sync flashcards with AnkiWeb",
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-600/10",
      category: "Education"
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
    setIsPlusMenuOpen(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput(prev => prev + (prev ? "\n" : "") + "[Voice Note Recorded] ");
    } else {
      setIsRecording(true);
    }
    setIsPlusMenuOpen(false);
  };

  const toggleConnection = (id: string) => {
    if (id === 'supabase' || id === 'gemini') {
      alert(`${id === 'supabase' ? 'Supabase' : 'Gemini'} is already connected via your environment configuration.`);
      return;
    }
    setConnectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const supabase = getSupabase();
    
    // Realtime subscription for messages in the active conversation
    const messagesSub = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, payload => {
        // Get active chat from state via ref
        const activeConversation = conversationsRef.current.find(c => c.active);
        
        if (!activeConversation || !payload.new || (payload.new as any).conversation_id !== activeConversation.id) return;

        if (payload.eventType === 'INSERT') {
          setMessages(current => {
            if (current.find(m => m.id === payload.new.id)) return current;
            return [...current, {
              id: payload.new.id,
              type: payload.new.role as "user" | "ai",
              content: payload.new.content,
              timestamp: new Date(payload.new.created_at)
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMessages(current => current.map(m => m.id === payload.new.id ? {
            id: payload.new.id,
            type: payload.new.role as "user" | "ai",
            content: payload.new.content,
            timestamp: new Date(payload.new.created_at)
          } : m));
        } else if (payload.eventType === 'DELETE') {
          setMessages(current => current.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSub);
    };
  }, []); // Run on mount only

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsModelDropdownOpen(false);
    
    const model = allModels.find(m => m.id === modelId);
    if (model?.type === "local") {
      loadModel(modelId);
    }
  };

  const searchHuggingFace = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingHF(true);
    try {
      // Search for text-generation models compatible with transformers.js
      const res = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=transformers.js&pipeline_tag=text-generation&sort=downloads&direction=-1&limit=10`);
      const data = await res.json();
      setHfSearchResults(data);
    } catch (error) {
      console.error("HF Search Error:", error);
    } finally {
      setIsSearchingHF(false);
    }
  };

  const addCustomModel = (modelId: string) => {
    const newModel = {
      id: modelId,
      name: modelId.split('/').pop() || modelId,
      type: "local",
      provider: modelId.split('/')[0] || "Community",
      icon: Cpu
    };
    setCustomModels(prev => {
      if (prev.find(m => m.id === modelId)) return prev;
      return [...prev, newModel];
    });
    setIsModelHubOpen(false);
    handleModelSelect(modelId);
  };

  const [conversations, setConversations] = useState<any[]>([]);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      
      // Load conversations
      const { data: convs, error: convError } = await supabase.from('conversations').select('*').order('created_at', { ascending: false });
      if (convError) {
        console.error("Error loading conversations", convError);
        return;
      }

      if (convs && convs.length > 0) {
        setConversations(convs.map(c => ({ ...c, active: false })));
        switchConversation(convs[0].id);
      } else {
        createNewChat();
      }
    }
    init();
  }, []);

  const fetchMessagesByConversation = async (conversationId: number) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data.map(m => ({
      id: m.id,
      type: m.role as "user" | "ai",
      content: m.content,
      timestamp: new Date(m.created_at)
    })));
  };

  const createNewChat = async () => {
    const id = Date.now();
    const newConv = { id, title: "New Conversation", created_at: new Date().toISOString() };
    
    const supabase = getSupabase();
    const { error } = await supabase.from('conversations').insert([newConv]);
    
    if (error) {
      console.error("Error creating chat:", error);
      return;
    }

    setConversations(prev => [{ ...newConv, active: true }, ...prev.map(c => ({ ...c, active: false }))]);
    setMessages([]);
  };

  const switchConversation = (id: number) => {
    setConversations(prev => prev.map(c => ({ ...c, active: c.id === id })));
    fetchMessagesByConversation(id);
  };

  const deleteConversation = async (id: number) => {
    const supabase = getSupabase();
    await supabase.from('conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (conversations.find(c => c.id === id)?.active) {
      setMessages([]);
    }
  };

  const clearChat = async () => {
    try {
      const supabase = getSupabase();
      await supabase.from('chat_messages').delete().neq('id', 0); // Delete all
      setMessages([]);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const activeConversation = conversations.find(c => c.active);
    if (!activeConversation) return;

    const userMessageContent = input || "Attached files for analysis.";
    const filesToSend = [...attachedFiles];
    setInput("");
    setAttachedFiles([]);
    setSessionFiles(prev => {
      const newFiles = filesToSend.filter(f => !prev.some(pf => pf.name === f.name));
      return [...prev, ...newFiles];
    });
    setIsLoading(true);

    try {
      const supabase = getSupabase();
      
      // Upload files and get URLs (Using Supabase Storage)
      const uploadedAttachments: { url: string, name: string, type: string }[] = [];
      
      for (const file of filesToSend) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${activeConversation.id}/${fileName}`;
        
        let { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);
          
        uploadedAttachments.push({ url: publicUrl, name: file.name, type: file.type });
      }
      
      // Optimistically add to UI
      const optimisticUserMsg: Message = {
        id: Date.now(),
        type: "user",
        content: userMessageContent,
        timestamp: new Date(),
        attachments: uploadedAttachments
      };
      setMessages(prev => [...prev, optimisticUserMsg]);

      // Save to Supabase
      await supabase.from('chat_messages').insert([{ 
        role: 'user', 
        content: userMessageContent,
        conversation_id: activeConversation.id,
        attachments: uploadedAttachments
      }]);

      const vaultContext = vaultFiles.length > 0 
        ? `\nYou have access to the user's Knowledge Vault. The following files are available for reference:
${vaultFiles.map(f => `- ${f.name} (${f.type}, Category: ${f.category || 'General'})`).join('\n')}
If the user asks about these files, explain that you can see their metadata. In a future update, you will be able to read their full contents.` 
        : "";

      const systemInstruction = `You are the AI Architect, a highly advanced, privacy-first study assistant and expert coding partner. 
      Your tone is technical, efficient, and encouraging.
      You are highly skilled at writing clean, documented, and modular code in various programming languages. 
      When asked for code, you provide complete, well-formatted snippets using Markdown code blocks with language specifiers.
      ${vaultContext}`;

      const aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { id: aiMessageId, type: "ai", content: "", timestamp: new Date() }]);

      if (API_CONFIG.useLocalBackend) {
        try {
          const response = await fetch(getApiUrl('/api/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: messages.map(m => ({ role: m.type, content: m.content })),
              model: currentModel.id
            })
          });
          const data = await response.json();
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: data.content } : m));
          await supabase.from('chat_messages').insert([{ role: 'ai', content: data.content, conversation_id: activeConversation.id }]);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Local backend error:", error);
          // Fallback to direct BaaS if local backend fails
        }
      }

      if (currentModel.type === "cloud") {
        const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!rawApiKey) {
          throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file or AI Studio Secrets.");
        }
        const apiKey = rawApiKey.replace(/['"]/g, '').trim();
        const ai = new GoogleGenAI(apiKey);
        
        // Filter messages to ensure role alternation (user -> model -> user -> model)
        // Gemini throws 400 if roles are consecutive
        const filteredHistory = [];
        let lastRole = null;
        for (const m of messages) {
          if (!m.content) continue;
          const currentRole = m.type === "user" ? "user" : "model";
          if (currentRole !== lastRole) {
            filteredHistory.push({
              role: currentRole,
              parts: [{ text: m.content }]
            });
            lastRole = currentRole;
          } else {
             // If consecutive same role, combine them
             const lastMsg = filteredHistory[filteredHistory.length - 1];
             lastMsg.parts[0].text += "\n" + m.content;
          }
        }

        // If last message was user, pull back history to maintain alternation
        if (lastRole === "user") {
          filteredHistory.pop();
        }

        let userParts: any[] = [{ text: userMessageContent }];
        
        if (filesToSend.length > 0) {
          const fileParts = await Promise.all(filesToSend.map(async (file) => {
            const base64EncodedDataPromise = new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(file);
            });
            return {
              inlineData: {
                data: await base64EncodedDataPromise,
                mimeType: file.type
              }
            };
          }));
          userParts = [...fileParts, ...userParts];
        }

        // Using the existing ai.models.generateContentStream structure
        // Casting to any to avoid property error while maintaining their specific SDK structure
        const responseStream = await (ai as any).models.generateContentStream({
          model: currentModel.id,
          contents: [
            ...filteredHistory,
            {
              role: "user",
              parts: userParts
            }
          ],
          config: {
            systemInstruction
          }
        });

        let fullText = "";
        for await (const chunk of responseStream) {
          const chunkText = chunk.text || (typeof chunk === 'string' ? chunk : "");
          fullText += chunkText;
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullText } : m));
        }
        
        // Save AI response to Supabase
        await supabase.from('chat_messages').insert([{ role: 'ai', content: fullText, conversation_id: activeConversation.id }]);
        setIsLoading(false);

      } else if (currentModel.type === "puter") {
        try {
          const puter = (window as any).puter;
          if (!puter) {
             throw new Error("Puter.js SDK not found. Ensure the script is loaded in index.html and you are not blocking third-party scripts.");
          }

          const chatMessages = messages.map(m => ({ 
            role: m.type === "ai" ? "assistant" : "user", 
            content: m.content 
          }));
          
          chatMessages.push({ role: "user", content: userMessageContent });

          const response = await puter.ai.chat(chatMessages, { 
            model: currentModel.id,
            stream: true 
          });

          let fullContent = "";
          for await (const part of response) {
            const delta = (part as any)?.text || (typeof part === 'string' ? part : "");
            fullContent += delta;
            setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullContent } : m));
          }

          await supabase.from('chat_messages').insert([{ 
            role: 'ai', 
            content: fullContent, 
            conversation_id: activeConversation.id 
          }]);
          
          setIsLoading(false);
        } catch (error: any) {
          console.error("Puter AI Error:", error);
          const errorMsg = "Puter AI failed: " + (error.message || "Unknown error");
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: errorMsg } : m));
          toast.error(errorMsg);
          setIsLoading(false);
        }
      } else {
        // Local Model Inference
        if (localModelStatus !== 'ready') {
          throw new Error(`Local model is not ready yet. Status: ${localModelStatus}`);
        }

        const localMessages = messages.map(m => ({ 
          role: m.type === "user" ? "user" : "assistant", 
          content: m.content 
        }));

        try {
          let fullLocalContent = "";
          const result = await generateText(
            userMessageContent, 
            systemInstruction, 
            localMessages,
            (delta) => {
              fullLocalContent += delta;
              setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullLocalContent } : m));
            }
          );
          
          // Ensure the final result is set (in case of delta vs complete mismatch)
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: result } : m));
          await supabase.from('chat_messages').insert([{ role: 'ai', content: result, conversation_id: activeConversation.id }]);
          setIsLoading(false);
        } catch (error: any) {
          console.error("Worker Generation Error:", error);
          setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: "Sorry, I encountered an error generating the response." } : m));
          throw error;
        }
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: `Error: ${error?.message || "Neural link interrupted. Please check your connection or try again later."}`,
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
    <div className="h-full flex bg-transparent relative overflow-hidden font-sans text-slate-900 rounded-3xl border border-white/40 shadow-2xl backdrop-blur-xl">
      
      {/* Left Sidebar (Chat History) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-white/40 backdrop-blur-3xl border-r border-white/50 overflow-hidden shrink-0"
          >
            <div className="p-4">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/60 border border-white/50 rounded-2xl text-sm font-bold hover:bg-white/80 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-indigo-900">New chat</span>
                </div>
                <PenTool className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</div>
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => switchConversation(conv.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all group ${
                    conv.active ? "bg-white/80 shadow-md border border-white/50" : "hover:bg-white/50 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${conv.active ? "font-bold text-indigo-900" : "font-medium text-slate-600 group-hover:text-slate-900"}`}>
                      {conv.title}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/50">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/60 cursor-pointer transition-all border border-transparent hover:border-white/50 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">Student</div>
                </div>
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white/20 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 bg-white/40 backdrop-blur-3xl border-b border-white/50 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/60 rounded-xl transition-all shadow-sm border border-transparent hover:border-white/50"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800">{currentChatTitle}</h2>
          </div>
          
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:bg-white/80 transition-all"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentModel.type === 'cloud' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <currentModel.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-slate-800 leading-none">{currentModel.name}</span>
                <span className="text-[10px] font-medium text-slate-500 leading-none mt-1">{currentModel.provider} • {currentModel.type === 'cloud' ? 'API' : 'On-Device'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isModelDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Models (API)</div>
                    {allModels.filter(m => m.type === 'cloud').map(model => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedModelId === model.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <Cloud className={`w-4 h-4 ${selectedModelId === model.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${selectedModelId === model.id ? 'text-indigo-900' : 'text-slate-700'}`}>{model.name}</span>
                          <span className="text-[10px] font-medium text-slate-500">{model.provider}</span>
                        </div>
                      </button>
                    ))}

                    <div className="px-3 py-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">Local Models (On-Device)</div>
                    {allModels.filter(m => m.type === 'local').map(model => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedModelId === model.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <Cpu className={`w-4 h-4 ${selectedModelId === model.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${selectedModelId === model.id ? 'text-emerald-900' : 'text-slate-700'}`}>{model.name}</span>
                          <span className="text-[10px] font-medium text-slate-500">{model.provider}</span>
                        </div>
                      </button>
                    ))}

                    <div className="px-2 pt-2 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsModelDropdownOpen(false);
                          setIsModelHubOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all text-xs font-bold"
                      >
                        <Globe className="w-4 h-4" />
                        Browse Hugging Face Hub
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsWhiteboardOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/60 rounded-xl transition-all shadow-sm border border-transparent hover:border-white/50"
              title="Open Whiteboard"
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/60 rounded-xl transition-all shadow-sm border border-transparent hover:border-white/50"
              title="Chat Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`p-2 rounded-xl transition-all shadow-sm border ${rightPanelOpen ? "text-indigo-600 bg-white/80 border-white/80 shadow-md" : "text-slate-500 hover:text-indigo-600 hover:bg-white/60 border-transparent hover:border-white/50"}`}
              title="Toggle Context Panel"
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Whiteboard Overlay */}
        <AnimatePresence>
          {isWhiteboardOpen && (
            <Whiteboard onClose={() => setIsWhiteboardOpen(false)} />
          )}
        </AnimatePresence>

        {/* Chat Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chat Settings</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Configure your AI interaction protocol.</p>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Temperature</label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{chatSettings.temperature}</span>
                    </div>
                    <input 
                      type="range" min="0" max="2" step="0.1"
                      value={chatSettings.temperature}
                      onChange={(e) => setChatSettings({...chatSettings, temperature: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Higher values make the output more creative, lower values more deterministic.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Tokens</label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{chatSettings.maxTokens}</span>
                    </div>
                    <input 
                      type="range" min="256" max="8192" step="256"
                      value={chatSettings.maxTokens}
                      onChange={(e) => setChatSettings({...chatSettings, maxTokens: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Clear Chat History</div>
                        <div className="text-[10px] font-medium text-slate-500">Permanently delete all messages in this session.</div>
                      </div>
                    </div>
                    <button 
                      onClick={clearChat}
                      className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
                  >
                    Apply Settings
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
          
          {/* Local Model Loading Indicator */}
          <AnimatePresence>
            {currentModel.type === "local" && localModelStatus === "loading" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm max-w-3xl mx-auto w-full"
              >
                <div className="flex items-center gap-3 text-emerald-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div className="flex flex-col">
                    <div className="text-sm font-bold">
                      {`Downloading ${currentModel.name}...`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300" 
                      style={{ width: `${localModelProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 w-8">{localModelProgress}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 pb-20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-lg font-bold text-slate-700">How can I help you study today?</p>
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
                  <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center flex-shrink-0 mr-4 border border-white shadow-md">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] group relative ${
                    message.type === "user"
                      ? "bg-indigo-600 text-white px-6 py-4 rounded-3xl rounded-tr-sm shadow-xl shadow-indigo-200/50"
                      : "bg-white border border-slate-200 px-6 py-5 rounded-3xl rounded-tl-sm shadow-sm text-slate-800"
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.attachments.map((att, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-102 ${message.type === 'user' ? 'bg-indigo-500/50 border-indigo-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`markdown-body text-[15px] leading-relaxed ${message.type === "user" ? "text-indigo-50" : "text-slate-700"}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="my-4 rounded-xl overflow-hidden border border-slate-700/10 shadow-lg">
                              <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{match[1]}</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                    toast.success("Code copied to clipboard");
                                  }}
                                  className="text-slate-400 hover:text-white transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, '')}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem' }}
                              />
                            </div>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && !messages.some(m => m.content === "") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full max-w-3xl mx-auto justify-start"
              >
                <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center flex-shrink-0 mr-4 border border-white shadow-md">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/50 px-6 py-5 rounded-3xl rounded-tl-sm shadow-lg flex items-center">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-transparent">
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence>
              {isPlusMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-4 z-50 w-72"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: FileUp, label: "Import", color: "text-blue-600", bg: "bg-blue-100", action: () => fileInputRef.current?.click() },
                      { icon: Plug, label: "Connect", color: "text-indigo-600", bg: "bg-indigo-100", action: () => { setIsConnectorsModalOpen(true); setIsPlusMenuOpen(false); } },
                      { icon: Camera, label: "Scan", color: "text-emerald-600", bg: "bg-emerald-100", action: () => scanInputRef.current?.click() },
                      { icon: Mic, label: isRecording ? "Stop" : "Voice", color: isRecording ? "text-white" : "text-rose-600", bg: isRecording ? "bg-rose-500 animate-pulse" : "bg-rose-100", action: toggleVoiceRecording },
                      { icon: Share2, label: "Sync", color: "text-amber-600", bg: "bg-amber-100", action: () => { alert("Syncing with local vault..."); setIsPlusMenuOpen(false); } },
                      { icon: ImageIcon, label: "Media", color: "text-cyan-600", bg: "bg-cyan-100", action: () => mediaInputRef.current?.click() },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={item.action}
                        className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-white/50 group"
                      >
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden File Inputs */}
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
            <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} />
            <input type="file" ref={scanInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />

            <div className="flex flex-col bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30 transition-all overflow-hidden">
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-6 pt-4 pb-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button 
                        onClick={() => setAttachedFiles(prev => prev.filter((_, index) => index !== i))}
                        className="p-0.5 hover:bg-indigo-200 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                className="w-full max-h-48 min-h-[60px] px-6 py-5 bg-transparent text-[15px] font-medium placeholder:text-slate-400 focus:outline-none disabled:opacity-50 resize-none custom-scrollbar text-slate-800"
              />
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-2">
                  <motion.button 
                    animate={{ rotate: isPlusMenuOpen ? 45 : 0 }}
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className="p-2.5 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-white/80 transition-all shadow-sm border border-transparent hover:border-white/50"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI can make mistakes. Please verify important information.</span>
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
            className="flex flex-col bg-white/40 backdrop-blur-3xl border-l border-white/50 overflow-hidden shrink-0 shadow-2xl z-20"
          >
            <div className="h-16 flex items-center px-6 border-b border-white/50">
              <h3 className="text-sm font-bold text-slate-800">Context Panel</h3>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Active Context */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Context</h4>
                <div className="p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg space-y-4">
                  {sessionFiles.length > 0 ? (
                    sessionFiles.map((file, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-800 truncate">{file.name}</div>
                          <div className="text-xs font-medium text-slate-500 truncate">{(file.size / 1024).toFixed(1)} KB • Session Upload</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs font-medium text-slate-500 text-center py-2">No files attached in this session.</div>
                  )}
                </div>
              </div>

              {/* Integrated Knowledge */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrated Knowledge</h4>
                <div className="p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg space-y-4">
                  {vaultFiles.length > 0 ? (
                    <div className="space-y-4">
                      {vaultFiles.slice(0, 5).map((file, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Book className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-800 truncate">{file.name}</div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{file.category || 'Vault File'}</div>
                          </div>
                        </div>
                      ))}
                      {vaultFiles.length > 5 && (
                        <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest pt-2 border-t border-slate-100">
                          + {vaultFiles.length - 5} more files in vault
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-500 text-center py-2 flex flex-col items-center gap-2">
                       <Library className="w-8 h-8 text-slate-300 opacity-50" />
                       Vault is currently empty.
                    </div>
                  )}
                </div>
              </div>

              {/* Connectors Integration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connectors</h4>
                  <button 
                    onClick={() => setIsConnectorsModalOpen(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Manage
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {connectors.slice(0, 8).map((connector) => {
                    const isConnected = connectedServices.includes(connector.id);
                    return (
                      <button
                        key={connector.id}
                        onClick={() => toggleConnection(connector.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all border ${
                          isConnected 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" 
                            : "bg-white/40 border-white/50 text-slate-400 hover:border-indigo-100 hover:text-indigo-400"
                        }`}
                        title={connector.name}
                      >
                        <connector.icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setIsConnectorsModalOpen(true)}
                    className="aspect-square rounded-xl flex items-center justify-center bg-white/40 border border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* AI Model Info */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Model Info</h4>
                <div className="p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Model</span>
                    <span className="font-bold text-slate-800">{currentModel.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Provider</span>
                    <span className="font-bold text-slate-800">{currentModel.provider}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Mode</span>
                    <span className="font-bold text-slate-800 uppercase">{currentModel.type}</span>
                  </div>
                </div>
              </section>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Connectors Modal */}
      <AnimatePresence>
        {isConnectorsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Neural Connectors</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Link external data protocols to your AI Assistant.</p>
                </div>
                <button 
                  onClick={() => setIsConnectorsModalOpen(false)}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connectors.map((connector) => {
                    const isConnected = connectedServices.includes(connector.id);
                    const Icon = connector.icon;
                    return (
                      <div 
                        key={connector.id}
                        onClick={() => toggleConnection(connector.id)}
                        className={`group relative p-5 rounded-3xl border-2 cursor-pointer transition-all ${
                          isConnected 
                            ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10" 
                            : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl ${connector.bg} flex items-center justify-center shadow-inner`}>
                            <Icon className={`w-7 h-7 ${connector.color}`} strokeWidth={2.5} />
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isConnected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}>
                            {isConnected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{connector.name}</h3>
                            {connector.popular && (
                              <span className="text-[9px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Popular</span>
                            )}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{connector.subtitle}</p>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">{connector.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {connectedServices.length} Active Protocols
                  </span>
                </div>
                <button 
                  onClick={() => setIsConnectorsModalOpen(false)}
                  className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hugging Face Model Hub Modal */}
      <AnimatePresence>
        {isModelHubOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    Hugging Face Hub
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Search and load WebGL/WASM compatible local models.</p>
                </div>
                <button 
                  onClick={() => setIsModelHubOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    value={hfSearchQuery}
                    onChange={(e) => setHfSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchHuggingFace(hfSearchQuery)}
                    placeholder="Search for text-generation models (e.g., Llama, Qwen)..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  <button 
                    onClick={() => searchHuggingFace(hfSearchQuery)}
                    disabled={isSearchingHF || !hfSearchQuery.trim()}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {isSearchingHF ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar bg-slate-50/30">
                {hfSearchResults.length === 0 && !isSearchingHF ? (
                  <div className="text-center py-10 text-slate-500">
                    <Globe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-medium">Search for a model to load it directly into your browser.</p>
                    <p className="text-xs mt-1 text-slate-400">Only transformers.js compatible models will work.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hfSearchResults.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all shadow-sm">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 truncate">{model.id.split('/').pop()}</h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              {model.id.split('/')[0]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{model.id}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {model.downloads.toLocaleString()}</span>
                            <span>•</span>
                            <span>Text Generation</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => addCustomModel(model.id)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold text-xs rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Load Model
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
