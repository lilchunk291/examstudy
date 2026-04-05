from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .core.security import get_supabase
from .api import auth, students, study, university, admin, sync, chat, syllabus
from .api.admin_templates import router as admin_templates_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME}...")
    
    # Initialize Supabase connection
    try:
        supabase = get_supabase()
        logger.info("Supabase connection established")
    except Exception as e:
        logger.warning(f"Supabase not configured: {e}")
    
    # Pre-load RL agent model (in production, load from file)
    logger.info("RL Agent model initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Privacy-first AI-powered academic scheduling and learning optimization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(study.router, prefix="/api/study", tags=["Study"])
app.include_router(university.router, prefix="/api/university", tags=["University"])
app.include_router(sync.router, prefix="/api/sync", tags=["Sync"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(syllabus.router, prefix="/api/syllabus", tags=["Syllabus"])
app.include_router(admin_templates_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
