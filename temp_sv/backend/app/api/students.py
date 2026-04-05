from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, List
from supabase import AsyncClient

from ..core.security import get_supabase, get_supabase_user
from ..models.schemas import (
    StudentProfileCreate, StudentProfileResponse
)

router = APIRouter()


@router.get("/profile")
async def get_profile(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get student profile."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("student_profiles").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            # Create default profile if none exists
            default_profile = {
                "user_id": user_id,
                "display_name": credentials.email.split("@")[0],
                "learner_type": "visual",
                "theme": "dark",
                "accent_color": "#6366f1",
                "font_preference": "inter",
                "dashboard_layout": {}
            }
            
            result = supabase.table("student_profiles").insert(default_profile).execute()
            return result.data[0]
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Update student profile."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("student_profiles").update(profile_data).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/cognitive-load")
async def get_cognitive_load(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get current cognitive load level (calculated client-side, stored for history)."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # Return mock data - actual calculation happens client-side
    return {
        "level": 5,  # 1-10 scale
        "trend": "stable",
        "last_updated": "2024-01-01T00:00:00Z"
    }


@router.get("/dashboard")
async def get_dashboard(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get dashboard data including widgets."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # Get profile
    profile_result = supabase.table("student_profiles").select("*").eq("user_id", user_id).execute()
    
    # Get today's sessions
    sessions_result = supabase.table("study_sessions").select("*").eq("user_id", user_id).execute()
    
    # Get upcoming exams (from encrypted data - client decrypts)
    # For now return count only
    exams_result = supabase.table("academic_events").select("id").eq("user_id", user_id).eq("event_type", "exam").execute()
    
    return {
        "profile": profile_result.data[0] if profile_result.data else None,
        "today_sessions": sessions_result.data,
        "upcoming_exams_count": len(exams_result.data),
        "cognitive_load": 5,
        "learner_type": profile_result.data[0]["learner_type"] if profile_result.data else "visual"
    }


@router.post("/theme")
async def set_theme(
    theme: str,
    accent_color: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Set user theme preferences."""
    supabase = get_supabase()
    user_id = credentials.id
    
    update_data = {"theme": theme}
    if accent_color:
        update_data["accent_color"] = accent_color
    
    try:
        result = supabase.table("student_profiles").update(update_data).eq("user_id", user_id).execute()
        return {"success": True, "theme": theme}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/dashboard/layout")
async def save_dashboard_layout(
    layout: dict,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Save dashboard widget layout."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("student_profiles").update({
            "dashboard_layout": layout
        }).eq("user_id", user_id).execute()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.get("/schedule")
async def get_schedule(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get the current schedule for the student."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        # Get study sessions
        sessions = supabase.table("study_sessions").select("*").eq("user_id", user_id).execute()
        
        # Get deep work sessions
        deep_work = supabase.table("deep_work_sessions").select("*").eq("user_id", user_id).execute()
        
        # Combine and format for schedule view
        schedule = []
        for s in sessions.data:
            schedule.append({
                "id": s.get("id"),
                "time": s.get("created_at"),
                "date": s.get("created_at"), # Added for alignment
                "subject": s.get("topic") or s.get("subject") or "Study Session",
                "topic": s.get("topic"),
                "type": "study",
                "duration": f"{s.get('duration_minutes', 45)}m",
                "durationMinutes": s.get("duration_minutes", 45),
                "status": "completed" if s.get("completed_at") else "upcoming"
            })
            
        for dw in deep_work.data:
            schedule.append({
                "id": dw.get("id"),
                "time": dw.get("started_at"),
                "subject": dw.get("topic"),
                "type": "deep-work",
                "status": "completed" if dw.get("completed_at") else "in-progress"
            })
            
        return {"schedule": schedule}
    except Exception as e:
        # Fallback to empty schedule if any table is missing or query fails
        return {"schedule": []}


@router.get("/exams")
async def get_exams(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get upcoming exams for the student."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("academic_events").select("*").eq("user_id", user_id).eq("event_type", "exam").execute()
        # Map due_date to date for frontend compatibility
        exams = []
        for e in result.data:
            exams.append({
                **e,
                "date": e.get("due_date"),
                "subject": e.get("title") or e.get("course_code")
            })
        return exams
    except Exception as e:
        return []


@router.get("/sessions")
async def get_sessions(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get student sessions (alias for /api/study/sessions)."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("study_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        return []


@router.get("/usage")
async def get_usage(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get student usage statistics."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        # Get session stats
        sessions = supabase.table("study_sessions").select("duration_minutes", "created_at").eq("user_id", user_id).execute()
        
        # Calculate total focus time
        total_time_min = sum([s.get("duration_minutes", 0) for s in sessions.data if s.get("duration_minutes")])
        
        return {
            "total_sessions": len(sessions.data),
            "total_focus_minutes": total_time_min,
            "streak_days": 1, # Minimal for now
            "last_active": sessions.data[0].get("created_at") if sessions.data else None
        }
    except Exception as e:
        return {
            "total_sessions": 0,
            "total_focus_minutes": 0,
            "streak_days": 0,
            "last_active": None
        }


@router.get("/stats")
async def get_student_stats(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get aggregated student statistics for dashboard cards."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        sessions = supabase.table("study_sessions").select("duration_minutes", "retention_score").eq("user_id", user_id).execute()
        data = sessions.data
        
        total_sessions = len(data)
        total_minutes = sum([s.get("duration_minutes", 0) for s in data if s.get("duration_minutes")])
        avg_retention = sum([s.get("retention_score", 0) for s in data if s.get("retention_score")]) / total_sessions if total_sessions > 0 else 0
        
        # Map to what StatsCards.svelte expects
        return {
            "total_sessions": total_sessions,
            "focus_hours": round(total_minutes / 60, 1),
            "weekly_goal_pct": 0, # Placeholder until goals implemented
            "retention_rate": round(avg_retention * 100, 1) if avg_retention <= 1 else round(avg_retention, 1),
            "sessions_trend": "0%",
            "focus_trend": "0%",
            "goal_trend": "0%",
            "retention_trend": "0%"
        }
    except Exception:
        return {
            "total_sessions": 0,
            "focus_hours": 0,
            "weekly_goal_pct": 0,
            "retention_rate": 0,
            "sessions_trend": "0%",
            "focus_trend": "0%",
            "goal_trend": "0%",
            "retention_trend": "0%"
        }
