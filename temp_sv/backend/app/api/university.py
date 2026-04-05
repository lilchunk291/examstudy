from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime, timezone

from ..core.security import get_supabase, get_supabase_user
from ..models.schemas import UniversityResponse

router = APIRouter()


@router.get("/universities")
async def get_universities():
    """Get list of supported universities."""
    supabase = get_supabase()
    
    try:
        result = supabase.table("universities").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/connections", response_model=List[dict])
async def get_connections(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get user's university connections."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("university_connections").select("*").eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/connect")
async def connect_university(
    university_id: str,
    auth_code: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Connect to a university LMS (OAuth flow)."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # Get university details
    uni_result = supabase.table("universities").select("*").eq("id", university_id).execute()
    if not uni_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    university = uni_result.data[0]
    
    # In production, this would handle OAuth flow
    # For now, create a pending connection
    try:
        connection_data = {
            "user_id": user_id,
            "university_id": university_id,
            "lms_type": university.get("lms_type"),
            "status": "pending",
            "connected_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table("university_connections").insert(connection_data).execute()
        return {
            "connection": result.data[0],
            "auth_url": f"/api/university/oauth/{university_id}"  # Placeholder
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/disconnect")
async def disconnect_university(
    connection_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Disconnect a university connection."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        supabase.table("university_connections").delete().eq("id", connection_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/sync")
async def sync_university_data(
    connection_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Sync data from connected university LMS."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # Verify connection belongs to user
    conn_result = supabase.table("university_connections").select("*").eq("id", connection_id).eq("user_id", user_id).execute()
    if not conn_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    # In production, this would:
    # 1. Fetch data from LMS API (Canvas, Moodle, Blackboard)
    # 2. Encrypt data client-side
    # 3. Upload encrypted blobs to Supabase
    
    return {
        "message": "Sync would fetch from LMS and encrypt before upload",
        "connection_id": connection_id,
        "status": "simulated"
    }


@router.get("/calendar")
async def get_academic_calendar(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get academic calendar events (decrypted from local)."""
    # Events are encrypted client-side, so this returns count only
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("academic_events").select("id").eq("user_id", user_id).execute()
        return {
            "event_count": len(result.data),
            "message": "Events are decrypted client-side"
        }
    except Exception:
        return {"event_count": 0}
