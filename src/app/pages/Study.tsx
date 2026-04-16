import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getSupabase } from "../../lib/supabase";
import { StudyRLAgent } from "../../lib/rlAgent";
import { GoogleGenAI, Type } from "@google/genai";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  Plus,
  Layers,
  Clock,
  Brain,
  FileText,
  ChevronRight,
  Zap,
  Target,
  Sparkles,
  RefreshCw,
  MousePointer2,
  Hand,
  Trash2,
  Loader2,
  Settings2,
  Calendar,
  BookOpen,
  Coffee,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

export default function Study() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState("Deploy Strategy");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [missionControlSuggestions, setMissionControlSuggestions] = useState<any[]>([]);
  const [aiInputs, setAiInputs] = useState({
    targetHours: 4,
    intensity: "Balanced",
    learningStyle: "Visual",
    examType: "Final Exam",
    topics: ""
  });
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(true);
  const [scale, setScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasMode, setCanvasMode] = useState<'select' | 'hand'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [activeAddMenu, setActiveAddMenu] = useState<string | null>(null);
  const [hasPositionColumns, setHasPositionColumns] = useState<boolean | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'v') setCanvasMode('select');
      if (e.key.toLowerCase() === 'h') setCanvasMode('hand');
      if (e.key === ' ' && canvasMode !== 'hand') {
        e.preventDefault();
        setCanvasMode('hand');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setCanvasMode('select');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canvasMode]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      e.preventDefault();
      const zoomSpeed = 0.002; // Slightly faster for trackpads
      const delta = -e.deltaY * zoomSpeed;
      const newScale = Math.min(Math.max(scale + delta, 0.1), 3);
      
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const canvasX = (mouseX - canvasOffset.x - rect.width / 2) / scale;
        const canvasY = (mouseY - canvasOffset.y - rect.height / 2) / scale;
        
        const newOffsetX = mouseX - rect.width / 2 - canvasX * newScale;
        const newOffsetY = mouseY - rect.height / 2 - canvasY * newScale;
        
        setScale(newScale);
        setCanvasOffset({ x: newOffsetX, y: newOffsetY });
      }
    } else {
      // Pan
      setCanvasOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || canvasMode === 'hand') { // Middle mouse or hand mode
      setIsPanning(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2));
  const handleResetZoom = () => {
    setScale(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const centerCanvas = () => {
    if (nodes.length === 0) {
      handleResetZoom();
      return;
    }

    // Calculate bounds of all nodes
    const minX = Math.min(...nodes.map(n => n.x || 0));
    const maxX = Math.max(...nodes.map(n => n.x || 0));
    const minY = Math.min(...nodes.map(n => n.y || 0));
    const maxY = Math.max(...nodes.map(n => n.y || 0));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setCanvasOffset({
      x: -centerX * scale,
      y: -centerY * scale
    });
  };

  const updateNodePosition = async (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    
    if (hasPositionColumns === false) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('study_nodes').update({ x, y }).eq('id', id);
      if (error && error.message.includes('column "x" does not exist')) {
        setHasPositionColumns(false);
      } else if (!error) {
        setHasPositionColumns(true);
      }
    } catch (error) {
      console.error("Error updating node position:", error);
    }
  };

  const generateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Generate a personalized study plan based on these parameters:
        - Target Hours: ${aiInputs.targetHours}
        - Intensity: ${aiInputs.intensity}
        - Learning Style: ${aiInputs.learningStyle}
        - Exam Type: ${aiInputs.examType}
        - Topics: ${aiInputs.topics || "General subjects"}

        Suggest a sequence of 4-6 study sessions including:
        - Deep Work (focused study)
        - Review (active recall)
        - Breaks (rest)
        
        For each session, provide:
        - title: Short name
        - description: What to do
        - type: Session type
        - duration: In minutes
        - color: One of [indigo, emerald, amber, rose, violet, slate]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                color: { type: Type.STRING }
              },
              required: ["title", "description", "type", "duration", "color"]
            }
          }
        }
      });

      if (response.text) {
        const plan = JSON.parse(response.text);
        setMissionControlSuggestions(plan);
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addSuggestionToCanvas = async (suggestion: any) => {
    const newNode = {
      id: `temp-${Math.random()}`,
      title: suggestion.title,
      description: `${suggestion.description} (${suggestion.duration} mins)`,
      type: suggestion.type,
      status: "Planned",
      color: suggestion.color,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200
    };

    // Optimistic update
    setNodes(prev => [...prev, newNode]);
    setMissionControlSuggestions(prev => prev.filter(s => s.title !== suggestion.title));

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('study_nodes').insert([{
        title: newNode.title,
        description: newNode.description,
        type: newNode.type,
        status: newNode.status,
        color: newNode.color,
        x: newNode.x,
        y: newNode.y
      }]).select();
      
      if (error) throw error;
      
      // Replace temp node with real one
      if (data) {
        setNodes(prev => prev.map(n => n.id === newNode.id ? data[0] : n));
      }
    } catch (error) {
      console.error("Error adding suggestion to canvas:", error);
      // Rollback
      setNodes(prev => prev.filter(n => n.id !== newNode.id));
      setMissionControlSuggestions(prev => [...prev, suggestion]);
    }
  };

  const createNewNode = async (parentId: string, type: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const typeConfig: any = {
      'Deep Work': { color: 'indigo', icon: Brain, description: 'Intense focus session' },
      'Break': { color: 'emerald', icon: Coffee, description: 'Recharge and rest' },
      'Review': { color: 'violet', icon: RefreshCw, description: 'Consolidate knowledge' },
      'Research': { color: 'amber', icon: Search, description: 'Explore new concepts' }
    };

    const config = typeConfig[type] || typeConfig['Deep Work'];

    const newNode = {
      id: `temp-${Math.random()}`,
      title: `New ${type}`,
      description: config.description,
      type: type,
      status: "Planned",
      color: config.color,
      x: (parentNode.x || 0) + 400, // Slightly closer
      y: (parentNode.y || 0) + (Math.random() * 40 - 20) // Add slight jitter
    };

    // Insert after parent in the array to maintain sequential connection
    const parentIndex = nodes.findIndex(n => n.id === parentId);
    const newNodes = [...nodes];
    newNodes.splice(parentIndex + 1, 0, newNode);
    setNodes(newNodes);
    setActiveAddMenu(null);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('study_nodes').insert([{
        title: newNode.title,
        description: newNode.description,
        type: newNode.type,
        status: newNode.status,
        color: newNode.color,
        x: newNode.x,
        y: newNode.y
      }]).select();
      
      if (error) throw error;
      
      if (data) {
        setNodes(prev => prev.map(n => n.id === newNode.id ? data[0] : n));
      }
    } catch (error) {
      console.error("Error creating new node:", error);
      setNodes(prev => prev.filter(n => n.id !== newNode.id));
      toast.error("Failed to create node");
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log("Nodes state updated:", nodes);
  }, [nodes]);

  const loadNodes = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    console.log("loadNodes called", { isManual });
    try {
      const supabase = getSupabase();
      console.log("Fetching from Supabase...");
      const { data, error } = await supabase.from('study_nodes').select('*').order('created_at', { ascending: true });
      
      if (error) {
        console.warn("Supabase fetch failed, using local fallback:", error);
        const localNodes = [
          { id: '1', title: "Calculus III", description: "Multi-variable differentiation and integration strategies for engineering applications.", type: "Core Module v1.0", status: "Active Session", color: "indigo", x: -250, y: 0 },
          { id: '2', title: "Exam Mastery", description: "Final comprehensive review with 95% proficiency target for upcoming finals.", type: "Target Objective", status: "95%", color: "amber", x: 250, y: 0 }
        ];
        setNodes(localNodes);
        if (isManual) toast.success("Loaded local fallback nodes");
        return;
      }
      
      console.log("Fetched nodes:", data?.length);
      if (data && data.length > 0) {
        setNodes(data);
        if (isManual) toast.success("Canvas Refreshed");
      } else {
        console.log("No nodes found in DB, inserting defaults...");
        const initialNodes = [
          { title: "Calculus III", description: "Multi-variable differentiation and integration strategies for engineering applications.", type: "Core Module v1.0", status: "Active Session", color: "indigo", x: -250, y: 0 },
          { title: "Exam Mastery", description: "Final comprehensive review with 95% proficiency target for upcoming finals.", type: "Target Objective", status: "95%", color: "amber", x: 250, y: 0 }
        ];
        const { data: inserted, error: insertError } = await supabase.from('study_nodes').insert(initialNodes).select();
        if (insertError) {
           console.error("Insert error:", insertError);
           setNodes(initialNodes.map((n, i) => ({ ...n, id: `local-${i}` })));
           if (isManual) toast.success("Loaded local fallback nodes");
        } else if (inserted) {
           console.log("Inserted nodes:", inserted.length);
           setNodes(inserted);
           if (isManual) toast.success("Initialized default nodes");
        }
      }
    } catch (error) {
      console.error("Error in loadNodes:", error);
      if (isManual) toast.error("Failed to load nodes");
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNodes();

    const supabase = getSupabase();
    const nodesSub = supabase
      .channel('public:study_nodes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_nodes' }, payload => {
        if (payload.eventType === 'INSERT') {
          setNodes(current => {
            if (current.some(n => n.id === payload.new.id)) return current;
            return [...current, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setNodes(current => current.map(n => n.id === payload.new.id ? payload.new : n));
        } else if (payload.eventType === 'DELETE') {
          setNodes(current => current.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(nodesSub);
    };
  }, []);

  const handleDeployStrategy = async () => {
    if (nodes.length === 0) return;
    
    setIsDeploying(true);
    setDeploymentStatus("Agent exploring state space...");
    
    try {
      const agent = new StudyRLAgent(nodes);
      
      // Simulate RL processing time for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (nodes.length > 3) {
        setDeploymentStatus("Enhancing policy with LLM...");
      }
      
      const optimizedPlan = await agent.optimizeStrategy();
      
      console.log("Optimized Strategy:", optimizedPlan);
      
      // Reorder and reposition nodes based on RL agent's policy
      const reorderedNodes = [];
      let currentX = -((optimizedPlan.length - 1) * 250) / 2;
      
      for (let i = 0; i < optimizedPlan.length; i++) {
        const step = optimizedPlan[i];
        if (step.nodeId === 'BREAK') continue;
        const node = nodes.find(n => n.id === step.nodeId);
        if (node) {
          // Update status and position to show it was scheduled in sequence
          reorderedNodes.push({ 
            ...node, 
            status: "Scheduled",
            x: currentX,
            y: (i % 2 === 0 ? -50 : 50) // Slight zigzag
          });
          currentX += 450;
          
          // Persist the new position
          updateNodePosition(node.id, reorderedNodes[reorderedNodes.length - 1].x, reorderedNodes[reorderedNodes.length - 1].y);
        }
      }
      
      // Add any nodes that the agent might have missed (fallback)
      for (const node of nodes) {
        if (!reorderedNodes.find(n => n.id === node.id)) {
          reorderedNodes.push(node);
        }
      }
      
      setNodes(reorderedNodes);
      setDeploymentStatus("Strategy Deployed!");
      
      setTimeout(() => {
        setIsDeploying(false);
        setDeploymentStatus("Deploy Strategy");
      }, 2000);
      
    } catch (error) {
      console.error("Deployment failed:", error);
      setDeploymentStatus("Deployment Failed");
      setTimeout(() => {
        setIsDeploying(false);
        setDeploymentStatus("Deploy Strategy");
      }, 2000);
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      transition: { type: "spring", stiffness: 300, damping: 20 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="h-full w-full relative flex overflow-hidden bg-slate-50/50"
    >
      {/* Mission Control Panel (Left) */}
      <AnimatePresence>
        {isMissionControlOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="w-[380px] bg-white border-r border-slate-200 flex flex-col h-full z-40 shadow-2xl"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Settings2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Mission Control</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Strategic Planning</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMissionControlOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* AI Inputs Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Target Hours
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      value={aiInputs.targetHours}
                      onChange={(e) => setAiInputs({...aiInputs, targetHours: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-lg font-bold text-slate-900 w-8">{aiInputs.targetHours}h</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Intensity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Relaxed", "Balanced", "Sprint", "Deep Work"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAiInputs({...aiInputs, intensity: opt})}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          aiInputs.intensity === opt 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Topics
                  </label>
                  <textarea
                    placeholder="What are you studying today?"
                    value={aiInputs.topics}
                    onChange={(e) => setAiInputs({...aiInputs, topics: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm bg-slate-50 min-h-[100px] resize-none font-medium"
                  />
                </div>

                <button
                  onClick={generateStudyPlan}
                  disabled={isGeneratingPlan}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Plan</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to clear all nodes? This will also delete them from the database.")) return;
                    try {
                      const supabase = getSupabase();
                      const { error } = await supabase.from('study_nodes').delete().neq('id', '0');
                      if (error) throw error;
                      setNodes([]);
                      toast.success("Canvas Cleared");
                    } catch (error) {
                      console.error("Error clearing nodes:", error);
                      toast.error("Failed to clear nodes");
                    }
                  }}
                  className="w-full py-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Nodes
                </button>
              </div>

              {/* Suggestions Section */}
              {missionControlSuggestions.length > 0 && (
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Suggestions</h3>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                      {missionControlSuggestions.length} ITEMS
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {missionControlSuggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all group cursor-pointer"
                        onClick={() => addSuggestionToCanvas(s)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center`}>
                            {s.type.toLowerCase().includes('break') ? <Coffee className={`w-4 h-4 text-${s.color}-600`} /> : <BookOpen className={`w-4 h-4 text-${s.color}-600`} />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{s.duration}m</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{s.title}</h4>
                        <p className="text-[10px] font-semibold text-slate-500 leading-relaxed whitespace-pre-wrap">{s.description}</p>
                        <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-indigo-600" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-background ${canvasMode === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        {/* Toggle Mission Control */}
        {!isMissionControlOpen && (
          <motion.button
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            onClick={() => setIsMissionControlOpen(true)}
            className="absolute top-8 left-8 z-40 w-12 h-12 bg-card border border-border rounded-2xl shadow-xl flex items-center justify-center text-muted-foreground hover:text-accent-primary transition-all"
          >
            <Settings2 className="w-6 h-6" />
          </motion.button>
        )}

        {/* Canvas Controls (Top Right) */}
        <div className="absolute top-8 right-8 z-40 flex flex-col gap-2">
          <div className="bg-card border border-border rounded-2xl p-1 shadow-xl flex flex-col">
            <button 
              onClick={() => setCanvasMode('select')}
              className={`p-3 rounded-xl transition-all ${canvasMode === 'select' ? 'bg-accent-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-card/60'}`}
              title="Select Mode (V)"
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCanvasMode('hand')}
              className={`p-3 rounded-xl transition-all ${canvasMode === 'hand' ? 'bg-accent-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-card/60'}`}
              title="Pan Mode (H)"
            >
              <Hand className="w-5 h-5" />
            </button>
            <button 
              onClick={centerCanvas}
              className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
              title="Center Canvas"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Overlay */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`absolute top-8 ${isMissionControlOpen ? 'left-8' : 'left-24'} z-30 space-y-1 transition-all pointer-events-none`}
        >
          <h1 className="text-4xl font-black tracking-tighter text-foreground italic">STRATEGY CANVAS</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em]">Mastery Protocol Visualization</p>
        </motion.div>

        {/* Canvas Background Grid (Pannable) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
            style={{ 
              backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
              transformOrigin: 'center'
            }} 
          />
        </div>

        {/* Nodes Container */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <motion.div 
            animate={{ 
              x: canvasOffset.x, 
              y: canvasOffset.y, 
              scale 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ left: '50%', top: '50%' }}
            className="absolute pointer-events-none origin-center"
          >
            {/* SVG Connections Layer */}
            <svg className="absolute pointer-events-none overflow-visible" style={{ width: 1, height: 1 }}>
              {nodes.map((node, i) => {
                if (i === nodes.length - 1) return null;
                const nextNode = nodes[i + 1];
                if (!node || !nextNode) return null;
                return (
                  <motion.line
                    key={`line-${node.id}-${nextNode.id}`}
                    x1={node.x || 0}
                    y1={node.y || 0}
                    x2={nextNode.x || 0}
                    y2={nextNode.y || 0}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border"
                    strokeDasharray="8 8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                );
              })}
            </svg>

            {nodes.length === 0 && !isGeneratingPlan && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2 w-64 text-center p-8 bg-white/50 backdrop-blur-md rounded-[32px] border border-slate-200 shadow-xl pointer-events-auto">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Nodes Found</p>
                <p className="text-slate-500 text-sm mt-2">Add modules from the sidebar or generate a plan.</p>
                <button 
                  onClick={() => loadNodes(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                >
                  Try Refreshing
                </button>
              </div>
            )}

            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                drag={canvasMode === 'select'}
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  const newX = (node.x || 0) + info.offset.x / scale;
                  const newY = (node.y || 0) + info.offset.y / scale;
                  updateNodePosition(node.id, newX, newY);
                }}
                initial={{ x: node.x || 0, y: node.y || 0, opacity: 0, scale: 0.9 }}
                animate={{ x: node.x || 0, y: node.y || 0, opacity: 1, scale: 1 }}
                style={{ translateX: '-50%', translateY: '-50%' }}
                whileHover={{ scale: 1.02 }}
                className={`absolute w-[380px] rounded-[32px] p-8 shadow-2xl z-10 group cursor-grab active:cursor-grabbing pointer-events-auto border transition-all ${
                  node.color === "indigo" ? "bg-card/40 border-accent-primary/30 text-foreground" :
                  node.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/30 text-foreground" :
                  node.color === "violet" ? "bg-violet-500/5 border-violet-500/30 text-foreground" :
                  node.color === "amber" ? "bg-amber-500/5 border-amber-500/30 text-foreground" :
                  node.color === "rose" ? "bg-rose-500/5 border-rose-500/30 text-foreground" :
                  "bg-card/40 border-border text-foreground"
                }`}
              >
                <div className={`absolute -right-12 -top-12 w-48 h-48 bg-${node.color}-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-${node.color}-500/20 transition-all duration-700`} />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${
                    node.color === "indigo" ? "bg-indigo-100/50 border-indigo-200 text-indigo-700" :
                    node.color === "emerald" ? "bg-emerald-100/50 border-emerald-200 text-emerald-700" :
                    node.color === "violet" ? "bg-violet-100/50 border-violet-200 text-violet-700" :
                    node.color === "amber" ? "bg-amber-100/50 border-amber-200 text-amber-700" :
                    node.color === "rose" ? "bg-rose-100/50 border-rose-200 text-rose-700" :
                    "bg-slate-100 border-slate-200 text-slate-600"
                  }`}>
                    <div className={`w-2 h-2 rounded-full bg-${node.color}-500 ${index % 2 === 0 ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase">{node.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/app/focus'); // Navigate to the focus session page
                      }}
                      className={`p-2.5 rounded-xl border transition-all shadow-sm ${
                        node.color === "indigo" ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-200" :
                        node.color === "emerald" ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200" :
                        node.color === "violet" ? "bg-violet-600 text-white border-violet-500 shadow-violet-200" :
                        node.color === "amber" ? "bg-amber-600 text-white border-amber-500 shadow-amber-200" :
                        node.color === "rose" ? "bg-rose-600 text-white border-rose-500 shadow-rose-200" :
                        "bg-slate-900 text-white border-slate-800 shadow-slate-200"
                      }`}
                      title="Start Focus Session"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const supabase = getSupabase();
                        await supabase.from('study_nodes').delete().eq('id', node.id);
                      }}
                      className="p-2.5 text-slate-400 hover:text-rose-600 transition-colors bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 hover:border-rose-100 hover:bg-rose-50"
                    >
                      <Trash2 strokeWidth={2.5} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className={`text-xl font-bold tracking-tight mb-3 relative z-10 transition-colors ${
                  node.color === "indigo" ? "text-indigo-950" :
                  node.color === "emerald" ? "text-emerald-950" :
                  node.color === "violet" ? "text-violet-950" :
                  node.color === "amber" ? "text-amber-950" :
                  node.color === "rose" ? "text-rose-950" :
                  "text-slate-900"
                }`}>{node.title}</h3>
                <p className={`text-sm font-medium leading-relaxed mb-8 relative z-10 opacity-70 whitespace-pre-wrap ${
                  node.color === "indigo" ? "text-indigo-800" :
                  node.color === "emerald" ? "text-emerald-800" :
                  node.color === "violet" ? "text-violet-800" :
                  node.color === "amber" ? "text-amber-800" :
                  node.color === "rose" ? "text-rose-800" :
                  "text-slate-500"
                }`}>
                  {node.description}
                </p>

                <div className={`flex items-center justify-between relative z-10 pt-6 border-t ${
                  node.color === "indigo" ? "border-indigo-200/50" :
                  node.color === "emerald" ? "border-emerald-200/50" :
                  node.color === "violet" ? "border-violet-200/50" :
                  node.color === "amber" ? "border-amber-200/50" :
                  node.color === "rose" ? "border-rose-200/50" :
                  "border-slate-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      node.color === "indigo" ? "bg-indigo-100 border-indigo-200 text-indigo-600" :
                      node.color === "emerald" ? "bg-emerald-100 border-emerald-200 text-emerald-600" :
                      node.color === "violet" ? "bg-violet-100 border-violet-200 text-violet-600" :
                      node.color === "amber" ? "bg-amber-100 border-amber-200 text-amber-600" :
                      node.color === "rose" ? "bg-rose-100 border-rose-200 text-rose-600" :
                      "bg-slate-50 border-slate-100 text-slate-400"
                    }`}>
                      <Target strokeWidth={2.5} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`block text-[10px] font-bold uppercase tracking-wider opacity-60 ${
                        node.color === "indigo" ? "text-indigo-600" :
                        node.color === "emerald" ? "text-emerald-600" :
                        node.color === "violet" ? "text-violet-600" :
                        node.color === "amber" ? "text-amber-600" :
                        node.color === "rose" ? "text-rose-600" :
                        "text-slate-400"
                      }`}>Status</span>
                      <span className={`text-xs font-black ${
                        node.color === "indigo" ? "text-indigo-900" :
                        node.color === "emerald" ? "text-emerald-900" :
                        node.color === "violet" ? "text-violet-900" :
                        node.color === "amber" ? "text-amber-900" :
                        node.color === "rose" ? "text-rose-900" :
                        "text-slate-900"
                      }`}>{node.status}</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                      node.color === "indigo" ? "bg-indigo-600 text-white shadow-indigo-200" :
                      node.color === "emerald" ? "bg-emerald-600 text-white shadow-emerald-200" :
                      node.color === "violet" ? "bg-violet-600 text-white shadow-violet-200" :
                      node.color === "amber" ? "bg-amber-600 text-white shadow-amber-200" :
                      node.color === "rose" ? "bg-rose-600 text-white shadow-rose-200" :
                      "bg-slate-900 text-white shadow-slate-200"
                    }`}
                  >
                    <Sparkles strokeWidth={2.5} className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* n8n-style Add Button */}
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex items-center z-20">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAddMenu(activeAddMenu === node.id ? null : node.id);
                    }}
                    className={`w-12 h-12 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all ${
                      activeAddMenu === node.id ? "bg-rose-500 text-white rotate-45" : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </motion.button>

                  <AnimatePresence>
                    {activeAddMenu === node.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 40, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        className="absolute left-full ml-4 bg-white border border-slate-200 rounded-3xl p-3 shadow-2xl flex flex-col gap-2 min-w-[160px]"
                      >
                        {['Deep Work', 'Break', 'Review', 'Research'].map((type) => (
                          <button
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation();
                              createNewNode(node.id, type);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              type === 'Deep Work' ? 'bg-indigo-50 text-indigo-600' :
                              type === 'Break' ? 'bg-emerald-50 text-emerald-600' :
                              type === 'Review' ? 'bg-violet-50 text-violet-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {type === 'Deep Work' ? <Brain className="w-4 h-4" /> :
                               type === 'Break' ? <Coffee className="w-4 h-4" /> :
                               type === 'Review' ? <RefreshCw className="w-4 h-4" /> :
                               <Search className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{type}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Bar Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-3 shadow-2xl flex items-center gap-6 z-50 pointer-events-auto"
        >
          <div className="flex items-center gap-6 px-4 text-muted-foreground">
            <motion.button onClick={handleZoomOut} whileHover={{ scale: 1.1 }} className="hover:text-foreground transition-all"><ZoomOut strokeWidth={2.5} className="w-5 h-5" /></motion.button>
            <span className="text-sm font-black tracking-tight text-foreground min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <motion.button onClick={handleZoomIn} whileHover={{ scale: 1.1 }} className="hover:text-foreground transition-all"><ZoomIn strokeWidth={2.5} className="w-5 h-5" /></motion.button>
            <div className="w-px h-6 bg-border" />
            <motion.button onClick={handleResetZoom} whileHover={{ scale: 1.1 }} className="hover:text-foreground transition-all" title="Reset View"><Maximize strokeWidth={2.5} className="w-5 h-5" /></motion.button>
            <div className="w-px h-6 bg-border" />
            <motion.button 
              onClick={() => loadNodes(true)} 
              whileHover={{ scale: 1.1 }} 
              className="hover:text-slate-900 transition-all" 
              title="Refresh Data"
              disabled={isRefreshing}
            >
              <RefreshCw strokeWidth={2.5} className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          <motion.button 
            onClick={handleDeployStrategy}
            disabled={isDeploying}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold tracking-tight shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play strokeWidth={3} className="w-4 h-4 fill-current" />}
            <span>{deploymentStatus}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Right Sidebar - AI Study Tools */}
      <div className="w-[380px] bg-white border-l border-slate-200 p-8 flex flex-col h-full z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
        <div className="mb-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Study Modules</h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Visual Logic Components</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pointer-events-auto">
              {[
                { icon: Layers, title: "Flashcard Gen", desc: "Transforms lecture notes into active recall flashcard sets automatically.", color: "indigo" },
                { icon: Clock, title: "Schedule Opt", desc: "AI-driven time blocking based on syllabus urgency and personal energy.", color: "emerald" },
                { icon: Brain, title: "Cognitive AI", desc: "Identifies knowledge gaps and complex conceptual clusters.", color: "amber" },
                { icon: FileText, title: "Source Scraper", desc: "Extracts key theorems and formulas from PDF or video inputs.", color: "rose" }
              ].map((tool, i) => (
                <motion.div 
                  key={i}
                  onClick={async (e) => {
                    e.stopPropagation();
                    console.log(`Adding tool: ${tool.title}`);
                    const tempId = `temp-${Math.random()}`;
                    const newNode = {
                      id: tempId,
                      title: tool.title,
                      description: tool.desc,
                      type: "AI Tool",
                      status: "Pending",
                      color: tool.color,
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400
                    };

                    // Optimistic update
                    setNodes(prev => [...prev, newNode]);
                    toast.success(`Added ${tool.title} to canvas`);

                    try {
                      const supabase = getSupabase();
                      const { data, error } = await supabase.from('study_nodes').insert([{
                        title: newNode.title,
                        description: newNode.description,
                        type: newNode.type,
                        status: newNode.status,
                        color: newNode.color,
                        x: newNode.x,
                        y: newNode.y
                      }]).select();
                      
                      if (error) throw error;
                      if (data) {
                        setNodes(prev => prev.map(n => n.id === tempId ? data[0] : n));
                      }
                    } catch (error) {
                      console.error("Error adding tool:", error);
                      setNodes(prev => prev.filter(n => n.id !== tempId));
                    }
                  }}
                  whileHover={{ x: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-50 rounded-[28px] p-6 border border-slate-100 cursor-pointer hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group relative overflow-hidden pointer-events-auto"
                >
              <div className="flex items-center gap-5 mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${tool.color}-500/10 flex items-center justify-center border border-${tool.color}-500/10 group-hover:bg-${tool.color}-500/20 transition-all`}>
                  <tool.icon strokeWidth={2.5} className={`w-6 h-6 text-${tool.color}-600`} />
                </div>
                <h4 className="text-base font-bold tracking-tight text-slate-900">{tool.title}</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed relative z-10">
                {tool.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 mt-auto pointer-events-auto">
          <motion.button 
            onClick={async (e) => {
              e.stopPropagation();
              console.log("Adding custom module");
              const tempId = `temp-${Math.random()}`;
              const newNode = {
                id: tempId,
                title: "Custom Module",
                description: "A user-defined custom study objective or resource.",
                type: "Custom",
                status: "Draft",
                color: "slate",
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400
              };

              // Optimistic update
              setNodes(prev => [...prev, newNode]);
              toast.success("Added Custom Module to canvas");

              try {
                const supabase = getSupabase();
                const { data, error } = await supabase.from('study_nodes').insert([{
                  title: newNode.title,
                  description: newNode.description,
                  type: newNode.type,
                  status: newNode.status,
                  color: newNode.color,
                  x: newNode.x,
                  y: newNode.y
                }]).select();
                
                if (error) throw error;
                if (data) {
                  setNodes(prev => prev.map(n => n.id === tempId ? data[0] : n));
                }
              } catch (error) {
                console.error("Error adding custom module:", error);
                setNodes(prev => prev.filter(n => n.id !== tempId));
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200"
          >
            <Plus strokeWidth={3} className="w-5 h-5" />
            Add Custom Module
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
