import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Brain,
  Clock,
  Calendar,
  Award,
  Zap,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { getSupabase } from "../../lib/supabase";

export default function Analytics() {
  const [performanceData, setPerformanceData] = useState<any[]>([
    { month: "Jan", score: 75, hours: 45 },
    { month: "Feb", score: 78, hours: 52 },
    { month: "Mar", score: 82, hours: 48 },
    { month: "Apr", score: 85, hours: 60 },
    { month: "May", score: 88, hours: 58 },
    { month: "Jun", score: 90, hours: 65 },
    { month: "Jul", score: 92, hours: 70 },
  ]);

  const [subjectData, setSubjectData] = useState<any[]>([
    { subject: "Calculus", score: 92 },
    { subject: "Physics", score: 88 },
    { subject: "Chemistry", score: 85 },
    { subject: "Biology", score: 90 },
    { subject: "English", score: 87 },
  ]);

  const [studyStyleData, setStudyStyleData] = useState<any[]>([
    { name: "Visual", value: 35 },
    { name: "Auditory", value: 25 },
    { name: "Kinesthetic", value: 20 },
    { name: "Reading", value: 20 },
  ]);

  const [radarData, setRadarData] = useState<any[]>([
    { skill: "Active Recall", value: 90 },
    { skill: "Spaced Repetition", value: 85 },
    { skill: "Interleaving", value: 75 },
    { skill: "Elaboration", value: 80 },
    { skill: "Dual Coding", value: 70 },
    { skill: "Practice Testing", value: 95 },
  ]);

  const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('analytics_metrics').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          data.forEach(item => {
            if (item.type === 'performance') setPerformanceData(item.data);
            if (item.type === 'subject') setSubjectData(item.data);
            if (item.type === 'style') setStudyStyleData(item.data);
            if (item.type === 'radar') setRadarData(item.data);
          });
        } else {
          // Insert initial data
          await supabase.from('analytics_metrics').insert([
            { type: 'performance', data: performanceData },
            { type: 'subject', data: subjectData },
            { type: 'style', data: studyStyleData },
            { type: 'radar', data: radarData }
          ]);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    fetchAnalytics();

    const supabase = getSupabase();
    const analyticsSub = supabase
      .channel('public:analytics_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_metrics' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = payload.new;
          if (item.type === 'performance') setPerformanceData(item.data);
          if (item.type === 'subject') setSubjectData(item.data);
          if (item.type === 'style') setStudyStyleData(item.data);
          if (item.type === 'radar') setRadarData(item.data);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsSub);
    };
  }, []);

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
    hover: { scale: 1.02, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
  };

  return (
    <div className="p-10 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">Analytics</h1>
          <p className="text-lg font-semibold text-slate-400 tracking-tight max-w-3xl leading-relaxed">Track your performance and learning patterns across all blocks</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-white/40 backdrop-blur-3xl border border-white/20 rounded-full p-2 shadow-xl">
            <button className="px-6 py-2 bg-white/80 rounded-full shadow-lg text-sm font-bold tracking-tight text-slate-900">Weekly</button>
            <button className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Monthly</button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full text-base font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5" strokeWidth={3} />
            Generate Report
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
      >
        {[
          { label: "Overall Score", value: "92%", change: "+5%", icon: Target, color: "indigo" },
          { label: "Study Hours", value: "428h", change: "+12%", icon: Clock, color: "blue" },
          { label: "Retention Rate", value: "87%", change: "+3%", icon: Brain, color: "cyan" },
          { label: "Streak Days", value: "45", change: "Keep it up!", icon: Award, color: "emerald" }
        ].map((metric, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group"
          >
            <div className={`absolute -right-16 -top-16 w-56 h-56 bg-${metric.color}-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-${metric.color}-500/20 transition-all duration-700`} />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-${metric.color}-500/10 flex items-center justify-center border border-${metric.color}-500/20 shadow-inner group-hover:scale-110 transition-transform`}>
                <metric.icon className={`w-8 h-8 text-${metric.color}-600`} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <TrendingUp strokeWidth={4} className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{metric.change}</span>
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-slate-900 group-hover:scale-105 transition-transform origin-left">{metric.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{metric.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Performance Trends */}
        <motion.div 
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl space-y-8 group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Performance Trends</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#94a3b8" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} dx={-15} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(60px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                    padding: "16px"
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={6} dot={{ fill: "#6366f1", r: 8, strokeWidth: 4, stroke: "#fff" }} activeDot={{ r: 10, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={6} dot={{ fill: "#3b82f6", r: 8, strokeWidth: 4, stroke: "#fff" }} activeDot={{ r: 10, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject Performance */}
        <motion.div 
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl space-y-8 group"
        >
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Subject Performance</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#94a3b8" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} dx={-15} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(60px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                    padding: "16px"
                  }}
                />
                <Bar dataKey="score" fill="url(#barGradient)" radius={[12, 12, 0, 0]} barSize={60} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Style Distribution */}
        <motion.div 
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl space-y-8 group"
        >
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Learning Style</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studyStyleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {studyStyleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(60px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                    padding: "16px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Technique Mastery */}
        <motion.div 
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl space-y-8 group"
        >
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Technique Mastery</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" fontSize={12} fontWeight={700} />
                <PolarRadiusAxis stroke="#94a3b8" fontSize={12} fontWeight={700} axisLine={false} tick={false} />
                <Radar name="Mastery" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(60px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                    padding: "16px"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/40 backdrop-blur-3xl border border-white/20 p-10 rounded-3xl shadow-xl space-y-10 relative z-10 group"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">AI Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Peak Performance Time", desc: "Your cognitive load is highest between 2-5 PM. Schedule deep work sessions during this time.", icon: Zap, color: "emerald" },
            { title: "Study Pattern", desc: "You perform 15% better with spaced repetition. Try scheduling reviews 1, 3, and 7 days after learning.", icon: Brain, color: "blue" },
            { title: "Goal Achievement", desc: "You're 92% on track to achieve your weekly goal. Keep maintaining your current study streak!", icon: Target, color: "indigo" },
            { title: "Consistency Tip", desc: "Your study consistency drops on weekends. Try scheduling lighter review sessions to maintain momentum.", icon: Calendar, color: "amber" }
          ].map((insight, i) => (
            <div key={i} className={`p-6 rounded-2xl bg-${insight.color}-500/5 border border-${insight.color}-500/10 flex items-start gap-5 group hover:bg-${insight.color}-500/10 transition-all cursor-default relative overflow-hidden shadow-lg`}>
              <div className={`absolute -right-16 -top-16 w-40 h-40 bg-${insight.color}-500/5 blur-3xl rounded-full`} />
              <div className={`w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center border border-white/40 shadow-lg text-${insight.color}-600 shrink-0 relative z-10 group-hover:scale-110 transition-transform`}>
                <insight.icon className="w-6 h-6" strokeWidth={3} />
              </div>
              <div className="space-y-2 relative z-10">
                <div className={`text-lg font-bold tracking-tight text-${insight.color}-900`}>{insight.title}</div>
                <p className={`text-sm font-semibold text-${insight.color}-700/80 leading-relaxed tracking-tight whitespace-pre-wrap`}>
                  {insight.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
