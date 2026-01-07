"""
Admin API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.get("/dashboard/info-sessions")
async def get_info_sessions_dashboard(db: Session = Depends(get_db)):
    """Get info sessions for staff dashboard"""
    # This will be implemented to show all info sessions
    return {"message": "Info sessions dashboard endpoint"}


