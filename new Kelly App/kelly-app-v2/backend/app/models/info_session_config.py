from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class InfoSessionConfig(Base):
    __tablename__ = "info_session_config"
    
    id = Column(Integer, primary_key=True, index=True)
    max_sessions_per_day = Column(Integer, default=2)  # Default: 2 sessions (morning and afternoon)
    time_slots = Column(JSON, nullable=False)  # Array of time slots, e.g., ["8:30 AM", "1:30 PM"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


