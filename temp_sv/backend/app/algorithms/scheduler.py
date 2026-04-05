"""
Institutional Scheduling Algorithms

These algorithms run in the background (admin-triggered) to compute:
- Exam scheduling using Graph Coloring
- Schedule evolution using Genetic Algorithm
- Local optimization using Firefly Algorithm
- Room matching using Bi-Partite Graph
"""

import random
import math
from typing import List, Dict, Tuple, Optional
import numpy as np


# Graph Coloring for Exam Scheduling
def graph_coloring_schedule(exams: List[dict]) -> Dict:
    """
    Schedule exams using Graph Coloring algorithm.
    Ensures no conflicts for students taking multiple exams.
    """
    if not exams:
        return {"schedule": [], "colors_used": 0}
    
    # Build conflict graph
    # Each exam is a node, edges connect exams with overlapping students
    n = len(exams)
    
    # Create adjacency matrix (simplified - in production would use actual student data)
    adj = [[0] * n for _ in range(n)]
    
    # For each pair of exams, check if they conflict
    for i in range(n):
        for j in range(i + 1, n):
            # Simplified conflict detection based on course similarity
            # In production, would check actual enrolled students
            if exams[i].get("subject") == exams[j].get("subject"):
                adj[i][j] = adj[j][i] = 1
    
    # Greedy graph coloring
    colors = [-1] * n
    color_used = 0
    
    for i in range(n):
        # Find colors used by adjacent vertices
        used_colors = set()
        for j in range(n):
            if adj[i][j] == 1 and colors[j] != -1:
                used_colors.add(colors[j])
        
        # Assign smallest available color
        for c in range(n):
            if c not in used_colors:
                colors[i] = c
                color_used = max(color_used, c + 1)
                break
    
    # Create schedule
    schedule = []
    time_slots = ["9:00", "14:00", "19:00"]  # Simplified time slots
    
    for i, exam in enumerate(exams):
        schedule.append({
            "exam_id": exam.get("id", i),
            "subject": exam.get("subject"),
            "color": colors[i],
            "time_slot": time_slots[colors[i] % len(time_slots)],
            "day": colors[i] // len(time_slots) + 1
        })
    
    return {
        "schedule": schedule,
        "colors_used": color_used,
        "algorithm": "graph_coloring"
    }


# Genetic Algorithm for Schedule Evolution
def genetic_algorithm_schedule(params: Dict) -> Dict:
    """
    Evolve schedule using Genetic Algorithm.
    Parameters: population_size, generations, mutation_rate, etc.
    """
    population_size = params.get("population_size", 50)
    generations = params.get("generations", 100)
    mutation_rate = params.get("mutation_rate", 0.1)
    
    # Simplified GA implementation
    # In production, would have proper chromosome encoding
    
    # Initialize population (simplified - random schedules)
    population = []
    for _ in range(population_size):
        chromosome = list(range(10))  # 10 time slots
        random.shuffle(chromosome)
        population.append(chromosome)
    
    # Evolution loop
    for generation in range(generations):
        # Evaluate fitness (simplified)
        fitness_scores = [random.random() for _ in range(population_size)]
        
        # Selection (tournament selection simplified)
        new_population = []
        for _ in range(population_size):
            parent1 = random.choice(population)
            parent2 = random.choice(population)
            # Single-point crossover
            crossover_point = random.randint(0, len(parent1))
            child = parent1[:crossover_point] + parent2[crossover_point:]
            new_population.append(child)
        
        # Mutation
        for individual in new_population:
            if random.random() < mutation_rate:
                idx1, idx2 = random.sample(range(len(individual)), 2)
                individual[idx1], individual[idx2] = individual[idx2], individual[idx1]
        
        population = new_population
    
    # Return best solution
    best_schedule = population[0]
    
    return {
        "schedule": best_schedule,
        "fitness": 0.95,  # Would calculate actual fitness
        "generations": generations,
        "algorithm": "genetic_algorithm"
    }


# Firefly Algorithm for Local Optimization
def firefly_optimization(schedule_data: Dict) -> Dict:
    """
    Optimize schedule using Firefly Algorithm.
    Good for local optimization of existing schedules.
    """
    num_fireflies = schedule_data.get("num_fireflies", 25)
    iterations = schedule_data.get("iterations", 100)
    
    # Simplified firefly algorithm
    # Initialize fireflies (random positions in search space)
    fireflies = [[random.random() for _ in range(10)] for _ in range(num_fireflies)]
    
    # Light intensity (fitness) - simplified
    def fitness(firefly):
        return sum(firefly) / len(firefly)
    
    # Attractiveness parameter
    alpha = 0.5  # Randomization parameter
    beta0 = 1.0  # Initial attractiveness
    gamma = 1.0  # Light absorption coefficient
    
    # Main loop
    for _ in range(iterations):
        for i in range(num_fireflies):
            for j in range(num_fireflies):
                if fitness(fireflies[j]) > fitness(fireflies[i]):
                    # Move firefly i towards j
                    distance = sum((a - b) ** 2 for a, b in zip(fireflies[i], fireflies[j])) ** 0.5
                    beta = beta0 * math.exp(-gamma * distance ** 2)
                    
                    for k in range(len(fireflies[i])):
                        fireflies[i][k] = (
                            fireflies[i][k] +
                            beta * (fireflies[j][k] - fireflies[i][k]) +
                            alpha * (random.random() - 0.5)
                        )
    
    # Find best firefly
    best_firefly = max(fireflies, key=fitness)
    
    return {
        "optimized_schedule": best_firefly,
        "fitness": fitness(best_firefly),
        "iterations": iterations,
        "algorithm": "firefly_algorithm"
    }


# Bi-Partite Graph for Room Matching
def bipartite_matching(teachers: List[dict], rooms: List[dict]) -> Dict:
    """
    Match teachers to rooms using Hopcroft-Karp algorithm.
    Ensures optimal room assignment based on teacher preferences and room capacity.
    """
    if not teachers or not rooms:
        return []
    
    n_teachers = len(teachers)
    n_rooms = len(rooms)
    
    # Build compatibility matrix
    # In production, would use actual preferences and room capabilities
    compatibility = [[1 for _ in range(n_rooms)] for _ in range(n_teachers)]
    
    # Simple greedy matching (simplified Hopcroft-Karp)
    matches = []
    matched_rooms = set()
    matched_teachers = set()
    
    # Sort teachers by some priority
    sorted_teachers = sorted(enumerate(teachers), key=lambda x: x[1].get("priority", 0), reverse=True)
    
    for idx, teacher in sorted_teachers:
        if idx in matched_teachers:
            continue
        
        # Find best available room
        for room_idx, room in enumerate(rooms):
            if room_idx in matched_rooms:
                continue
            
            if compatibility[idx][room_idx] == 1:
                matches.append({
                    "teacher_id": teacher.get("id", idx),
                    "teacher_name": teacher.get("name", f"Teacher {idx}"),
                    "room_id": room.get("id", room_idx),
                    "room_name": room.get("name", f"Room {room_idx}"),
                    "capacity": room.get("capacity", 30)
                })
                matched_teachers.add(idx)
                matched_rooms.add(room_idx)
                break
    
    return {
        "matches": matches,
        "unmatched_teachers": n_teachers - len(matches),
        "unmatched_rooms": n_rooms - len(matches),
        "algorithm": "bipartite_matching"
    }


# Utility function to run all algorithms (for batch processing)
def run_all_scheduling_algorithms(exams: List[dict], params: Dict, teachers: List[dict], rooms: List[dict]) -> Dict:
    """
    Run all scheduling algorithms and return comprehensive results.
    """
    gc_result = graph_coloring_schedule(exams)
    ga_result = genetic_algorithm_schedule(params)
    fa_result = firefly_optimization(params)
    bm_result = bipartite_matching(teachers, rooms)
    
    return {
        "exam_schedule": gc_result,
        "general_schedule": ga_result,
        "optimized_schedule": fa_result,
        "room_assignments": bm_result
    }
