#!/usr/bin/env python3
"""
Syllabus Parser - Section 4.3
Extracts topics, deadlines, and weightings from PDF/text syllabi
"""

import re
import json
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import PyPDF2
import docx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

@dataclass
class Topic:
    name: str
    weight: float
    difficulty: str
    estimated_hours: int
    deadline: Optional[datetime] = None
    description: Optional[str] = None

class SyllabusParser:
    """Main parser class for extracting study topics from syllabi"""
    
    def __init__(self):
        # Common topic indicators
        self.topic_patterns = [
            r'(?i)(?:topic|chapter|module|unit|section)\s*(\d+)[\.\:]?\s*(.+?)(?=\n|$)',
            r'(?i)(?:week|day)\s*(\d+)[\.\:]?\s*(.+?)(?=\n|$)',
            r'(?i)(?:learning\s*objective|outcome)[\s\:]*(.+?)(?=\n|$)',
            r'(?i)(?:assessment|assignment|project|exam)\s*(\d*)[\.\:]?\s*(.+?)(?=\n|$)'
        ]
        
        # Difficulty indicators
        self.difficulty_keywords = {
            'easy': ['introduction', 'basic', 'fundamental', 'overview', 'simple'],
            'medium': ['intermediate', 'application', 'analysis', 'development'],
            'hard': ['advanced', 'complex', 'synthesis', 'evaluation', 'critical']
        }
        
        # Weighting patterns
        self.weight_patterns = [
            r'(?i)(?:weight|percentage|worth|value)\s*[:\-]?\s*(\d+)%?',
            r'(?i)(?:\d+)%?\s*(?:of\s*)?(?:grade|mark|score)',
            r'(?i)(?:\d+)\s*(?:points|marks)'
        ]
        
        # Time estimation patterns
        self.time_patterns = [
            r'(?i)(?:\d+)\s*(?:hours?|hrs?)',
            r'(?i)(?:\d+)\s*(?:days?)',
            r'(?i)(?:week|weeks?)\s*(\d+)'
        ]
    
    def parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"PDF parsing error: {str(e)}")
    
    def parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"DOCX parsing error: {str(e)}")
    
    def parse_text(self, file_path: str) -> str:
        """Extract text from plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Text parsing error: {str(e)}")
    
    def extract_topics(self, text: str) -> List[Topic]:
        """Extract topics from syllabus text"""
        topics = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or len(line) < 10:
                continue
            
            # Try each pattern
            for pattern in self.topic_patterns:
                matches = re.findall(pattern, line)
                if matches:
                    topic_data = self._parse_topic_line(line, matches, i)
                    if topic_data:
                        topics.append(topic_data)
                    break
        
        return self._deduplicate_and_rank_topics(topics)
    
    def _parse_topic_line(self, line: str, matches: List, line_number: int) -> Optional[Topic]:
        """Parse individual topic line"""
        try:
            if len(matches) >= 2:
                topic_id = matches[0]
                topic_name = matches[1].strip()
                
                # Clean topic name
                topic_name = re.sub(r'[^\w\s\-\.]', '', topic_name)
                topic_name = re.sub(r'\s+', ' ', topic_name).strip()
                
                if len(topic_name) < 5:
                    return None
                
                # Extract weight from surrounding context
                weight = self._extract_weight(line, line_number)
                
                # Determine difficulty
                difficulty = self._determine_difficulty(topic_name, line)
                
                # Estimate hours based on weight and difficulty
                estimated_hours = self._estimate_hours(weight, difficulty)
                
                # Extract deadline if present
                deadline = self._extract_deadline(line, line_number)
                
                return Topic(
                    name=topic_name,
                    weight=weight,
                    difficulty=difficulty,
                    estimated_hours=estimated_hours,
                    deadline=deadline
                )
        except Exception as e:
            print(f"Error parsing topic line: {e}")
            return None
    
    def _extract_weight(self, line: str, line_number: int) -> float:
        """Extract topic weight from text"""
        # Check current line
        for pattern in self.weight_patterns:
            match = re.search(pattern, line)
            if match:
                try:
                    return float(match.group(1))
                except:
                    continue
        
        # Check surrounding lines (within 3 lines)
        # This would require the full text context
        return 5.0  # Default weight
    
    def _determine_difficulty(self, topic_name: str, line: str) -> str:
        """Determine topic difficulty"""
        topic_lower = topic_name.lower()
        line_lower = line.lower()
        
        # Check difficulty keywords
        for difficulty, keywords in self.difficulty_keywords.items():
            for keyword in keywords:
                if keyword in topic_lower or keyword in line_lower:
                    return difficulty.capitalize()
        
        # Default to medium
        return "Medium"
    
    def _estimate_hours(self, weight: float, difficulty: str) -> int:
        """Estimate study hours based on weight and difficulty"""
        base_hours = max(1, int(weight * 0.4))  # 0.4 hours per percent
        
        # Adjust for difficulty
        difficulty_multiplier = {
            'Easy': 0.8,
            'Medium': 1.0,
            'Hard': 1.5
        }
        
        multiplier = difficulty_multiplier.get(difficulty, 1.0)
        return max(1, int(base_hours * multiplier))
    
    def _extract_deadline(self, line: str, line_number: int) -> Optional[datetime]:
        """Extract deadline from text"""
        # Common date patterns
        date_patterns = [
            r'(?i)(?:due|deadline|submit)\s*[:\-]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})',
            r'(?i)(?:due|deadline|submit)\s*[:\-]?\s*(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{2,4})',
            r'(?i)(?:week|day)\s*(\d+)[\s\-]*(?:due|deadline|submit)'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, line)
            if match:
                try:
                    # This is simplified - would need proper date parsing
                    return datetime.now() + timedelta(days=7)  # Placeholder
                except:
                    continue
        
        return None
    
    def _deduplicate_and_rank_topics(self, topics: List[Topic]) -> List[Topic]:
        """Remove duplicates and rank by importance"""
        # Simple deduplication based on similar names
        unique_topics = []
        seen_names = set()
        
        for topic in topics:
            # Simple similarity check
            topic_lower = topic.name.lower()
            is_duplicate = False
            
            for seen_name in seen_names:
                if (topic_lower in seen_name or seen_name in topic_lower or 
                    self._similarity(topic_lower, seen_name) > 0.8):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_topics.append(topic)
                seen_names.add(topic_lower)
        
        # Sort by weight (descending)
        unique_topics.sort(key=lambda x: x.weight, reverse=True)
        
        return unique_topics
    
    def _similarity(self, str1: str, str2: str) -> float:
        """Simple string similarity check"""
        # This is a simplified version - would use proper similarity algorithm
        common_chars = set(str1) & set(str2)
        total_chars = set(str1) | set(str2)
        return len(common_chars) / len(total_chars) if total_chars else 0

# FastAPI application
app = FastAPI(title="StudyVault Syllabus Parser", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = SyllabusParser()

@app.post("/api/syllabus/upload")
async def upload_syllabus(file: UploadFile = File(...)):
    """Upload and parse syllabus file"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check file type
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse based on file type
        if file_ext == '.pdf':
            text = parser.parse_pdf(temp_path)
        elif file_ext in ['.docx', '.doc']:
            text = parser.parse_docx(temp_path)
        else:  # .txt
            text = parser.parse_text(temp_path)
        
        # Extract topics
        topics = parser.extract_topics(text)
        
        # Convert to JSON-serializable format
        topics_data = []
        for topic in topics:
            topic_dict = {
                "name": topic.name,
                "weight": topic.weight,
                "difficulty": topic.difficulty,
                "estimatedHours": topic.estimated_hours,
                "description": topic.description
            }
            if topic.deadline:
                topic_dict["deadline"] = topic.deadline.isoformat()
            topics_data.append(topic_dict)
        
        # Generate metadata
        metadata = {
            "filename": file.filename,
            "fileType": file_ext,
            "totalTopics": len(topics_data),
            "totalEstimatedHours": sum(t["estimatedHours"] for t in topics_data),
            "averageDifficulty": _calculate_average_difficulty(topics_data),
            "extractionDate": datetime.now().isoformat()
        }
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "success": True,
            "topics": topics_data,
            "metadata": metadata
        }
        
    except Exception as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

def _calculate_average_difficulty(topics: List[Dict]) -> str:
    """Calculate average difficulty from topics"""
    if not topics:
        return "Medium"
    
    difficulty_scores = {"Easy": 1, "Medium": 2, "Hard": 3}
    total_score = 0
    count = 0
    
    for topic in topics:
        difficulty = topic.get("difficulty", "Medium")
        total_score += difficulty_scores.get(difficulty, 2)
        count += 1
    
    if count == 0:
        return "Medium"
    
    avg_score = total_score / count
    
    if avg_score <= 1.5:
        return "Easy"
    elif avg_score <= 2.5:
        return "Medium"
    else:
        return "Hard"

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "syllabus-parser"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
