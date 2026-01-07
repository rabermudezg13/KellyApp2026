from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class NewHireOrientation(Base):
    __tablename__ = "new_hire_orientations"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    zip_code = Column(String(10), nullable=True)
    time_slot = Column(String(20), nullable=False)
    status = Column(String(50), default="registered")
    assigned_recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    zip_code = Column(String(10), nullable=True)
    appointment_time = Column(String(20), nullable=False)
    status = Column(String(50), default="registered")
    assigned_recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Fingerprint(Base):
    __tablename__ = "fingerprints"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    zip_code = Column(String(10), nullable=True)
    appointment_time = Column(String(20), nullable=False)
    fingerprint_type = Column(String(50), nullable=False)  # regular or dcf
    status = Column(String(50), default="registered")
    assigned_recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TeamVisit(Base):
    __tablename__ = "team_visits"
    
    id = Column(Integer, primary_key=True, index=True)
    visitor_name = Column(String(100), nullable=False)
    visitor_email = Column(String(255), nullable=True)
    team = Column(String(100), nullable=False)
    team_member_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Staff member
    team_member_name = Column(String(100), nullable=True)
    team_member_email = Column(String(255), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, notified, completed
    notified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


