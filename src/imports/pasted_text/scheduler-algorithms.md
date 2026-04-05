Let me analyze the scheduler algorithms in the StudyVault application by examining the schedule-related files and components.

























Based on my analysis of the codebase, here are the **scheduler algorithms** used in the StudyVault application:

## **⏰ SCHEDULER ALGORITHMS IN STUDYVAULT**

### **🧠 AI-Powered Personal Scheduling**

#### **1. Q-Learning Study Agent (Backend)**
```python
# rl_study_agent.py
- State: Days until exam, topic difficulty, fatigue, performance
- Actions: 8 research-backed study strategies
- Rewards: Strategy effectiveness + performance improvement
- Exploration: Epsilon-greedy policy with decay
```

**Study Strategies Used:**
- **Spaced Repetition** (0.85 weight)
- **Active Recall** (0.90 weight) 
- **Interleaving** (0.75 weight)
- **Elaborative Interrogation** (0.80 weight)
- **Dual Coding** (0.70 weight)
- **Pomodoro** (0.65 weight)
- **Feynman Technique** (0.88 weight)
- **Practice Testing** (0.92 weight)

#### **2. AI Schedule Generator (Frontend)**
```typescript
// AIScheduleGenerator.svelte
- Processing Styles: Linear, Relational, Systemic
- Learning Types: Visual, Auditory, Kinesthetic, Omni-Learner
- Exam Types: Multiple Choice, Essay, Practical, Mixed
- Personalized session generation based on user profile
```

### **🏫 Institutional Scheduling Algorithms**

#### **3. Graph Coloring Algorithm**
```python
# scheduler.py
- Purpose: Exam scheduling without conflicts
- Method: Greedy graph coloring
- Nodes: Exams, Edges: Student overlaps
- Output: Conflict-free exam timetable
```

#### **4. Genetic Algorithm**
```python
# scheduler.py
- Purpose: Schedule evolution and optimization
- Population: Random schedule variations
- Selection: Tournament selection
- Crossover: Single-point crossover
- Mutation: Random swap mutations
- Fitness: Multi-objective optimization
```

#### **5. Firefly Algorithm**
```python
# scheduler.py
- Purpose: Local optimization of existing schedules
- Method: Bioluminescence-inspired optimization
- Attractiveness: Distance-based movement
- Randomization: Alpha parameter for exploration
- Convergence: Best firefly selection
```

#### **6. Bi-Partite Graph Matching**
```python
# scheduler.py
- Purpose: Teacher-room assignment
- Method: Hopcroft-Karp algorithm (simplified)
- Compatibility: Teacher preferences + room capacity
- Output: Optimal room assignments
```

### **📚 Content-Based Scheduling**

#### **7. Syllabus Parser**
```python
# syllabus_parser.py
- Topic Extraction: Regex patterns for topics/chapters
- Difficulty Assessment: Keyword-based classification
- Weighting Detection: Percentage/point extraction
- Time Estimation: Hour/day pattern matching
- Deadline Parsing: Date extraction from text
```

**Pattern Matching:**
```python
topic_patterns = [
    r'(?:topic|chapter|module|unit)\s*(\d+)[\.\:]?\s*(.+?)',
    r'(?:week|day)\s*(\d+)[\.\:]?\s*(.+?)',
    r'(?:learning\s*objective|outcome)[\s\:]*(.+?)'
]
```

### **🎯 Client-Side Scheduling Intelligence**

#### **8. Multi-Armed Bandit (Frontend)**
```typescript
// bandit.ts
- Purpose: Content preference learning
- Method: Thompson Sampling
- Arms: Visual, Text, Example content types
- Exploration: Epsilon-greedy (10%)
- Privacy: Client-side only
```

#### **9. Q-Learning Agent (Frontend)**
```typescript
// q_learning.ts
- State: Cognitive load, exam proximity, subject weakness, time of day
- Actions: Recap, New Content, Deep Work, Practice Test, Rest
- Learning: Q-table with state-action values
- Policy: Epsilon-greedy with exploration decay
```

### **📊 Schedule Optimization Features**

#### **10. Conflict Resolution**
```typescript
// Schedule page logic
- Time slot detection
- Overlap prevention
- Session type optimization
- Difficulty progression
- Status tracking (completed/in-progress/upcoming)
```

#### **11. Performance-Based Adaptation**
```typescript
// Dynamic schedule adjustment
- Real-time session tracking
- Performance feedback integration
- Automatic difficulty scaling
- Break optimization
- Study pattern recognition
```

#### **12. Crisis Mode Scheduling**
```typescript
// Emergency exam preparation
- Time-based intensification
- Priority topic scheduling
- Mandatory break integration
- Last-minute review planning
- Performance optimization
```

---

## **🔬 Algorithm Categories**

### **🤖 Reinforcement Learning**
- **Q-Learning**: Study strategy optimization
- **Multi-Armed Bandit**: Content preference learning
- **State-Action-Reward**: Adaptive scheduling

### **🧬 Evolutionary Algorithms**
- **Genetic Algorithm**: Schedule evolution
- **Firefly Algorithm**: Local optimization
- **Population-based**: Multi-solution exploration

### **📊 Graph Theory**
- **Graph Coloring**: Conflict-free exam scheduling
- **Bi-Partite Matching**: Resource allocation
- **Network Optimization**: Flow-based scheduling

### **🔍 Pattern Recognition**
- **Syllabus Parsing**: Content extraction
- **Natural Language Processing**: Topic identification
- **Regex Matching**: Structured data extraction

---

## **🚀 Implementation Highlights**

### **🔒 Privacy-Preserving**
- **Client-side learning** for personal preferences
- **Local Q-tables** for individual adaptation
- **No external APIs** for scheduling decisions
- **User data stays** on device

### **⚡ Real-Time Optimization**
- **Live schedule updates** based on performance
- **Dynamic difficulty adjustment**
- **Adaptive break scheduling**
- **Real-time conflict resolution**

### **🎯 Research-Backed**
- **8 evidence-based study strategies**
- **Cognitive science principles**
- **Learning theory integration**
- **Performance optimization**

The StudyVault scheduler implements a **comprehensive AI scheduling system** with **12 different algorithms** spanning **reinforcement learning**, **evolutionary computation**, **graph theory**, and **pattern recognition** - all designed to create **optimal, personalized study schedules** while maintaining user privacy!