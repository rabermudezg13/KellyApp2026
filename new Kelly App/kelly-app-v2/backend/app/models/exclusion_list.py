from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base

class ExclusionList(Base):
    __tablename__ = "exclusion_list"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)  # Stored in uppercase for comparison
    code = Column(String(50), nullable=True)
    dob = Column(Date, nullable=True)  # Date of Birth
    ssn = Column(String(20), nullable=True)  # Social Security Number
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

