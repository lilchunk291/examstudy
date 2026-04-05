from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

router = APIRouter()

# Initialize templates
templates = Jinja2Templates(directory=Path(__file__).parent.parent.parent / "templates")

from ..core.security import verify_admin_token
from fastapi import Depends

@router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, _ = Depends(verify_admin_token)):
    """Admin dashboard page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/universities", response_class=HTMLResponse)
async def admin_universities(request: Request, _ = Depends(verify_admin_token)):
    """Admin universities page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/rl-agent", response_class=HTMLResponse)
async def admin_rl_agent(request: Request, _ = Depends(verify_admin_token)):
    """Admin RL agent page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/sync", response_class=HTMLResponse)
async def admin_sync(request: Request, _ = Depends(verify_admin_token)):
    """Admin sync status page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/encryption", response_class=HTMLResponse)
async def admin_encryption(request: Request, _ = Depends(verify_admin_token)):
    """Admin encryption page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/scheduler", response_class=HTMLResponse)
async def admin_scheduler(request: Request):
    """Admin scheduler page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )


@router.get("/admin/analytics", response_class=HTMLResponse)
async def admin_analytics(request: Request):
    """Admin analytics page."""
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request}
    )
