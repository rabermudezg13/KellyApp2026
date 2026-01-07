"""
Announcements API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.database import get_db
from app.models.announcement import Announcement

router = APIRouter()

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    is_active: bool = True
    display_order: int = 0

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    message: str
    is_active: bool
    display_order: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AnnouncementResponse])
async def get_announcements(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all announcements"""
    query = db.query(Announcement)
    if active_only:
        query = query.filter(Announcement.is_active == True)
    announcements = query.order_by(Announcement.display_order).all()
    return [AnnouncementResponse.model_validate(a).model_dump() for a in announcements]

@router.post("/", response_model=AnnouncementResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db)
):
    """Create a new announcement (admin only)"""
    new_announcement = Announcement(**announcement.dict())
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return AnnouncementResponse.model_validate(new_announcement).model_dump()

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db)
):
    """Update an announcement (admin only)"""
    db_announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    for key, value in announcement.dict().items():
        setattr(db_announcement, key, value)
    
    db.commit()
    db.refresh(db_announcement)
    return AnnouncementResponse.model_validate(db_announcement).model_dump()

@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db)
):
    """Delete an announcement (admin only)"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted successfully"}

