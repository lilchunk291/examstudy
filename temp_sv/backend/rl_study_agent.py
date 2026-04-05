#!/usr/bin/env python3
"""
RL Study Plan Agent - Section 4.4
Q-learning with 8 research-backed strategies
"""

import numpy as np
import json
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import random

# Research-backed study strategies
class StudyStrategy(Enum):
    SPACED_REPETITION = "spaced_repetition"
    ACTIVE_RECALL = "active_recall"
    INTERLEAVING = "interleaving"
    ELABORATIVE_INTERROGATION = "elaborative_interrogation"
    DUAL_CODING = "dual_coding"
    POMODORO = "pomodoro"
    Feynman_TECHNIQUE = "feynman_technique"
    PRACTICE_TESTING = "practice_testing"

@dataclass
class StudyState:
    """Current state of the study system"""
    days_until_exam: int
    current_topic_difficulty: float
    student_fatigue: float
    previous_performance: float
    time_available: int  # minutes
    topic_mastery: Dict[str, float]

@dataclass
class StudyAction:
    """Action to take in study planning"""
    strategy: StudyStrategy
    topic: str
    duration: int  # minutes
    difficulty_level: float

class QLearningAgent:
    """Q-learning agent for study plan optimization"""
    
    def __init__(self, learning_rate=0.1, discount_factor=0.95, epsilon=0.1):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon  # Exploration rate
        
        # Q-table: state -> action -> value
        self.q_table = {}
        
        # Strategy effectiveness weights (from research)
        self.strategy_weights = {
            StudyStrategy.SPACED_REPETITION: 0.85,
            StudyStrategy.ACTIVE_RECALL: 0.90,
            StudyStrategy.INTERLEAVING: 0.75,
            StudyStrategy.ELABORATIVE_INTERROGATION: 0.80,
            StudyStrategy.DUAL_CODING: 0.70,
            StudyStrategy.POMODORO: 0.65,
            StudyStrategy.Feynman_TECHNIQUE: 0.88,
            StudyStrategy.PRACTICE_TESTING: 0.92
        }
        
        # Initialize Q-table with small random values
        self._initialize_q_table()
    
    def _initialize_q_table(self):
        """Initialize Q-table with small random values"""
        # Discretize state space for manageable Q-table
        urgency_levels = ['critical', 'urgent', 'moderate', 'relaxed']
        fatigue_levels = ['high', 'medium', 'low']
        performance_levels = ['poor', 'average', 'good']
        
        for urgency in urgency_levels:
            for fatigue in fatigue_levels:
                for performance in performance_levels:
                    state_key = f"{urgency}_{fatigue}_{performance}"
                    self.q_table[state_key] = {}
                    
                    # Initialize all strategy-action combinations
                    for strategy in StudyStrategy:
                        self.q_table[state_key][strategy.value] = np.random.uniform(0.1, 0.3)
    
    def _discretize_state(self, state: StudyState) -> str:
        """Convert continuous state to discrete state key"""
        # Urgency based on days until exam
        if state.days_until_exam <= 1:
            urgency = 'critical'
        elif state.days_until_exam <= 3:
            urgency = 'urgent'
        elif state.days_until_exam <= 7:
            urgency = 'moderate'
        else:
            urgency = 'relaxed'
        
        # Fatigue level
        if state.student_fatigue >= 0.8:
            fatigue = 'high'
        elif state.student_fatigue >= 0.5:
            fatigue = 'medium'
        else:
            fatigue = 'low'
        
        # Performance level
        if state.previous_performance <= 0.4:
            performance = 'poor'
        elif state.previous_performance <= 0.7:
            performance = 'average'
        else:
            performance = 'good'
        
        return f"{urgency}_{fatigue}_{performance}"
    
    def get_state_action_values(self, state: StudyState) -> Dict[StudyStrategy, float]:
        """Get Q-values for all actions in current state"""
        state_key = self._discretize_state(state)
        return self.q_table.get(state_key, {})
    
    def select_action(self, state: StudyState, available_actions: List[StudyAction]) -> StudyAction:
        """Select action using epsilon-greedy policy"""
        if np.random.random() < self.epsilon:
            # Exploration: random action
            return np.random.choice(available_actions)
        
        # Exploitation: best action
        state_action_values = self.get_state_action_values(state)
        
        if not state_action_values:
            return np.random.choice(available_actions)
        
        # Find best action from available ones
        best_action = None
        best_value = -np.inf
        
        for action in available_actions:
            q_value = state_action_values.get(action.strategy.value, 0)
            
            # Add strategy weight as prior
            adjusted_value = q_value + self.strategy_weights.get(action.strategy, 0.5)
            
            if adjusted_value > best_value:
                best_value = adjusted_value
                best_action = action
        
        return best_action or np.random.choice(available_actions)
    
    def update_q_value(self, state: StudyState, action: StudyAction, reward: float, next_state: StudyState):
        """Update Q-value using Q-learning update rule"""
        state_key = self._discretize_state(state)
        next_state_key = self._discretize_state(next_state)
        
        # Current Q-value
        current_q = self.q_table.get(state_key, {}).get(action.strategy.value, 0)
        
        # Maximum Q-value for next state
        next_q_values = self.q_table.get(next_state_key, {})
        max_next_q = max(next_q_values.values()) if next_q_values else 0
        
        # Q-learning update rule
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        
        # Update Q-table
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        self.q_table[state_key][action.strategy.value] = new_q
        
        # Decay epsilon over time
        self.epsilon = max(0.01, self.epsilon * 0.995)
    
    def calculate_reward(self, action: StudyAction, state: StudyState, performance_improvement: float) -> float:
        """Calculate reward for taking action"""
        reward = 0.0
        
        # Strategy effectiveness reward
        strategy_reward = self.strategy_weights.get(action.strategy, 0.5)
        reward += strategy_reward * 0.4
        
        # Performance improvement reward
        reward += performance_improvement * 0.3
        
        # Difficulty matching reward
        difficulty_match = 1.0 - abs(action.difficulty_level - state.current_topic_difficulty)
        reward += difficulty_match * 0.2
        
        # Time efficiency reward
        optimal_duration = self._get_optimal_duration(action.strategy, state)
        duration_efficiency = 1.0 - abs(action.duration - optimal_duration) / optimal_duration
        reward += duration_efficiency * 0.1
        
        return reward
    
    def _get_optimal_duration(self, strategy: StudyStrategy, state: StudyState) -> int:
        """Get optimal duration for strategy based on state"""
        base_durations = {
            StudyStrategy.SPACED_REPETITION: 25,
            StudyStrategy.ACTIVE_RECALL: 20,
            StudyStrategy.INTERLEAVING: 30,
            StudyStrategy.ELABORATIVE_INTERROGATION: 35,
            StudyStrategy.DUAL_CODING: 40,
            StudyStrategy.POMODORO: 25,
            StudyStrategy.Feynman_TECHNIQUE: 30,
            StudyStrategy.PRACTICE_TESTING: 45
        }
        
        base_duration = base_durations.get(strategy, 30)
        
        # Adjust for fatigue
        if state.student_fatigue > 0.7:
            base_duration = int(base_duration * 0.7)
        elif state.student_fatigue > 0.4:
            base_duration = int(base_duration * 0.85)
        
        # Adjust for urgency
        if state.days_until_exam <= 3:
            base_duration = int(base_duration * 1.2)
        
        return max(10, min(60, base_duration))

class StudyPlanGenerator:
    """Main study plan generator using RL agent"""
    
    def __init__(self):
        self.agent = QLearningAgent()
        self.session_history = []
    
    def generate_study_plan(self, topics: List[Dict], exam_date: datetime, 
                         student_profile: Dict) -> Dict:
        """Generate optimized study plan using Q-learning"""
        
        # Calculate initial state
        days_until_exam = (exam_date - datetime.now()).days
        current_state = StudyState(
            days_until_exam=days_until_exam,
            current_topic_difficulty=5.0,  # Average difficulty
            student_fatigue=student_profile.get('fatigue', 0.3),
            previous_performance=student_profile.get('performance', 0.6),
            time_available=student_profile.get('daily_study_time', 120),
            topic_mastery={}
        )
        
        # Generate study actions
        study_actions = self._generate_study_actions(topics, current_state)
        
        # Generate plan using RL
        plan = self._generate_rl_plan(study_actions, current_state, topics)
        
        # Optimize plan with constraints
        optimized_plan = self._optimize_plan(plan, current_state, student_profile)
        
        return {
            'plan': optimized_plan,
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'days_until_exam': days_until_exam,
                'total_topics': len(topics),
                'strategies_used': list(set(action['strategy'] for action in optimized_plan)),
                'q_table_size': len(self.agent.q_table)
            }
        }
    
    def _generate_study_actions(self, topics: List[Dict], state: StudyState) -> List[StudyAction]:
        """Generate possible study actions"""
        actions = []
        
        for topic in topics:
            for strategy in StudyStrategy:
                # Calculate appropriate difficulty and duration
                difficulty = topic.get('difficulty', 5.0)
                duration = self.agent._get_optimal_duration(strategy, state)
                
                action = StudyAction(
                    strategy=strategy,
                    topic=topic['name'],
                    duration=duration,
                    difficulty_level=difficulty
                )
                actions.append(action)
        
        return actions
    
    def _generate_rl_plan(self, actions: List[StudyAction], initial_state: StudyState, 
                        topics: List[Dict]) -> List[Dict]:
        """Generate plan using Q-learning policy"""
        plan = []
        current_state = initial_state
        remaining_topics = topics.copy()
        
        # Generate plan for each day until exam
        for day in range(min(initial_state.days_until_exam, 14)):
            daily_plan = {
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'sessions': []
            }
            
            # Plan sessions for the day
            daily_time_used = 0
            max_daily_time = current_state.time_available
            
            while daily_time_used < max_daily_time and remaining_topics:
                # Select action using Q-learning
                available_actions = [a for a in actions if a.topic in [t['name'] for t in remaining_topics]]
                
                if not available_actions:
                    break
                
                selected_action = self.agent.select_action(current_state, available_actions)
                
                # Simulate session outcome (simplified)
                performance_change = np.random.normal(0.1, 0.05)  # Simulated improvement
                
                # Create session
                session = {
                    'topic': selected_action.topic,
                    'strategy': selected_action.strategy.value,
                    'duration': selected_action.duration,
                    'difficulty': selected_action.difficulty_level,
                    'start_time': f"{9 + daily_time_used // 60:02d}:00",
                    'expected_outcome': 'learning'
                }
                
                daily_plan['sessions'].append(session)
                daily_time_used += selected_action.duration
                
                # Update state (simplified)
                next_state = StudyState(
                    days_until_exam=current_state.days_until_exam - day,
                    current_topic_difficulty=selected_action.difficulty_level,
                    student_fatigue=min(1.0, current_state.student_fatigue + 0.1),
                    previous_performance=min(1.0, current_state.previous_performance + performance_change),
                    time_available=current_state.time_available,
                    topic_mastery=current_state.topic_mastery
                )
                
                # Calculate reward and update Q-table
                reward = self.agent.calculate_reward(selected_action, current_state, performance_change)
                self.agent.update_q_value(current_state, selected_action, reward, next_state)
                
                current_state = next_state
                
                # Remove topic if completed (simplified)
                if selected_action.topic in [t['name'] for t in remaining_topics]:
                    remaining_topics = [t for t in remaining_topics if t['name'] != selected_action.topic]
            
            if daily_plan['sessions']:
                plan.append(daily_plan)
        
        return plan
    
    def _optimize_plan(self, plan: List[Dict], state: StudyState, 
                     student_profile: Dict) -> List[Dict]:
        """Apply constraints and optimizations to the generated plan"""
        optimized_plan = []
        
        for day_plan in plan:
            optimized_day = day_plan.copy()
            optimized_sessions = []
            
            daily_time = 0
            for session in day_plan['sessions']:
                # Time constraint
                if daily_time + session['duration'] > state.time_available:
                    # Adjust session duration
                    remaining_time = state.time_available - daily_time
                    if remaining_time >= 10:  # Minimum session time
                        session = session.copy()
                        session['duration'] = remaining_time
                        daily_time += remaining_time
                        optimized_sessions.append(session)
                    break
                else:
                    daily_time += session['duration']
                    optimized_sessions.append(session)
            
            # Add breaks between sessions
            if len(optimized_sessions) > 1:
                for i in range(len(optimized_sessions) - 1):
                    optimized_sessions[i]['break_after'] = True
                    optimized_sessions[i]['break_duration'] = 10
            
            optimized_day['sessions'] = optimized_sessions
            optimized_day['total_study_time'] = daily_time
            
            if optimized_sessions:
                optimized_plan.append(optimized_day)
        
        return optimized_plan

# FastAPI integration
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="StudyVault RL Agent", version="1.0.0")

class StudyPlanRequest(BaseModel):
    topics: List[Dict]
    exam_date: str
    student_profile: Dict

class StudyPlanResponse(BaseModel):
    plan: List[Dict]
    metadata: Dict

plan_generator = StudyPlanGenerator()

@app.post("/api/study-plan/generate", response_model=StudyPlanResponse)
async def generate_study_plan(request: StudyPlanRequest):
    """Generate optimized study plan using Q-learning"""
    
    try:
        # Parse exam date
        exam_date = datetime.fromisoformat(request.exam_date.replace('Z', '+00:00'))
        
        # Generate plan
        result = plan_generator.generate_study_plan(
            topics=request.topics,
            exam_date=exam_date,
            student_profile=request.student_profile
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating study plan: {str(e)}"
        )

@app.get("/api/agent/health")
async def agent_health():
    """Health check for RL agent"""
    return {
        "status": "healthy",
        "service": "rl-study-agent",
        "q_table_size": len(plan_generator.agent.q_table),
        "epsilon": plan_generator.agent.epsilon
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
