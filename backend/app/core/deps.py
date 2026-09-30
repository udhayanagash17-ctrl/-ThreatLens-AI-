"""
Common dependencies for the application.
"""
from app.core.database import get_db
from app.api.auth import get_current_user

__all__ = ["get_db", "get_current_user"]
