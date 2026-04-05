from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional
import secrets

from ..core.security import (
    get_supabase, get_supabase_user, verify_password, 
    get_password_hash, create_access_token, verify_admin_token
)
from ..models.schemas import UserCreate, UserResponse, TokenResponse, LoginRequest

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user with email and password."""
    supabase = get_supabase()
    
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": auth_response.user.id, "email": auth_response.user.email}
        )
        
        return TokenResponse(access_token=access_token)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """Login with email and password."""
    supabase = get_supabase()
    
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password,
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        access_token = create_access_token(
            data={"sub": auth_response.user.id, "email": auth_response.user.email}
        )
        
        return TokenResponse(access_token=access_token)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Logout current user."""
    supabase = get_supabase()
    supabase.auth.sign_out()
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Get current user info."""
    return {
        "id": credentials.id,
        "email": credentials.email,
    }


# OAuth endpoints (to be implemented with actual OAuth providers)
@router.get("/oauth/microsoft")
async def microsoft_login():
    """Initiate Microsoft OAuth flow."""
    # In production, redirect to Microsoft OAuth
    return {"auth_url": "/api/auth/oauth/microsoft/callback"}


@router.get("/oauth/google")
async def google_login():
    """Initiate Google OAuth flow."""
    # In production, redirect to Google OAuth
    return {"auth_url": "/api/auth/oauth/google/callback"}


# Device pairing
@router.post("/device/pair")
async def initiate_pairing(credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Initiate device pairing - generates 6-digit code."""
    supabase = get_supabase()
    
    # Generate 6-digit pairing code
    pairing_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store pairing request (in production, use proper state management)
    user_id = credentials.id
    
    # Create temporary pairing record
    try:
        supabase.table("device_authorizations").insert({
            "user_id": user_id,
            "device_name": "New Device",
            "pairing_code": pairing_code,
            "expires_at": "now() + interval '10 minutes'"
        }).execute()
    except Exception:
        pass  # Table might not exist in development
    
    return {
        "pairing_code": pairing_code,
        "expires_in": 600  # 10 minutes in seconds
    }


@router.post("/device/verify")
async def verify_pairing(code: str, device_name: str, credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)):
    """Verify device pairing with code."""
    supabase = get_supabase()
    user_id = credentials.id
    
    # In production, verify code against stored pairing request
    # For now, just return success
    
    return {
        "success": True,
        "device_id": secrets.token_hex(16)
    }


# Key escrow for account recovery
@router.post("/key-escrow/store")
async def store_escrow_key(
    encrypted_key: str,
    credentials: HTTPAuthorizationCredentials = Depends(get_supabase_user)
):
    """Store encrypted key for escrow."""
    supabase = get_supabase()
    user_id = credentials.id
    
    try:
        supabase.table("key_escrow").insert({
            "user_id": user_id,
            "encrypted_private_key": encrypted_key,
            "key_version": 1
        }).execute()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store escrow key"
        )


@router.get("/key-escrow/recover")
async def recover_escrow_key(
    user_id: str,
    admin: bool = Depends(verify_admin_token)
):
    """Recover escrow key (admin only)."""
    supabase = get_supabase()
    
    try:
        result = supabase.table("key_escrow").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No escrow key found"
            )
        
        return {
            "encrypted_key": result.data[0]["encrypted_private_key"],
            "key_version": result.data[0]["key_version"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow key not found"
        )
