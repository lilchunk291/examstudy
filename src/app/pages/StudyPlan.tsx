import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, Circle, Target, BookOpen, Clock, BrainCircuit, Loader2, Plus, Trash2 } from 'lucide-react';
import { generateClassicalPlan, Module, updateQValue } from '../../lib/classicalAi';
import { getSupabase } from '../../lib/supabase';

export default function StudyPlan() {
  const [modules, setModules] = useState<Module[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load subjects from both Schedule events (filtered for Deep Work) and tasks
    const loadData = async () => {
      const supabase = getSupabase();
      
      const [eventsRes, tasksRes] = await Promise.all([
        supabase.from('events').select('title').eq('type', 'Deep Work'),
        supabase.from('tasks').select('title')
      ]);

      const items = [
        ...(eventsRes.data || []),
        ...(tasksRes.data || [])
      ];

      if (items.length > 0) {
        const uniqueTitles = Array.from(new Set(items.map(o => o.title)));
        setModules(uniqueTitles.map((title, i) => ({
          id: i.toString(),
          title,
          progress: 0,
          status: 'todo',
          dependencies: i > 0 ? [(i - 1).toString()] : [], 
          difficulty: 3
        })));
      }
    };
    loadData();
  }, []);

  const addModule = () => {
    if (!newTitle.trim()) return;
    setModules([...modules, {
      id: Date.now().toString(),
      title: newTitle,
      progress: 0,
      status: 'todo',
      dependencies: [],
      difficulty: 3
    }]);
    setNewTitle("");
  };

  const generatePath = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const optimized = generateClassicalPlan(modules);
    
    const suggestionText = optimized.length > 0 
      ? `Based on classical AI heuristics (Topological Sort + Q-Learning), your optimal next module is: \n\n🎯 ${optimized[0].title} \n\nThis module maximizes progress based on current difficulty and learned utility values.`
      : "All dependencies met! You are ready for final implementation.";
      
    setAiSuggestion(suggestionText);
    setIsLoading(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Study Plan</h1>
          <p className="text-slate-500 mt-2">Visually map your learning journey and optimize your path.</p>
        </div>
        <button 
          onClick={generatePath}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
          {isLoading ? "Optimizing..." : "Get AI Path Optimization"}
        </button>
      </div>

      <div className="flex gap-4">
        <input 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter module title..."
          className="flex-1 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button onClick={addModule} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800"><Plus/></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-slate-100/50"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${module.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {module.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{module.title}</h3>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                module.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {module.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs font-bold text-slate-500">Progress</span>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    className="stroke-slate-100"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    className={`${module.status === 'completed' ? 'stroke-emerald-500' : 'stroke-indigo-500'} transition-all duration-500 ease-in-out`}
                    strokeWidth="3"
                    strokeDasharray={`${module.progress} 100`}
                    strokeLinecap="round"
                    style={{ strokeDasharray: `${module.progress} 100` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
                  {module.progress}%
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

       <div className="p-8 bg-indigo-950 text-indigo-100 rounded-3xl flex items-center gap-6">
        <div className="p-4 bg-indigo-800 rounded-2xl">
          <BrainCircuit className="w-8 h-8 text-indigo-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {aiSuggestion ? "Optimal Learning Path" : "AI Suggestion"}
          </h3>
          <p className="text-indigo-200 mt-1 whitespace-pre-line">
            {aiSuggestion || "Based on your progress, I can recommend the optimal sequence for your remaining modules. Click the button above to get a personalized roadmap."}
          </p>
        </div>
      </div>
    </div>
  );
}
