"""
Info Session API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.info_session import InfoSession, InfoSessionStep
from app.models.recruiter import Recruiter
from app.services.exclusion_service import check_name_in_exclusion_list, is_in_exclusion_list
from app.models.exclusion_list import ExclusionList
from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
from datetime import date
from typing import Optional

router = APIRouter()

# Pydantic models for request/response
class InfoSessionRegistration(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: str
    session_type: str  # new-hire or reactivation
    time_slot: str  # 8:30 AM or 1:30 PM

class ExclusionMatchInfo(BaseModel):
    """Information about exclusion list match"""
    name: str
    code: Optional[str] = None
    ssn: Optional[str] = None

class InfoSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    zip_code: str
    session_type: str
    time_slot: str
    is_in_exclusion_list: bool
    exclusion_warning_shown: bool
    exclusion_match: Optional[ExclusionMatchInfo] = None  # Data from exclusion list if matched
    status: str
    ob365_sent: bool = False
    i9_sent: bool = False
    existing_i9: bool = False
    ineligible: bool = False
    rejected: bool = False
    drug_screen: bool = False
    questions: bool = False
    assigned_recruiter_id: Optional[int] = None
    assigned_recruiter_name: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime

class InfoSessionStepModel(BaseModel):
    step_name: str
    step_description: str
    is_completed: bool

class InfoSessionWithSteps(InfoSessionResponse):
    steps: List[InfoSessionStepModel]

def get_exclusion_match_info(db: Session, first_name: str, last_name: str) -> Optional[ExclusionMatchInfo]:
    """Get exclusion match info for a name"""
    exclusion_matches = check_name_in_exclusion_list(db, first_name, last_name)
    if exclusion_matches:
        first_match = exclusion_matches[0]
        return ExclusionMatchInfo(
            name=first_match.name,
            code=first_match.code,
            ssn=first_match.ssn
        )
    return None

# Default steps for Info Session
DEFAULT_STEPS = [
    {
        "step_name": "english_communication",
        "step_description": "For our process you must be able to communicate in English"
    },
    {
        "step_name": "education_proof",
        "step_description": "Have your Education Proof. If your Education Proof is not from the U.S., you must have the equivalence. If you don't have it, our representatives will inform you how to do it"
    },
    {
        "step_name": "two_government_ids",
        "step_description": "Two Forms of Government ID such as: Driver's License, Social Security Card, U.S. Passport, Birth Certificate, Permanent Resident Card, Work Permit Card. Documents must be physical originals, not copies, and must not be expired"
    }
]

@router.post("/register", response_model=InfoSessionWithSteps, status_code=status.HTTP_201_CREATED)
async def register_info_session(
    registration: InfoSessionRegistration,
    db: Session = Depends(get_db)
):
    """
    Register a new info session
    Checks exclusion list, assigns recruiter, and creates default steps
    """
    # Initialize default recruiters if needed
    initialize_default_recruiters(db)
    
    # Check exclusion list
    exclusion_matches = check_name_in_exclusion_list(
        db, 
        registration.first_name, 
        registration.last_name
    )
    is_excluded = len(exclusion_matches) > 0
    
    # Get exclusion match info (use first match if any)
    exclusion_match_info = None
    if exclusion_matches:
        first_match = exclusion_matches[0]
        exclusion_match_info = ExclusionMatchInfo(
            name=first_match.name,
            code=first_match.code,
            ssn=first_match.ssn
        )
    
    # Assign recruiter equitably
    assigned_recruiter = get_next_recruiter(db, registration.time_slot, date.today())
    
    # Create info session record
    info_session = InfoSession(
        first_name=registration.first_name,
        last_name=registration.last_name,
        email=registration.email,
        phone=registration.phone,
        zip_code=registration.zip_code,
        session_type=registration.session_type,
        time_slot=registration.time_slot,
        is_in_exclusion_list=is_excluded,
        exclusion_warning_shown=is_excluded,
        status="registered",
        assigned_recruiter_id=assigned_recruiter.id if assigned_recruiter else None
    )
    
    db.add(info_session)
    db.commit()
    db.refresh(info_session)
    
    # Create default steps
    for step_data in DEFAULT_STEPS:
        step = InfoSessionStep(
            info_session_id=info_session.id,
            step_name=step_data["step_name"],
            step_description=step_data["step_description"],
            is_completed=False
        )
        db.add(step)
    
    db.commit()
    db.refresh(info_session)
    
    # Return with steps
    # Get recruiter name if assigned
    recruiter_name = None
    if assigned_recruiter:
        recruiter_name = assigned_recruiter.name
    
    # Get steps
    steps_data = [
        {
            "step_name": step.step_name,
            "step_description": step.step_description,
            "is_completed": step.is_completed
        }
        for step in info_session.steps
    ]
    
    response_data = InfoSessionResponse.model_validate(info_session).model_dump()
    response_data["assigned_recruiter_name"] = recruiter_name
    response_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
    response_data["steps"] = steps_data
    return response_data

@router.get("/live")
async def get_live_info_sessions(db: Session = Depends(get_db)):
    """Get live info sessions (registered but not completed)"""
    sessions = db.query(InfoSession).options(joinedload(InfoSession.steps)).filter(
        InfoSession.status.in_(["registered", "in-progress"])
    ).order_by(InfoSession.created_at.desc()).all()
    
    result = []
    for session in sessions:
        recruiter_name = None
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                recruiter_name = recruiter.name
        
        exclusion_match = None
        if session.is_in_exclusion_list:
            try:
                matches = check_name_in_exclusion_list(db, session.first_name, session.last_name)
                if matches and len(matches) > 0:
                    first_match = matches[0]
                    exclusion_match = {
                        "name": first_match.name if first_match.name else None,
                        "code": first_match.code if first_match.code else None,
                        "ssn": first_match.ssn if first_match.ssn else None
                    }
            except Exception as e:
                print(f"Error getting exclusion match: {e}")
                exclusion_match = None
        
        steps = []
        for step in session.steps:
            steps.append({
                "step_name": step.step_name,
                "step_description": step.step_description if step.step_description else "",
                "is_completed": step.is_completed
            })
        
        item = {
            "id": session.id,
            "first_name": session.first_name,
            "last_name": session.last_name,
            "email": session.email,
            "phone": session.phone,
            "zip_code": session.zip_code if session.zip_code else "",
            "session_type": session.session_type,
            "time_slot": session.time_slot,
            "is_in_exclusion_list": bool(session.is_in_exclusion_list),
            "exclusion_warning_shown": bool(session.exclusion_warning_shown),
            "status": session.status,
            "ob365_sent": bool(session.ob365_sent) if hasattr(session, 'ob365_sent') and session.ob365_sent is not None else False,
            "i9_sent": bool(session.i9_sent) if hasattr(session, 'i9_sent') and session.i9_sent is not None else False,
            "existing_i9": bool(session.existing_i9) if hasattr(session, 'existing_i9') and session.existing_i9 is not None else False,
            "ineligible": bool(session.ineligible) if hasattr(session, 'ineligible') and session.ineligible is not None else False,
            "rejected": bool(session.rejected) if hasattr(session, 'rejected') and session.rejected is not None else False,
            "drug_screen": bool(session.drug_screen) if hasattr(session, 'drug_screen') and session.drug_screen is not None else False,
            "questions": bool(session.questions) if hasattr(session, 'questions') and session.questions is not None else False,
            "assigned_recruiter_id": session.assigned_recruiter_id,
            "assigned_recruiter_name": recruiter_name,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "duration_minutes": session.duration_minutes,
            "created_at": session.created_at.isoformat(),
            "exclusion_match": exclusion_match,
            "steps": steps
        }
        result.append(item)
    
    return result

@router.get("/completed")
async def get_completed_info_sessions(db: Session = Depends(get_db)):
    """Get completed info sessions"""
    sessions = db.query(InfoSession).options(joinedload(InfoSession.steps)).filter(
        InfoSession.status == "completed"
    ).order_by(InfoSession.completed_at.desc()).all()
    
    result = []
    for session in sessions:
        recruiter_name = None
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                recruiter_name = recruiter.name
        
        exclusion_match = None
        if session.is_in_exclusion_list:
            try:
                matches = check_name_in_exclusion_list(db, session.first_name, session.last_name)
                if matches and len(matches) > 0:
                    first_match = matches[0]
                    exclusion_match = {
                        "name": first_match.name if first_match.name else None,
                        "code": first_match.code if first_match.code else None,
                        "ssn": first_match.ssn if first_match.ssn else None
                    }
            except Exception as e:
                print(f"Error getting exclusion match: {e}")
                exclusion_match = None
        
        steps = []
        for step in session.steps:
            steps.append({
                "step_name": step.step_name,
                "step_description": step.step_description if step.step_description else "",
                "is_completed": step.is_completed
            })
        
        item = {
            "id": session.id,
            "first_name": session.first_name,
            "last_name": session.last_name,
            "email": session.email,
            "phone": session.phone,
            "zip_code": session.zip_code if session.zip_code else "",
            "session_type": session.session_type,
            "time_slot": session.time_slot,
            "is_in_exclusion_list": bool(session.is_in_exclusion_list),
            "exclusion_warning_shown": bool(session.exclusion_warning_shown),
            "status": session.status,
            "ob365_sent": bool(session.ob365_sent) if hasattr(session, 'ob365_sent') and session.ob365_sent is not None else False,
            "i9_sent": bool(session.i9_sent) if hasattr(session, 'i9_sent') and session.i9_sent is not None else False,
            "existing_i9": bool(session.existing_i9) if hasattr(session, 'existing_i9') and session.existing_i9 is not None else False,
            "ineligible": bool(session.ineligible) if hasattr(session, 'ineligible') and session.ineligible is not None else False,
            "rejected": bool(session.rejected) if hasattr(session, 'rejected') and session.rejected is not None else False,
            "drug_screen": bool(session.drug_screen) if hasattr(session, 'drug_screen') and session.drug_screen is not None else False,
            "questions": bool(session.questions) if hasattr(session, 'questions') and session.questions is not None else False,
            "assigned_recruiter_id": session.assigned_recruiter_id,
            "assigned_recruiter_name": recruiter_name,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "duration_minutes": session.duration_minutes,
            "created_at": session.created_at.isoformat(),
            "exclusion_match": exclusion_match,
            "steps": steps
        }
        result.append(item)
    
    return result

@router.get("/{session_id}", response_model=InfoSessionWithSteps)
async def get_info_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get info session by ID"""
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        raise HTTPException(status_code=404, detail="Info session not found")
    
    # Get recruiter name if assigned
    recruiter_name = None
    if info_session.assigned_recruiter_id:
        recruiter = db.query(Recruiter).filter(Recruiter.id == info_session.assigned_recruiter_id).first()
        if recruiter:
            recruiter_name = recruiter.name
    
    # Get steps
    steps_data = [
        {
            "step_name": step.step_name,
            "step_description": step.step_description,
            "is_completed": step.is_completed
        }
        for step in info_session.steps
    ]
    
    # Get exclusion match info if in exclusion list
    exclusion_match_info = None
    if info_session.is_in_exclusion_list:
        exclusion_match_info = get_exclusion_match_info(
            db, info_session.first_name, info_session.last_name
        )
    
    response_data = InfoSessionResponse.model_validate(info_session).model_dump()
    response_data["assigned_recruiter_name"] = recruiter_name
    response_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
    response_data["steps"] = steps_data
    return response_data

@router.patch("/{session_id}/steps/{step_name}/complete")
async def complete_step(
    session_id: int,
    step_name: str,
    db: Session = Depends(get_db)
):
    """Mark a step as completed"""
    step = db.query(InfoSessionStep).filter(
        InfoSessionStep.info_session_id == session_id,
        InfoSessionStep.step_name == step_name
    ).first()
    
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step.is_completed = True
    step.completed_at = datetime.utcnow()
    
    # Check if all steps are completed, then assign recruiter if not assigned
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if info_session:
        all_steps_completed = all(s.is_completed for s in info_session.steps)
        if all_steps_completed and not info_session.assigned_recruiter_id:
            # Mark as completed and assign recruiter
            info_session.status = "completed"
            info_session.completed_at = datetime.utcnow()
            
            # Assign recruiter when all steps are completed
            from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
            from datetime import date
            initialize_default_recruiters(db)
            recruiter = get_next_recruiter(db, info_session.time_slot, date.today())
            if recruiter:
                info_session.assigned_recruiter_id = recruiter.id
    
    db.commit()
    
    return {"message": "Step completed successfully", "step": step_name}

@router.post("/{session_id}/complete")
async def complete_info_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Mark info session as completed and assign recruiter"""
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        raise HTTPException(status_code=404, detail="Info session not found")
    
    if info_session.status == "completed":
        return {"message": "Session already completed", "session_id": session_id}
    
    # Mark as completed
    info_session.status = "completed"
    info_session.completed_at = datetime.utcnow()
    
    # Calculate duration from registration (created_at) to completion (completed_at)
    if info_session.created_at:
        duration = info_session.completed_at - info_session.created_at
        info_session.duration_minutes = int(duration.total_seconds() / 60)
    
    # Assign recruiter if not already assigned
    if not info_session.assigned_recruiter_id:
        initialize_default_recruiters(db)
        recruiter = get_next_recruiter(db, info_session.time_slot, date.today())
        if recruiter:
            info_session.assigned_recruiter_id = recruiter.id
    
    db.commit()
    db.refresh(info_session)
    
    return {"message": "Info session completed successfully", "session_id": session_id}

@router.get("/", response_model=List[InfoSessionResponse])
async def list_info_sessions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all info sessions (for staff dashboard)"""
    query = db.query(InfoSession)
    
    if status:
        query = query.filter(InfoSession.status == status)
    
    sessions = query.order_by(InfoSession.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for session in sessions:
        session_data = InfoSessionResponse.model_validate(session).model_dump()
        # Get recruiter name if assigned
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                session_data["assigned_recruiter_name"] = recruiter.name
        # Get exclusion match info if in exclusion list
        if session.is_in_exclusion_list:
            exclusion_match_info = get_exclusion_match_info(db, session.first_name, session.last_name)
            session_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
        # Include all new fields
        session_data["rejected"] = session.rejected
        session_data["drug_screen"] = session.drug_screen
        session_data["questions"] = session.questions
        session_data["started_at"] = session.started_at.isoformat() if session.started_at else None
        session_data["completed_at"] = session.completed_at.isoformat() if session.completed_at else None
        session_data["duration_minutes"] = session.duration_minutes
        result.append(session_data)
    return result


@router.get("/exclusion-check/{first_name}/{last_name}")
async def check_exclusion(
    first_name: str,
    last_name: str,
    db: Session = Depends(get_db)
):
    """Check if a name is in exclusion list"""
    try:
        matches = check_name_in_exclusion_list(db, first_name, last_name)
        is_excluded = len(matches) > 0
        
        return {
            "is_in_exclusion_list": is_excluded,
            "matches": [
                {
                    "id": match.id,
                    "name": match.name,
                    "code": match.code,
                    "ssn": match.ssn,
                    "dob": match.dob.isoformat() if match.dob else None,
                    "notes": match.notes
                }
                for match in matches
            ],
            "warning_message": "Please verify social and data to verify that this person is on the PC or RR list" if is_excluded else None
        }
    except Exception as e:
        import traceback
        print(f"Error in check_exclusion: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error checking exclusion list: {str(e)}")

