from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class RowTemplate(Base):
    __tablename__ = "row_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)  # Template name
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to columns
    columns = relationship("ColumnDefinition", back_populates="template", cascade="all, delete-orphan", order_by="ColumnDefinition.order")

class ColumnDefinition(Base):
    __tablename__ = "column_definitions"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("row_templates.id"), nullable=False)
    order = Column(Integer, nullable=False)  # Order of column in the row
    name = Column(String(255), nullable=False)  # Column name/label
    column_type = Column(String(50), nullable=False)  # text, dropdown, note, date, number
    placeholder = Column(String(255), nullable=True)  # Placeholder text
    options = Column(JSON, nullable=True)  # For dropdown: list of options
    is_required = Column(Boolean, default=False)
    default_value = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)  # Instructions for this column
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to template
    template = relationship("RowTemplate", back_populates="columns")

