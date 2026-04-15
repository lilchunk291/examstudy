import { motion } from "framer-motion";
import { Link } from "react-router";
import { 
  Sparkles, Lock, Network, Brain, Link as LinkIcon, 
  Lightbulb, Activity, Search, ArrowRight, ShieldCheck, 
  Key, Share2, AtSign, LayoutDashboard, Shield, Database,
  LineChart, FileText
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Inter'] selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden relative">
      
      {/* Global Background Orbs for Neo-Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[160px]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[160px]"></div>
      </div>

      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/40 backdrop-blur-3xl border-b border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/60 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-sm border border-white/40">
              <Shield className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
            </div>
            <div className="text-2xl font-bold tracking-tighter text-slate-900 font-['Manrope']">StudyVault</div>
          </div>
          <div className="hidden md:flex gap-10 items-center">
            <a className="text-indigo-600 border-b-2 border-indigo-500 pb-1 font-['Manrope'] tracking-tight font-bold" href="#">Sanctuary</a>
            <a className="text-slate-500 hover:text-indigo-600 transition-colors font-['Manrope'] tracking-tight font-bold" href="#">Methodology</a>
            <a className="text-slate-500 hover:text-indigo-600 transition-colors font-['Manrope'] tracking-tight font-bold" href="#">Privacy</a>
            <a className="text-slate-500 hover:text-indigo-600 transition-colors font-['Manrope'] tracking-tight font-bold" href="#">The Vault</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-600 font-['Manrope'] tracking-tight font-bold hover:text-indigo-600 transition-all">Log In</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-['Manrope'] font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 duration-200 transition-all">Begin Journey</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 pt-20 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            The Academic Atelier
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter text-slate-900 leading-[0.9] max-w-4xl mb-8 font-['Manrope']"
          >
            The Digital Sanctuary for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Deep Learning</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-12"
          >
            A private architecture for cognitive expansion. We combine the stillness of a library with the precision of AI to build your ultimate knowledge ecosystem.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-20"
          >
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-200 hover:-translate-y-1 transition-transform flex items-center justify-center">
              Begin Your Journey
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white/60 backdrop-blur-md border border-white/40 text-slate-900 rounded-2xl text-lg font-bold hover:bg-white/80 shadow-sm transition-colors flex items-center justify-center">
              Explore The Vault
            </Link>
          </motion.div>

          {/* Floating Glass Dashboard (Replaced Image with Abstract UI) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative w-full max-w-6xl aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/60 bg-white/40 backdrop-blur-3xl group flex"
          >
            {/* Abstract UI Sidebar */}
            <div className="w-64 h-full border-r border-white/40 bg-white/20 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="h-4 w-24 bg-slate-200/50 rounded-full"></div>
              </div>
              <div className="space-y-4 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-200/50"></div>
                    <div className="h-3 w-32 bg-slate-200/50 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abstract UI Main Content */}
            <div className="flex-1 p-10 flex flex-col gap-8 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none z-0"></div>
              
              {/* Header */}
              <div className="flex justify-between items-center z-10">
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-slate-200/80 rounded-full"></div>
                  <div className="h-4 w-32 bg-slate-200/50 rounded-full"></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 border border-white/40"></div>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200"></div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 gap-6 z-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/50 border border-white/40 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-slate-200/80 rounded-full"></div>
                      <div className="h-4 w-24 bg-slate-300/80 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Chart Area */}
              <div className="flex-1 bg-white/50 border border-white/40 rounded-2xl p-6 z-10 flex flex-col">
                <div className="h-4 w-32 bg-slate-200/80 rounded-full mb-6"></div>
                <div className="flex-1 flex items-end gap-4">
                  {[40, 70, 45, 90, 65, 80, 55, 100].map((height, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-lg relative group-hover:bg-indigo-500/30 transition-colors" style={{ height: `${height}%` }}>
                      <div className="absolute bottom-0 left-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-1000" style={{ height: `${height * 0.6}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Glass Overlays (Floating Elements) */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-8 w-64 p-6 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 z-20"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Sync Active</div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
                </div>
                <div className="h-2 w-4/5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-8 w-80 p-8 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 z-20"
            >
              <div className="flex justify-between items-end gap-3">
                <div className="h-16 w-10 bg-indigo-500/20 rounded-t-xl"></div>
                <div className="h-24 w-10 bg-indigo-500 rounded-t-xl shadow-lg shadow-indigo-500/30"></div>
                <div className="h-12 w-10 bg-purple-400 rounded-t-xl"></div>
                <div className="h-20 w-10 bg-emerald-400 rounded-t-xl"></div>
              </div>
              <p className="mt-6 text-sm font-bold text-slate-800">Cognitive Load Index</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Bento Grid (Rapida Style + Neo Glassmorphism) */}
        <section className="px-8 py-32 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 font-['Manrope']">An Architecture for Genius</h2>
              <p className="text-slate-500 max-w-xl text-lg font-medium mx-auto md:mx-0">Move beyond scattered notes. We offer tools designed for the physiological limits of focus and the infinite potential of human logic.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
              {/* Bento Card 1: Privacy Vault */}
              <div className="md:col-span-8 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300 shadow-xl shadow-slate-200/50">
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 shadow-sm border border-indigo-50">
                    <Lock className="text-indigo-600 w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-extrabold mb-4 font-['Manrope'] text-slate-900">Privacy Vault</h3>
                  <p className="text-slate-500 max-w-md text-lg font-medium leading-relaxed">
                    Your thoughts are your most valuable asset. Our Zero-Knowledge sanctuary ensures that only you hold the keys to your cognitive data. Not even our AI can "see" without your explicit consent.
                  </p>
                </div>
                {/* Abstract CSS Visualization instead of Image */}
                <div className="mt-12 h-64 bg-slate-50/50 rounded-3xl overflow-hidden relative flex items-center justify-center border border-white/80 shadow-inner">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="relative z-10 w-32 h-32 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white">
                    <ShieldCheck className="w-12 h-12 text-indigo-500" />
                    {/* Orbiting dots */}
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute w-40 h-40 rounded-full border border-indigo-500/20 border-dashed"></motion.div>
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute w-48 h-48 rounded-full border border-purple-500/20 border-dashed"></motion.div>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: AI Workflow Builder */}
              <div className="md:col-span-4 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 shadow-xl shadow-slate-200/50">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 shadow-sm border border-purple-50">
                    <Network className="text-purple-600 w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-extrabold mb-4 font-['Manrope'] text-slate-900">AI Workflow Builder</h3>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    Construct custom logic nodes that summarize, cross-reference, and synthesize your library into actionable insights.
                  </p>
                </div>
                <div className="flex -space-x-4 mt-8 justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center shadow-lg z-30 transform group-hover:-translate-y-2 transition-transform duration-300">
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-purple-50 flex items-center justify-center shadow-lg z-20 transform group-hover:-translate-y-2 transition-transform duration-300 delay-75">
                    <LinkIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-emerald-50 flex items-center justify-center shadow-lg z-10 transform group-hover:-translate-y-2 transition-transform duration-300 delay-150">
                    <Lightbulb className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Cognitive Load */}
              <div className="md:col-span-5 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 shadow-xl shadow-slate-200/50">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 shadow-sm border border-emerald-50">
                    <Activity className="text-emerald-600 w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-extrabold mb-4 font-['Manrope'] text-slate-900">Cognitive Load Tracking</h3>
                  <p className="text-slate-500 text-lg font-medium mb-8 leading-relaxed">
                    We monitor your mental fatigue levels based on reading speed and complexity, suggesting the optimal time to pivot or rest.
                  </p>
                </div>
                <div className="mt-auto h-48 bg-slate-50/50 border border-white/80 rounded-3xl p-6 flex items-end justify-between gap-3 shadow-inner">
                  {[20, 40, 75, 100, 60].map((height, i) => (
                    <div key={i} className="w-full bg-emerald-500/20 rounded-lg relative group-hover:bg-emerald-500/30 transition-colors" style={{ height: '100%' }}>
                       <div className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-lg transition-all duration-500" style={{ height: `${height}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bento Card 4: Global Index */}
              <div className="md:col-span-7 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col justify-center text-center items-center hover:-translate-y-1 transition-transform duration-300 shadow-xl shadow-slate-200/50">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6 shadow-sm border border-amber-50">
                  <Database className="text-amber-600 w-7 h-7" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 font-['Manrope'] text-slate-900">The Global Index</h3>
                <p className="text-slate-500 max-w-lg text-lg font-medium mb-10 leading-relaxed">
                  Search through your entire mental history in milliseconds with semantic retrieval that understands context, not just keywords.
                </p>
                <div className="w-full max-w-md h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center px-6 gap-4 shadow-lg border border-white">
                  <Search className="w-6 h-6 text-indigo-500" />
                  <div className="text-slate-400 font-medium text-lg">Search your second brain...</div>
                  <div className="ml-auto flex gap-1">
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-500">⌘</kbd>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-500">K</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="px-8 py-32 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              {/* Replaced Image with Glassmorphic Composition */}
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden relative shadow-2xl bg-white/40 backdrop-blur-3xl border border-white/60 flex items-center justify-center p-8 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <div className="w-full h-full rounded-[2rem] border border-white/80 bg-white/40 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-colors duration-700"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl group-hover:bg-purple-400/30 transition-colors duration-700"></div>
                  
                  <div className="relative z-10 w-24 h-24 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="w-10 h-10 text-indigo-600" />
                  </div>
                  
                  <div className="space-y-4 w-3/4 relative z-10">
                    <div className="h-3 w-full bg-slate-200/80 rounded-full"></div>
                    <div className="h-3 w-5/6 bg-slate-200/80 rounded-full mx-auto"></div>
                    <div className="h-3 w-4/6 bg-slate-200/80 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                Philosophy
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-['Manrope'] text-slate-900">
                Quiet Tools for <br/>Loud Ambitions.
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                We believe the modern web is designed to distract. To innovate, one needs a sanctuary—a place where the friction between thought and realization is removed.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed opacity-80">
                StudyVault isn't just an app; it's an "Academic Atelier." We provide the heavy-weight digital paper and the precision-engineered ink. Your mind does the rest.
              </p>
              <div className="pt-4">
                <a className="inline-flex items-center gap-3 group px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all" href="#">
                  <span className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Read the Methodology</span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security Section (Glassmorphic Dark Mode) */}
        <section className="px-8 py-32 bg-slate-900 text-slate-100 overflow-hidden relative rounded-t-[4rem] mt-12 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-['Manrope'] text-white">Security as a Serene Baseline.</h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed">We don't talk about encryption to scare you. We talk about it to reassure you that your sanctuary is impenetrable.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="text-2xl font-bold font-['Manrope'] mb-4 text-white">End-to-End Quiet</h4>
                <p className="text-slate-400 leading-relaxed font-medium">Every keystroke is encrypted before it leaves your device. We can't read it, even if we wanted to.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <Database className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-2xl font-bold font-['Manrope'] mb-4 text-white">Local-First Logic</h4>
                <p className="text-slate-400 leading-relaxed font-medium">Processing happens on your machine whenever possible, ensuring zero latency and maximum cognitive privacy.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-2xl font-bold font-['Manrope'] mb-4 text-white">The Audit Trail</h4>
                <p className="text-slate-400 leading-relaxed font-medium">Full transparency into how your data is handled. Open-source core components for public verification.</p>
              </div>
            </div>

            {/* Encryption Graphic */}
            <div className="mt-20 p-12 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center gap-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
              <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold tracking-widest uppercase text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  System Status: Secure
                </div>
                <div className="text-4xl font-['Manrope'] font-extrabold text-white">Military-Grade but Mindful.</div>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">AES-256 GCM encryption protects your vault. It's the highest standard in existence, delivered with a whisper.</p>
              </div>
              <div className="flex-shrink-0 flex gap-4 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md">
                  <Key className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md">
                  <Lock className="w-10 h-10 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-40 text-center bg-slate-900 relative">
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 text-white leading-[1.1] font-['Manrope']">Ready to find your focus?</h2>
            <p className="text-xl text-slate-400 mb-12 font-medium">Join 12,000+ academics and builders in the Cognitive Sanctuary.</p>
            <Link to="/register" className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-2xl text-xl font-bold shadow-xl shadow-indigo-500/20 hover:-translate-y-1 hover:shadow-indigo-500/40 transition-all active:translate-y-0 duration-200">
              Begin Your Journey
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 bg-slate-950 border-t border-white/10 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-500" />
              <div className="font-['Manrope'] font-bold text-white text-2xl tracking-tighter">StudyVault</div>
            </div>
            <p className="font-['Inter'] text-sm tracking-wide uppercase opacity-60 max-w-xs text-center md:text-left font-semibold">© 2026 StudyVault. The Academic Atelier for Cognitive Privacy.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <a className="font-['Inter'] text-sm tracking-wide uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors" href="#">Philosophy</a>
            <a className="font-['Inter'] text-sm tracking-wide uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors" href="#">Security Audit</a>
            <a className="font-['Inter'] text-sm tracking-wide uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors" href="#">Terms of Sanctuary</a>
            <a className="font-['Inter'] text-sm tracking-wide uppercase font-bold text-slate-500 hover:text-indigo-400 transition-colors" href="#">Contact Author</a>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-all">
              <AtSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
