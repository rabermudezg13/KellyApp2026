"""
New Hire Orientation Configuration API endpoints
Admin endpoints for managing new hire orientation settings
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from app.database import get_db
from app.models.new_hire_orientation_config import NewHireOrientationConfig
import json

router = APIRouter()

class NewHireOrientationConfigCreate(BaseModel):
    max_sessions_per_day: int = 2
    time_slots: List[str] = ["9:00 AM", "2:00 PM"]
    is_active: bool = True

class NewHireOrientationConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    max_sessions_per_day: int
    time_slots: List[str]
    is_active: bool

@router.get("/", response_model=NewHireOrientationConfigResponse)
async def get_new_hire_orientation_config(db: Session = Depends(get_db)):
    """Get current new hire orientation configuration"""
    config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
    
    if not config:
        # Create default config if none exists
        default_config = NewHireOrientationConfig(
            max_sessions_per_day=2,
            time_slots=["9:00 AM", "2:00 PM"],
            is_active=True
        )
        db.add(default_config)
        db.commit()
        db.refresh(default_config)
        return NewHireOrientationConfigResponse.model_validate(default_config).model_dump()
    
    config_data = NewHireOrientationConfigResponse.model_validate(config).model_dump()
    # Handle JSON string conversion
    if isinstance(config_data.get('time_slots'), str):
        config_data['time_slots'] = json.loads(config_data['time_slots'])
    return config_data

@router.put("/", response_model=NewHireOrientationConfigResponse)
async def update_new_hire_orientation_config(
    config_data: NewHireOrientationConfigCreate,
    db: Session = Depends(get_db)
):
    """Update new hire orientation configuration (admin only)"""
    # Deactivate all existing configs
    db.query(NewHireOrientationConfig).update({NewHireOrientationConfig.is_active: False})
    
    # Create new active config
    # Convert list to JSON string for storage
    time_slots_json = json.dumps(config_data.time_slots) if isinstance(config_data.time_slots, list) else config_data.time_slots
    new_config = NewHireOrientationConfig(
        max_sessions_per_day=config_data.max_sessions_per_day,
        time_slots=time_slots_json,
        is_active=True
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    config_response = NewHireOrientationConfigResponse.model_validate(new_config).model_dump()
    if isinstance(config_response.get('time_slots'), str):
        config_response['time_slots'] = json.loads(config_response['time_slots'])
    return config_response

@router.get("/time-slots", response_model=List[str])
async def get_available_time_slots(db: Session = Depends(get_db)):
    """Get available time slots for new hire orientations"""
    config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
    
    if not config:
        # Return default time slots
        return ["9:00 AM", "2:00 PM"]
    
    # Handle both JSON string and list
    if isinstance(config.time_slots, str):
        return json.loads(config.time_slots)
    return config.time_slots

