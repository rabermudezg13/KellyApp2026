from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base

class InfoSession(Base):
    __tablename__ = "info_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    zip_code = Column(String(10), nullable=False)  # New field
    session_type = Column(String(50), nullable=False)  # new-hire or reactivation
    time_slot = Column(String(20), nullable=False)  # 8:30 AM or 1:30 PM
    is_in_exclusion_list = Column(Boolean, default=False)
    exclusion_warning_shown = Column(Boolean, default=False)
    status = Column(String(50), default="registered")  # registered, in-progress, completed
    
    # Document status checkboxes
    ob365_sent = Column(Boolean, default=False)
    i9_sent = Column(Boolean, default=False)
    existing_i9 = Column(Boolean, default=False)
    ineligible = Column(Boolean, default=False)
    rejected = Column(Boolean, default=False)
    drug_screen = Column(Boolean, default=False)
    questions = Column(Boolean, default=False)
    
    # Recruiter assignment
    assigned_recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    
    # Time tracking
    started_at = Column(DateTime(timezone=True), nullable=True)  # When recruiter starts with visitor
    completed_at = Column(DateTime(timezone=True), nullable=True)  # When recruiter marks as completed
    duration_minutes = Column(Integer, nullable=True)  # Calculated duration in minutes
    
    # Generated row for Excel tracking
    generated_row = Column(Text, nullable=True)  # Tab-separated row generated from template
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship with steps
    steps = relationship("InfoSessionStep", back_populates="info_session", cascade="all, delete-orphan")

class InfoSessionStep(Base):
    __tablename__ = "info_session_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    info_session_id = Column(Integer, ForeignKey("info_sessions.id"), nullable=False)
    step_name = Column(String(100), nullable=False)  # english-communication, education-proof, etc.
    step_description = Column(Text)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    info_session = relationship("InfoSession", back_populates="steps")
