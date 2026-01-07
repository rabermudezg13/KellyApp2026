"""
Exclusion List API endpoints
For managing the exclusion list (PC/RR list)
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import pandas as pd
import io
from dateutil import parser

from app.database import get_db
from app.models.exclusion_list import ExclusionList
from app.models.user import User
from app.api.auth import get_current_admin

router = APIRouter()

class ExclusionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    code: Optional[str] = None
    dob: Optional[datetime] = None
    ssn: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

class ExclusionListResponse(BaseModel):
    items: List[ExclusionListItem]
    total: int

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_exclusion_list(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Upload Excel file with exclusion list
    Expected columns: name, Code, DOB, SSN
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)"
        )
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Normalize column names (case-insensitive)
        df.columns = df.columns.str.strip().str.lower()
        
        # Check required columns
        required_columns = ['name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Clear existing exclusion list
        db.query(ExclusionList).delete()
        db.commit()
        
        # Process and insert rows
        added_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Get name (required)
                name = str(row.get('name', '')).strip()
                if not name or name == 'nan':
                    continue
                
                # Convert name to uppercase for storage (as specified)
                name_upper = name.upper()
                
                # Get optional fields
                code = str(row.get('code', '')).strip() if pd.notna(row.get('code')) else None
                code = code if code and code != 'nan' else None
                
                ssn = str(row.get('ssn', '')).strip() if pd.notna(row.get('ssn')) else None
                ssn = ssn if ssn and ssn != 'nan' else None
                
                # Parse DOB
                dob = None
                if pd.notna(row.get('dob')):
                    try:
                        dob_value = row.get('dob')
                        if isinstance(dob_value, str):
                            dob = parser.parse(dob_value).date()
                        elif hasattr(dob_value, 'date'):
                            dob = dob_value.date()
                        else:
                            dob = pd.to_datetime(dob_value).date()
                    except:
                        pass
                
                # Create exclusion list item
                exclusion_item = ExclusionList(
                    name=name_upper,
                    code=code,
                    dob=dob,
                    ssn=ssn
                )
                db.add(exclusion_item)
                added_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Exclusion list uploaded successfully",
            "added": added_count,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/list", response_model=ExclusionListResponse)
async def list_exclusion_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """List all exclusion list items (admin only)"""
    items = db.query(ExclusionList).offset(skip).limit(limit).all()
    total = db.query(ExclusionList).count()
    
    return {
        "items": items,
        "total": total
    }

@router.delete("/clear")
async def clear_exclusion_list(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Clear all exclusion list items (admin only)"""
    count = db.query(ExclusionList).delete()
    db.commit()
    
    return {
        "message": f"Exclusion list cleared. {count} items removed."
    }

