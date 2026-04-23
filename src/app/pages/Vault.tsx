import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Lock, 
  Search, 
  Filter,
  FileText,
  Image,
  File,
  Folder,
  Upload,
  MoreVertical,
  Star,
  Clock,
  ChevronRight,
  Shield,
  Zap,
  HardDrive,
  Activity
} from "lucide-react";
import { getSupabase } from "../../lib/supabase";

const folders = [
  { name: "Calculus", files: 24, color: "indigo" },
  { name: "Physics", files: 18, color: "blue" },
  { name: "Chemistry", files: 15, color: "emerald" },
  { name: "Biology", files: 12, color: "orange" },
];

const recentFiles = [
  { name: "Differential Equations Notes.pdf", type: "pdf", size: "2.4 MB", date: "2 hours ago", starred: true },
  { name: "Thermodynamics Formula Sheet.pdf", type: "pdf", size: "1.8 MB", date: "5 hours ago", starred: false },
  { name: "Organic Chemistry Diagrams.png", type: "image", size: "856 KB", date: "1 day ago", starred: true },
  { name: "Practice Test Solutions.docx", type: "doc", size: "3.2 MB", date: "2 days ago", starred: false },
  { name: "Lab Report Template.docx", type: "doc", size: "124 KB", date: "3 days ago", starred: false },
  { name: "Study Schedule.xlsx", type: "sheet", size: "64 KB", date: "1 week ago", starred: true },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-7 h-7 text-rose-500" strokeWidth={2.5} />;
    case "image":
      return <Image className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />;
    default:
      return <File className="w-7 h-7 text-slate-400" strokeWidth={2.5} />;
  }
};

export default function Vault() {
  const [folders, setFolders] = useState<any[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getSupabase();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
        
        const [foldersResponse, filesResponse] = await Promise.all([
          supabase.from('vault_folders').select('*').order('created_at', { ascending: true }),
          supabase.from('vault_files').select('*').order('created_at', { ascending: false })
        ]);

        if (foldersResponse.error) throw foldersResponse.error;
        if (filesResponse.error) throw filesResponse.error;

        if (foldersResponse.data) {
          setFolders(foldersResponse.data);
        }

        if (filesResponse.data) {
          setRecentFiles(filesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching vault data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    const supabase = getSupabase();
    
    const foldersSub = supabase
      .channel('public:vault_folders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_folders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setFolders(current => [...current, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setFolders(current => current.map(f => f.id === payload.new.id ? payload.new : f));
        } else if (payload.eventType === 'DELETE') {
          setFolders(current => current.filter(f => f.id !== payload.old.id));
        }
      })
      .subscribe();

    const filesSub = supabase
      .channel('public:vault_files')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_files' }, payload => {
        if (payload.eventType === 'INSERT') {
          setRecentFiles(current => [payload.new, ...current]);
        } else if (payload.eventType === 'UPDATE') {
          setRecentFiles(current => current.map(f => f.id === payload.new.id ? payload.new : f));
        } else if (payload.eventType === 'DELETE') {
          setRecentFiles(current => current.filter(f => f.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(foldersSub);
      supabase.removeChannel(filesSub);
    };
  }, []);

  const handleCreateFolder = async () => {
    const folderName = window.prompt("Enter directory name:", "New Research Archive");
    if (!folderName) return;

    const newFolder = {
      name: folderName,
      color: ["indigo", "blue", "emerald", "orange", "rose"][Math.floor(Math.random() * 5)],
      user_id: user?.id || null
    };
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('vault_folders').insert([newFolder]);
      if (error) throw error;
      toast.success(`Directory "${folderName}" created.`);
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error(`Failed to create directory: ${error.message}`);
    }
  };

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const processUpload = async (file: File) => {
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const supabase = getSupabase();
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      let typeStr = "unknown";
      if (['pdf'].includes(fileExt)) typeStr = "pdf";
      else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExt)) typeStr = "image";
      else if (['doc', 'docx'].includes(fileExt)) typeStr = "doc";
      else if (['xls', 'xlsx', 'csv'].includes(fileExt)) typeStr = "sheet";
      
      const newFile: any = {
        name: file.name,
        type: typeStr,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        starred: false,
        user_id: user?.id || null
      };

      try {
        const filePath = `user_uploads/${Date.now()}_${file.name}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('vault')
          .upload(filePath, file);
        
        if (!storageError && storageData) {
           newFile.url = storageData.path;
        }
      } catch (storageException) {
         console.warn("Storage exception:", storageException);
      }

      const { error: insertError } = await supabase.from('vault_files').insert([newFile]);
      
      if (insertError) throw insertError;

      toast.success(`${file.name} added to archives successfully.`, { id: toastId });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to add resource: ${error.message || 'Unknown error'}`, { id: toastId });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processUpload(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  }, [user]);

  const toggleStar = async (fileId: string, currentStatus: boolean) => {
    try {
      const supabase = getSupabase();
      await supabase.from('vault_files').update({ starred: !currentStatus }).eq('id', fileId);
    } catch (error) {
      console.error("Error toggling star:", error);
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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      transition: { type: "spring" as const, stiffness: 300, damping: 20 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-8 space-y-12 max-w-[1600px] mx-auto relative overflow-hidden transition-colors ${isDragging ? 'bg-indigo-50/50 ring-4 ring-indigo-500/20 rounded-[3rem]' : ''}`}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-indigo-600/90 backdrop-blur-xl p-12 rounded-[3.5rem] shadow-2xl border-4 border-indigo-400/50 flex flex-col items-center gap-6 animate-in zoom-in duration-300">
             <Upload className="w-16 h-16 text-white animate-bounce" />
             <span className="text-2xl font-black text-white uppercase tracking-widest">Release to Decrypt Archive</span>
          </div>
        </div>
      )}
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight drop-shadow-sm">Knowledge Vault</h1>
          <p className="text-slate-500 font-semibold tracking-tight text-base max-w-3xl leading-relaxed">Secure end-to-end encrypted storage protocol for your academic archives.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUploadFile}
          className="flex items-center gap-6 px-8 py-4 bg-indigo-600 text-white rounded-full text-base font-bold tracking-tight shadow-xl shadow-indigo-200 transition-all"
        >
          <Upload className="w-6 h-6" strokeWidth={3} />
          Upload Archive
        </motion.button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-10 relative z-10"
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={3} />
          <input
            type="text"
            placeholder="Search your encrypted archives..."
            className="w-full pl-16 pr-8 py-4 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-2xl text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 shadow-xl transition-all"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-6 px-8 py-4 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-2xl text-slate-700 hover:bg-white/60 transition-all shadow-xl"
        >
          <Filter className="w-6 h-6" strokeWidth={3} />
          <span className="font-bold tracking-tight text-base">Filter</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-20">
          {/* Folders Grid */}
          <section className="space-y-12">
            <div className="flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                  <Folder strokeWidth={3} className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Active Directories</h3>
              </div>
              <button className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {folders.map((folder) => (
                <motion.div
                  key={folder.id || folder.name}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white/40 backdrop-blur-3xl border border-white/20 p-8 rounded-3xl shadow-xl group cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute -right-24 -top-24 w-80 h-80 bg-${folder.color}-500/10 blur-[140px] rounded-full pointer-events-none group-hover:bg-${folder.color}-500/20 transition-all duration-700`} />
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-${folder.color}-500/10 flex items-center justify-center border border-${folder.color}-500/20 shadow-inner group-hover:scale-110 transition-transform`}>
                      <Folder className={`w-8 h-8 text-${folder.color}-600`} strokeWidth={3} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCreateFolder(); }} className="p-3 text-slate-400 hover:text-slate-600 transition-colors bg-white/40 rounded-xl border border-white/40">
                      <MoreVertical className="w-6 h-6" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="relative z-10">
                    <div className="text-base font-bold tracking-tight text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{folder.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">{folder.files || 0} Documents</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Recent Files */}
          <section className="space-y-10">
            <div className="flex items-center gap-6 px-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <Activity strokeWidth={3} className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Recent Decryptions</h3>
            </div>
            <div className="space-y-6">
              {recentFiles.map((file, index) => (
                <motion.div
                  key={file.id || index}
                  variants={cardVariants}
                  whileHover="hover"
                  onClick={() => {
                    if (file.url) {
                      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxtcoslcgepyfjnsiciz.supabase.co';
                      window.open(`${supabaseUrl}/storage/v1/object/public/vault/${file.url}`, '_blank');
                    }
                  }}
                  className="flex items-center gap-8 p-6 rounded-3xl bg-white/40 backdrop-blur-3xl border border-white/20 hover:bg-white/60 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center border border-white/60 shadow-inner group-hover:scale-105 transition-transform">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">{file.name}</div>
                    <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4">
                      <span className="bg-white/40 px-4 py-2 rounded-full border border-white/40 shadow-sm">{file.size}</span>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-indigo-500" strokeWidth={3} />
                        <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : file.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <motion.button 
                      onClick={(e) => { e.stopPropagation(); toggleStar(file.id, file.starred); }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-xl transition-all border shadow-lg ${file.starred ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-slate-300 bg-white/40 border-white/40 hover:text-amber-500"}`}
                    >
                      <Star className={`w-6 h-6 ${file.starred ? "fill-current" : ""}`} strokeWidth={3} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 text-slate-400 hover:text-slate-900 bg-white/40 border border-white/40 rounded-xl transition-all shadow-lg"
                    >
                      <MoreVertical className="w-6 h-6" strokeWidth={3} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-16">
          {/* Storage Information */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden"
          >
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                  <HardDrive strokeWidth={3} className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Archive Storage</div>
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-900 leading-none">4.8<span className="text-base text-slate-300 ml-2">GB</span></div>
              <div className="text-base font-bold text-slate-400 tracking-tight">Current utilization of your vault</div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="h-8 bg-white/60 rounded-full overflow-hidden border border-white/60 p-1.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "32%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-xl shadow-indigo-200" 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">
                <span>32% Occupied</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
