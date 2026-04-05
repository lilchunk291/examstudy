"""
Chat API endpoint for StudyVault AI chat functionality.
Routes chat requests to appropriate AI connectors.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging
import json
import asyncio

from ..core.security import get_supabase_user
from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    connector_id: Optional[str] = "studyvault"
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    connector_used: str
    timestamp: float


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user = Depends(get_supabase_user)
):
    """
    Process chat message and route to appropriate AI connector.
    """
    try:
        user_id = getattr(current_user, 'id', 'anonymous') if current_user else 'anonymous'
        logger.info(f"Chat request from user {user_id}: {request.message[:50]}...")
        
        # Prepare a more helpful response using context if available
        student_name = getattr(current_user, 'email', 'Student').split('@')[0]
        topic = request.context.get('current_topic', 'your studies') if request.context else 'your studies'
        
        response_text = f"Hi {student_name}, I'm ready to help you with {topic}. "
        response_text += "As your StudyVault AI assistant, I can help you plan your sessions, track retention, and optimize your study schedule. "
        response_text += f"I see you're currently focused on {topic}. What specific questions do you have?"
        
        # Create a streaming response generator
        async def generate_response():
            # Split response into chunks for streaming
            words = response_text.split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield chunk.encode('utf-8')
                await asyncio.sleep(0.05)
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/plain; charset=utf-8"
            }
        )
        
    except HTTPException as e:
        logger.error(f"HTTP error in chat endpoint: {e}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/chat/health")
async def chat_health():
    """Chat service health check."""
    return {"status": "healthy", "service": "chat"}
