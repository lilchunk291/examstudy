from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime, timezone

from ..core.security import get_supabase, get_supabase_user
from ..models.schemas import (
    StudySessionCreate, StudySessionResponse,
    DeepWorkSessionCreate, DeepWorkSessionResponse,
    ReflectionCreate, ReflectionResponse
)

router = APIRouter()


# Study Sessions
@router.get("/sessions", response_model=List[StudySessionResponse])
async def get_study_sessions(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get all study sessions for the current user."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("study_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/sessions", response_model=StudySessionResponse)
async def create_study_session(
    session_data: StudySessionCreate,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Create a new study session."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        data = session_data.model_dump()
        data["user_id"] = user_id
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table("study_sessions").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/sessions/{session_id}/complete")
async def complete_study_session(
    session_id: str,
    retention_score: Optional[float] = None,
    anxiety_level: Optional[int] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Mark a study session as complete."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        update_data = {
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        if retention_score is not None:
            update_data["retention_score"] = retention_score
        if anxiety_level is not None:
            update_data["anxiety_level"] = anxiety_level
        
        result = supabase.table("study_sessions").update(update_data).eq("id", session_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Deep Work Sessions
@router.get("/deep-work", response_model=List[DeepWorkSessionResponse])
async def get_deep_work_sessions(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get all deep work sessions."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("deep_work_sessions").select("*").eq("user_id", user_id).order("started_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/deep-work", response_model=DeepWorkSessionResponse)
async def create_deep_work_session(
    session_data: DeepWorkSessionCreate,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Start a new deep work session."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # Check for overlapping sessions
    existing = supabase.table("deep_work_sessions").select("id").eq("user_id", user_id).is_("completed_at", "null").execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Another deep work session is already in progress"
        )
    
    # Minimum 45 minutes
    if session_data.duration_minutes < 45:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deep work sessions must be at least 45 minutes"
        )
    
    try:
        data = session_data.model_dump()
        data["user_id"] = user_id
        data["started_at"] = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table("deep_work_sessions").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/deep-work/{session_id}/complete")
async def complete_deep_work_session(
    session_id: str,
    comprehension_score: Optional[int] = None,
    cognitive_fatigue: Optional[int] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Mark a deep work session as complete."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        update_data = {
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        if comprehension_score is not None:
            update_data["comprehension_score"] = comprehension_score
        if cognitive_fatigue is not None:
            update_data["cognitive_fatigue"] = cognitive_fatigue
        
        result = supabase.table("deep_work_sessions").update(update_data).eq("id", session_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Reflections (stored locally in IndexedDB, not synced to server)
@router.get("/reflections", response_model=List[ReflectionResponse])
async def get_reflections(
    session_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get reflections (from local IndexedDB - not synced to server)."""
    # This would typically fetch from local IndexedDB
    # For now, return empty list as reflections are local-only
    return []


@router.post("/reflections", response_model=ReflectionResponse)
async def create_reflection(
    reflection_data: ReflectionCreate,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Create a reflection (stored in local IndexedDB only)."""
    # This would be stored in local IndexedDB, not synced to server
    user_id = credentials.id
    
    return {
        "id": "local-reflection",
        "user_id": user_id,
        "session_id": reflection_data.session_id,
        "mood_score": reflection_data.mood_score,
        "notes": reflection_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }


# Study Plan
@router.get("/plan")
async def get_study_plan(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get the current study plan."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("study_plans").select("*").eq("user_id", user_id).eq("active", True).execute()
        
        if not result.data:
            return {"plan": None, "schedule": []}
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/plan/generate")
async def generate_study_plan(
    focus_subjects: List[str],
    daily_hours: float = 4.0,
    target_exam_date: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Generate a new study plan using Q-Learning agent."""
    # In production, this would use the client-side Q-Learning agent
    # The backend just stores the generated plan
    
    return {
        "message": "Study plan generation happens client-side with Q-Learning agent",
        "focus_subjects": focus_subjects,
        "daily_hours": daily_hours
    }
