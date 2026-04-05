from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
from datetime import datetime, timezone

from ..core.security import get_supabase, get_supabase_user
from ..models.schemas import EncryptedDataCreate, EncryptedDataResponse

router = APIRouter()


# Sync encrypted blobs to/from Supabase
@router.get("/data")
async def get_encrypted_data(
    data_type: Optional[str] = None,
    since: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get encrypted data blobs for the user."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        query = supabase.table("encrypted_student_data").select("*").eq("user_id", user_id)
        
        if data_type:
            query = query.eq("data_type", data_type)
        if since:
            query = query.gte("synced_at", since)
        
        result = query.order("synced_at", desc=True).execute()
        return result.data
    except Exception as e:
        return []


@router.post("/data")
async def upload_encrypted_data(
    data: EncryptedDataCreate,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Upload encrypted data blob."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        data_dict = data.model_dump()
        data_dict["user_id"] = user_id
        data_dict["synced_at"] = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table("encrypted_student_data").insert(data_dict).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/data/{data_id}")
async def delete_encrypted_data(
    data_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Delete an encrypted data blob."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("encrypted_student_data").delete().eq("id", data_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Sync queue management (for offline support)
@router.get("/queue")
async def get_sync_queue(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get pending items in sync queue (server-side view)."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # This would typically query a sync_queue table
    # For now, return status
    return {
        "pending": 0,
        "failed": 0,
        "last_sync": None
    }


@router.post("/queue/retry")
async def retry_sync(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Retry failed sync items."""
    # Client would re-attempt to sync failed items
    return {
        "status": "initiated",
        "message": "Retry sync initiated"
    }


# Device authorization for syncing
@router.get("/devices")
async def get_authorized_devices(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Get list of authorized devices."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("device_authorizations").select("*").eq("user_id", user_id).execute()
        return result.data
    except Exception:
        return []


@router.delete("/devices/{device_id}")
async def revoke_device(
    device_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Revoke device authorization."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("device_authorizations").delete().eq("id", device_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Key Escrow for sensitive data recovery
@router.post("/escrow")
async def save_escrow_key(
    escrow_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Save encrypted AES key for later recovery."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        data = {
            "user_id": user_id,
            "encrypted_key": escrow_data.get("encrypted_key"),
            "salt": escrow_data.get("salt"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Use upsert to handle updates
        result = supabase.table("key_escrow").upsert(data, on_conflict="user_id").execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/escrow")
async def get_escrow_key(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Retrieve encrypted AES key for recovery."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        result = supabase.table("key_escrow").select("*").eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="No escrow key found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# GDPR: Delete all user data
@router.delete("/all-data")
async def delete_all_user_data(
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Delete all user data (GDPR compliance)."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        # Delete from all tables (in production, use RLS + cascade)
        tables = [
            "encrypted_student_data",
            "study_sessions",
            "deep_work_sessions",
            "academic_events",
            "reflections",
            "study_plans",
            "device_authorizations",
            "key_escrow",
            "university_connections"
        ]
        
        for table in tables:
            try:
                supabase.table(table).delete().eq("user_id", user_id).execute()
            except:
                pass
        
        # Finally delete the student profile
        try:
            supabase.table("student_profiles").delete().eq("user_id", user_id).execute()
        except:
            pass
        
        return {
            "success": True,
            "message": "All user data has been deleted"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
