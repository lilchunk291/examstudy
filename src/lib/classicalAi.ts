// Classical AI Planning Engine - Units I-IV
// Combined Topological Sort, Greedy Heuristic, and Q-Learning

export interface Module {
  id: string;
  title: string;
  progress: number;
  status: 'todo' | 'in-progress' | 'completed';
  dependencies: string[]; // IDs of required modules
  difficulty: number; // 1-5 scale
}

// Unit IV: Simple Q-Learning State Table (Persistent in memory for session)
const QTable: Map<string, number> = new Map();

export const getQValue = (moduleId: string): number => QTable.get(moduleId) || 0;

export const updateQValue = (moduleId: string, reward: number) => {
  const alpha = 0.1; // Learning rate
  const currentQ = getQValue(moduleId);
  const newQ = currentQ + alpha * (reward - currentQ);
  QTable.set(moduleId, newQ);
};

// Unit I: Topological Sort for DAG Dependency Management
export const topologicalSort = (modules: Module[]): string[] => {
  const visited = new Set<string>();
  const stack: string[] = [];

  const visit = (id: string) => {
    if (visited.has(id)) return;
    const module = modules.find(m => m.id === id);
    if (!module) return;

    for (const dep of module.dependencies) {
      visit(dep);
    }
    visited.add(id);
    stack.push(id);
  };

  modules.forEach(m => visit(m.id));
  return stack;
};

// Unit I & II: Greedy Heuristic Optimization
// Score = (Difficulty / (Progress + 1)) + Q-Value
export const calculateScore = (module: Module): number => {
  const qValue = getQValue(module.id);
  const progressFactor = module.progress / 100;
  // Heuristic: Prefer difficult, unfinished topics, influenced by learned Q-value
  return (module.difficulty / (progressFactor + 0.1)) + qValue;
};

export const generateClassicalPlan = (modules: Module[]): Module[] => {
  const sortedIds = topologicalSort(modules);
  const todoModules = modules.filter(m => m.status !== 'completed');

  // Filter modules whose prerequisites are done
  const readyModules = todoModules.filter(m => 
    m.dependencies.every(depId => modules.find(m2 => m2.id === depId)?.status === 'completed')
  );

  // Score and Sort
  return readyModules.sort((a, b) => calculateScore(b) - calculateScore(a));
};
