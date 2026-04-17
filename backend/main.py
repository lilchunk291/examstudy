import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StudyStream AI Backend")

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

genai.configure(apiKey=os.getenv("GEMINI_API_KEY"))

# Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "gemini-pro"

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[str] = None
    completed: bool = False

@app.get("/")
async def root():
    return {"status": "online", "message": "StudyStream AI FastAPI Backend"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        model = genai.GenerativeModel(request.model)
        # Convert messages to Gemini format
        history = []
        for msg in request.messages[:-1]:
            history.append({"role": "user" if msg.role == "user" else "model", "parts": [msg.content]})
        
        chat = model.start_chat(history=history)
        response = chat.send_message(request.messages[-1].content)
        
        return {"role": "ai", "content": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks")
async def get_tasks():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    response = supabase.table("tasks").select("*").execute()
    return response.data

@app.post("/api/tasks")
async def create_task(task: Task):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    response = supabase.table("tasks").insert(task.model_dump()).execute()
    return response.data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
