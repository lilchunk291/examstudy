import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  Eraser, 
  Square, 
  Circle, 
  Trash2, 
  Download, 
  Undo, 
  Redo,
  Type,
  X
} from 'lucide-react';

interface WhiteboardProps {
  onClose: () => void;
}

export default function Whiteboard({ onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4f46e5'); // indigo-600
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rect' | 'circle' | 'text'>('pen');
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Initial state
    saveToHistory();
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    }
  }, [color, lineWidth, tool]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    loadFromHistory(newStep);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    loadFromHistory(newStep);
  };

  const loadFromHistory = (step: number) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const img = new Image();
    img.src = history[step];
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    };
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    
    if (tool === 'pen' || tool === 'eraser') {
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const getCoordinates = (event: any) => {
    if (event.touches) {
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - (rect?.left || 0),
        offsetY: event.touches[0].clientY - (rect?.top || 0)
      };
    }
    return {
      offsetX: event.offsetX,
      offsetY: event.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-white/20">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
              {[
                { id: 'pen', icon: PenTool },
                { id: 'eraser', icon: Eraser },
                { id: 'rect', icon: Square },
                { id: 'circle', icon: Circle },
                { id: 'text', icon: Type },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as any)}
                  className={`p-2.5 rounded-xl transition-all ${tool === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                >
                  <t.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
              {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-xs font-bold text-slate-400 w-4">{lineWidth}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={undo} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
              <Undo className="w-5 h-5" />
            </button>
            <button onClick={redo} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
              <Redo className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={clearCanvas} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Clear Canvas">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={downloadImage} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Download Image">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-white cursor-crosshair overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block w-full h-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
