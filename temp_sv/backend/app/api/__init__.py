from .auth import router as auth_router
from .students import router as students_router
from .study import router as study_router
from .university import router as university_router
from .sync import router as sync_router
from .admin import router as admin_router

__all__ = [
    'auth_router',
    'students_router', 
    'study_router',
    'university_router',
    'sync_router',
    'admin_router'
]
