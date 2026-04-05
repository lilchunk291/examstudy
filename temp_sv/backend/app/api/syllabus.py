from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile, Form
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional
import os

from ..core.security import get_supabase_user

router = APIRouter()

@router.post("/upload")
async def upload_syllabus(
    syllabus: UploadFile = File(...),
    userId: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Upload and process a syllabus file."""
    # Verify user ID matches
    if userId != credentials.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )
    
    # File type validation
    allowed_extensions = {".pdf", ".docx", ".txt"}
    file_ext = os.path.splitext(syllabus.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # In production, this would:
    # 1. Save the file temporarily
    # 2. Use a Python parser (like PyPDF2 or docx2txt) to extract text
    # 3. Use an LLM or regex to extract topics
    # 4. Clean up the file
    
    # Mock extracted topics for now
    return {
        "topics": [
            {"name": "Introduction to Computer Science", "weight": 10, "estimatedHours": 5, "difficulty": "Easy"},
            {"name": "Data Structures & Algos", "weight": 30, "estimatedHours": 15, "difficulty": "Hard"},
            {"name": "Operating Systems", "weight": 20, "estimatedHours": 10, "difficulty": "Medium"},
            {"name": "Database Systems", "weight": 20, "estimatedHours": 10, "difficulty": "Medium"},
            {"name": "Software Engineering", "weight": 20, "estimatedHours": 8, "difficulty": "Easy"}
        ],
        "metadata": {
            "filename": syllabus.filename,
            "processedDate": "2024-01-01T00:00:00Z"
        }
    }
