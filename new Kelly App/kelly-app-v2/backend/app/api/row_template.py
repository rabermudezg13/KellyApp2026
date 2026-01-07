"""
Row Template API endpoints
For managing row templates and generating Excel rows
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db
from app.models.row_template import RowTemplate, ColumnDefinition
from app.models.user import User
from app.api.auth import get_current_admin, get_current_user

router = APIRouter()

# Pydantic models
class ColumnDefinitionCreate(BaseModel):
    order: int
    name: str
    column_type: str  # text, dropdown, note, date, number
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None  # For dropdown
    is_required: bool = False
    default_value: Optional[str] = None
    notes: Optional[str] = None

class ColumnDefinitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    template_id: int
    order: int
    name: str
    column_type: str
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None
    is_required: bool
    default_value: Optional[str] = None
    notes: Optional[str] = None

class RowTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    columns: List[ColumnDefinitionCreate]
    is_active: bool = True

class RowTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    columns: Optional[List[ColumnDefinitionCreate]] = None
    is_active: Optional[bool] = None

class RowTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    columns: List[ColumnDefinitionResponse]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('created_at')
    def serialize_created_at(self, value: datetime, _info) -> str:
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    @field_serializer('updated_at')
    def serialize_updated_at(self, value: Optional[datetime], _info) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)

class RowDataInput(BaseModel):
    """Input data for generating a row"""
    template_id: int
    data: Dict[str, Any]  # Column name -> value mapping

class RowOutput(BaseModel):
    """Generated row output"""
    row_text: str  # Tab-separated values for Excel
    row_array: List[str]  # Array of values

# CRUD endpoints
@router.post("/", response_model=RowTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_row_template(
    template_data: RowTemplateCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Create a new row template (admin only)"""
    try:
        # Check if name already exists
        existing = db.query(RowTemplate).filter(RowTemplate.name == template_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template name already exists"
            )
        
        # Create template
        template = RowTemplate(
            name=template_data.name,
            description=template_data.description,
            is_active=template_data.is_active
        )
        db.add(template)
        db.flush()  # Get template ID
        
        # Create columns
        for col_data in template_data.columns:
            column = ColumnDefinition(
                template_id=template.id,
                order=col_data.order,
                name=col_data.name,
                column_type=col_data.column_type,
                placeholder=col_data.placeholder,
                options=col_data.options if col_data.options else None,
                is_required=col_data.is_required,
                default_value=col_data.default_value,
                notes=col_data.notes
            )
            db.add(column)
        
        db.commit()
        db.refresh(template)
        
        # Convert to dict and serialize dates manually
        response = RowTemplateResponse.model_validate(template)
        response_dict = response.model_dump(mode='json')
        return response_dict
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating template: {str(e)}"
        )

@router.get("/", response_model=List[RowTemplateResponse])
async def list_row_templates(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all row templates"""
    query = db.query(RowTemplate)
    if active_only:
        query = query.filter(RowTemplate.is_active == True)
    
    templates = query.order_by(RowTemplate.created_at.desc()).all()
    return [RowTemplateResponse.model_validate(t).model_dump(mode='json') for t in templates]

@router.get("/{template_id}", response_model=RowTemplateResponse)
async def get_row_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific row template"""
    template = db.query(RowTemplate).filter(RowTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Convert to dict and serialize dates manually
    response = RowTemplateResponse.model_validate(template)
    response_dict = response.model_dump(mode='json')
    return response_dict

@router.put("/{template_id}", response_model=RowTemplateResponse)
async def update_row_template(
    template_id: int,
    template_data: RowTemplateUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Update a row template (admin only)"""
    try:
        template = db.query(RowTemplate).filter(RowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Update template fields
        if template_data.name is not None:
            # Check if new name conflicts
            existing = db.query(RowTemplate).filter(
                RowTemplate.name == template_data.name,
                RowTemplate.id != template_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Template name already exists"
                )
            template.name = template_data.name
        
        if template_data.description is not None:
            template.description = template_data.description
        
        if template_data.is_active is not None:
            template.is_active = template_data.is_active
        
        # Update columns if provided
        if template_data.columns is not None:
            try:
                # Delete existing columns
                db.query(ColumnDefinition).filter(ColumnDefinition.template_id == template_id).delete()
                
                # Create new columns
                for col_data in template_data.columns:
                    column = ColumnDefinition(
                        template_id=template.id,
                        order=col_data.order,
                        name=col_data.name,
                        column_type=col_data.column_type,
                        placeholder=col_data.placeholder,
                        options=col_data.options if col_data.options else None,
                        is_required=col_data.is_required,
                        default_value=col_data.default_value,
                        notes=col_data.notes
                    )
                    db.add(column)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error updating columns: {str(e)}"
                )
        
        db.commit()
        db.refresh(template)
        
        # Convert to dict and serialize dates manually
        response = RowTemplateResponse.model_validate(template)
        response_dict = response.model_dump(mode='json')
        return response_dict
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating template: {str(e)}"
        )

@router.delete("/{template_id}")
async def delete_row_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Delete a row template (admin only)"""
    template = db.query(RowTemplate).filter(RowTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    
    return {"message": "Template deleted successfully"}

# Row generation endpoint
@router.post("/generate-row", response_model=RowOutput)
async def generate_row(
    row_input: RowDataInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a row from template and data"""
    template = db.query(RowTemplate).filter(
        RowTemplate.id == row_input.template_id,
        RowTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or inactive")
    
    # Get columns in order
    columns = sorted(template.columns, key=lambda x: x.order)
    
    # Build row array
    row_array = []
    for column in columns:
        value = row_input.data.get(column.name, column.default_value or "")
        
        # Validate required fields
        if column.is_required and not value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Required field '{column.name}' is missing"
            )
        
        # Validate dropdown options
        if column.column_type == "dropdown" and column.options:
            if value not in column.options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid value for '{column.name}'. Must be one of: {', '.join(column.options)}"
                )
        
        row_array.append(str(value) if value else "")
    
    # Generate tab-separated string for Excel
    row_text = "\t".join(row_array)
    
    return {
        "row_text": row_text,
        "row_array": row_array
    }

