"""
Recruiter API endpoints
For recruiters to manage their status and view their assigned visitors
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.recruiter import Recruiter
from app.models.info_session import InfoSession

router = APIRouter()

class RecruiterStatusUpdate(BaseModel):
    status: str  # "available" or "busy"

class RecruiterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    is_active: bool
    status: str

class InfoSessionUpdate(BaseModel):
    ob365_sent: Optional[bool] = None
    i9_sent: Optional[bool] = None
    existing_i9: Optional[bool] = None
    ineligible: Optional[bool] = None
    rejected: Optional[bool] = None
    drug_screen: Optional[bool] = None
    questions: Optional[bool] = None
    status: Optional[str] = None  # "in-progress" or "completed"
    generated_row: Optional[str] = None  # Updated generated row

@router.get("/{recruiter_id}/status", response_model=RecruiterResponse)
async def get_recruiter_status(
    recruiter_id: int,
    db: Session = Depends(get_db)
):
    """Get recruiter status"""
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return RecruiterResponse.model_validate(recruiter).model_dump()

@router.patch("/{recruiter_id}/status")
async def update_recruiter_status(
    recruiter_id: int,
    status_update: RecruiterStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update recruiter status (available/busy)"""
    if status_update.status not in ["available", "busy"]:
        raise HTTPException(status_code=400, detail="Status must be 'available' or 'busy'")
    
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    recruiter.status = status_update.status
    db.commit()
    db.refresh(recruiter)
    
    return {"message": f"Recruiter status updated to {status_update.status}", "recruiter": RecruiterResponse.model_validate(recruiter).model_dump()}

@router.get("/{recruiter_id}/assigned-sessions")
async def get_assigned_sessions(
    recruiter_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all info sessions assigned to a recruiter"""
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    query = db.query(InfoSession).filter(InfoSession.assigned_recruiter_id == recruiter_id)
    
    if status:
        query = query.filter(InfoSession.status == status)
    
    sessions = query.order_by(InfoSession.created_at.desc()).all()
    
    result = []
    for session in sessions:
        session_data = {
            "id": session.id,
            "first_name": session.first_name,
            "last_name": session.last_name,
            "email": session.email,
            "phone": session.phone,
            "zip_code": session.zip_code,
            "session_type": session.session_type,
            "time_slot": session.time_slot,
            "status": session.status,
            "ob365_sent": session.ob365_sent,
            "i9_sent": session.i9_sent,
            "existing_i9": session.existing_i9,
            "ineligible": session.ineligible,
            "rejected": session.rejected,
            "drug_screen": session.drug_screen,
            "questions": session.questions,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "duration_minutes": session.duration_minutes,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "generated_row": session.generated_row if session.generated_row else None,
        }
        result.append(session_data)
    
    return {"sessions": result, "count": len(result)}

@router.post("/{recruiter_id}/sessions/{session_id}/start")
async def start_session(
    recruiter_id: int,
    session_id: int,
    db: Session = Depends(get_db)
):
    """Mark that recruiter has started with a visitor and generate row from template"""
    from app.models.row_template import RowTemplate
    from datetime import date
    
    session = db.query(InfoSession).filter(
        InfoSession.id == session_id,
        InfoSession.assigned_recruiter_id == recruiter_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not assigned to this recruiter")
    
    # Allow reopening in-progress sessions
    if session.started_at and session.status != "in-progress":
        raise HTTPException(status_code=400, detail="Session already started")
    
    # If already in-progress, just return existing data
    if session.status == "in-progress" and session.started_at:
        response = {
            "message": "Session already in progress",
            "started_at": session.started_at.isoformat(),
            "generated_row": session.generated_row
        }
        return response
    
    session.started_at = datetime.utcnow()
    session.status = "in-progress"
    
    # Mark recruiter as busy
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if recruiter:
        recruiter.status = "busy"
    
    # Get recruiter initials
    recruiter_initials = ""
    if recruiter:
        # Extract initials from name (first letter of first name + first letter of last name)
        name_parts = recruiter.name.split()
        if len(name_parts) >= 2:
            recruiter_initials = name_parts[0][0].upper() + name_parts[-1][0].upper()
        elif len(name_parts) == 1:
            recruiter_initials = name_parts[0][0].upper()
    
    # Generate row from template
    generated_row = None
    try:
        # Get the first active template
        template = db.query(RowTemplate).filter(RowTemplate.is_active == True).first()
        
        if template:
            # Prepare data mapping: first_name + last_name -> applicant name, phone -> numero, email -> email
            row_data = {}
            
            # Find columns in template and map data
            for column in template.columns:
                column_name_lower = column.name.lower().strip()
                column_name_upper = column.name.upper().strip()
                
                # Leave FP expiration date blank
                if 'fp' in column_name_lower and 'expiration' in column_name_lower:
                    row_data[column.name] = ""  # Leave blank
                # Map to applicant name (first_name + last_name)
                elif 'applicant' in column_name_lower and 'name' in column_name_lower:
                    row_data[column.name] = f"{session.first_name} {session.last_name}"
                # Map to numero (phone) or talent phone
                elif 'numero' in column_name_lower or ('phone' in column_name_lower and 'numero' in column_name_lower) or ('talent' in column_name_lower and 'phone' in column_name_lower):
                    row_data[column.name] = session.phone
                # Map to email
                elif 'email' in column_name_lower:
                    row_data[column.name] = session.email
                # Map recruiter initials to columns R and O
                elif column_name_upper == 'R' or column_name_upper == 'O':
                    row_data[column.name] = recruiter_initials
                # For date fields, use current date
                elif column.column_type == 'date':
                    row_data[column.name] = date.today().isoformat()
                # For other fields, use default value if available
                elif column.default_value:
                    row_data[column.name] = column.default_value
            
            # Generate the row directly (same logic as generate_row endpoint)
            columns = sorted(template.columns, key=lambda x: x.order)
            row_array = []
            for column in columns:
                value = row_data.get(column.name, column.default_value or "")
                row_array.append(str(value) if value else "")
            
            # Generate tab-separated string for Excel
            generated_row = "\t".join(row_array)
    except Exception as e:
        # Log error but don't fail the start operation
        print(f"Warning: Could not generate row from template: {e}")
        import traceback
        traceback.print_exc()
    
    # Save generated_row to database
    if generated_row:
        session.generated_row = generated_row
    
    db.commit()
    
    response = {"message": "Session started", "started_at": session.started_at.isoformat()}
    if generated_row:
        response["generated_row"] = generated_row
    
    return response

@router.post("/{recruiter_id}/sessions/{session_id}/complete")
async def complete_session(
    recruiter_id: int,
    session_id: int,
    update_data: InfoSessionUpdate,
    db: Session = Depends(get_db)
):
    """Mark that recruiter has completed with a visitor and update document status"""
    session = db.query(InfoSession).filter(
        InfoSession.id == session_id,
        InfoSession.assigned_recruiter_id == recruiter_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not assigned to this recruiter")
    
    # Update document status fields
    if update_data.ob365_sent is not None:
        session.ob365_sent = update_data.ob365_sent
    if update_data.i9_sent is not None:
        session.i9_sent = update_data.i9_sent
    if update_data.existing_i9 is not None:
        session.existing_i9 = update_data.existing_i9
    if update_data.ineligible is not None:
        session.ineligible = update_data.ineligible
    if update_data.rejected is not None:
        session.rejected = update_data.rejected
    if update_data.drug_screen is not None:
        session.drug_screen = update_data.drug_screen
    if update_data.questions is not None:
        session.questions = update_data.questions
    
    # Mark as completed and calculate duration
    if not session.completed_at:
        session.completed_at = datetime.utcnow()
        session.status = "completed"
        
        # Calculate duration from registration (created_at) to completion (completed_at)
        if session.created_at:
            duration = session.completed_at - session.created_at
            session.duration_minutes = int(duration.total_seconds() / 60)
    
    # Mark recruiter as available again
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if recruiter:
        recruiter.status = "available"
    
    db.commit()
    db.refresh(session)
    
    return {
        "message": "Session completed",
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        "duration_minutes": session.duration_minutes
    }

@router.patch("/{recruiter_id}/sessions/{session_id}/update")
async def update_session_documents(
    recruiter_id: int,
    session_id: int,
    update_data: InfoSessionUpdate,
    db: Session = Depends(get_db)
):
    """Update document status for a session (without completing it)"""
    session = db.query(InfoSession).filter(
        InfoSession.id == session_id,
        InfoSession.assigned_recruiter_id == recruiter_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not assigned to this recruiter")
    
    # Update document status fields
    if update_data.ob365_sent is not None:
        session.ob365_sent = update_data.ob365_sent
    if update_data.i9_sent is not None:
        session.i9_sent = update_data.i9_sent
    if update_data.existing_i9 is not None:
        session.existing_i9 = update_data.existing_i9
    if update_data.ineligible is not None:
        session.ineligible = update_data.ineligible
    if update_data.rejected is not None:
        session.rejected = update_data.rejected
    if update_data.drug_screen is not None:
        session.drug_screen = update_data.drug_screen
    if update_data.questions is not None:
        session.questions = update_data.questions
    if update_data.status is not None:
        session.status = update_data.status
    
    db.commit()
    db.refresh(session)
    
    return {"message": "Session updated successfully"}


