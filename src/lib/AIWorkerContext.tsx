import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// Define the state of the AI Worker
interface AIWorkerContextState {
  status: 'idle' | 'loading' | 'ready' | 'error' | 'generating';
  progress: number;
  currentModelId: string | null;
  loadModel: (modelId: string) => void;
  generateText: (text: string, systemPrompt: string, messages?: any[], onDelta?: (delta: string) => void) => Promise<string>;
}

const AIWorkerContext = createContext<AIWorkerContextState | null>(null);

export function AIWorkerProvider({ children }: { children: ReactNode }) {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error' | 'generating'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const resolveGenerateRef = useRef<((value: string) => void) | null>(null);
  const rejectGenerateRef = useRef<((reason?: any) => void) | null>(null);
  const onDeltaRef = useRef<((delta: string) => void) | null>(null);

  useEffect(() => {
    // Initialize the worker once when the provider mounts
    workerRef.current = new Worker(new URL('../app/workers/ai.worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.addEventListener('message', (e) => {
      const data = e.data;
      
      switch (data.status) {
        case 'loading':
          setStatus('loading');
          break;
        case 'progress':
          if (data.progress && data.progress.progress) {
            setProgress(Math.round(data.progress.progress));
          }
          break;
        case 'ready':
          setStatus('ready');
          break;
        case 'generating':
          setStatus('generating');
          break;
        case 'delta':
          if (onDeltaRef.current) {
            onDeltaRef.current(data.result);
          }
          break;
        case 'complete':
          setStatus('ready');
          if (resolveGenerateRef.current) {
            resolveGenerateRef.current(data.result);
            resolveGenerateRef.current = null;
            rejectGenerateRef.current = null;
          }
          break;
        case 'error':
          setStatus('error');
          console.error("Local Model Error:", data.error);
          if (rejectGenerateRef.current) {
            rejectGenerateRef.current(new Error(data.error));
            resolveGenerateRef.current = null;
            rejectGenerateRef.current = null;
          }
          break;
      }
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const loadModel = (modelId: string) => {
    if (workerRef.current) {
      if (currentModelId === modelId && (status === 'ready' || status === 'loading')) {
        return; // Already loading or loaded
      }
      setCurrentModelId(modelId);
      setStatus('loading');
      setProgress(0);
      workerRef.current.postMessage({ type: 'load', modelId });
    }
  };

  const generateText = (text: string, systemPrompt: string, messages?: any[], onDelta?: (delta: string) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }
      
      if (status !== 'ready') {
        reject(new Error("Model is not ready"));
        return;
      }

      resolveGenerateRef.current = resolve;
      rejectGenerateRef.current = reject;
      onDeltaRef.current = onDelta || null;

      workerRef.current.postMessage({
        type: 'generate',
        text,
        systemPrompt,
        messages
      });
    });
  };

  return (
    <AIWorkerContext.Provider value={{ status, progress, currentModelId, loadModel, generateText }}>
      {children}
    </AIWorkerContext.Provider>
  );
}

export function useAIWorker() {
  const context = useContext(AIWorkerContext);
  if (!context) {
    throw new Error("useAIWorker must be used within an AIWorkerProvider");
  }
  return context;
}
