"""
Service for checking exclusion list
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.exclusion_list import ExclusionList
from typing import List, Optional

def check_name_in_exclusion_list(db: Session, first_name: str, last_name: str) -> List[ExclusionList]:
    """
    Check if a name is in the exclusion list
    Returns list of matching records
    Compares names case-insensitively (names in DB are stored in uppercase)
    """
    if not first_name or not last_name:
        return []
    
    # Normalize names for comparison - convert to uppercase to match DB storage
    first_name_upper = first_name.strip().upper()
    last_name_upper = last_name.strip().upper()
    full_name_upper = f"{first_name_upper} {last_name_upper}"
    
    # Search for matches - names in DB are stored in uppercase
    # Check if first and last name match any record
    matches = db.query(ExclusionList).filter(
        or_(
            func.upper(ExclusionList.name).like(f"%{first_name_upper}%"),
            func.upper(ExclusionList.name).like(f"%{last_name_upper}%"),
            func.upper(ExclusionList.name).like(f"%{full_name_upper}%")
        )
    ).all()
    
    # Filter to ensure both first and last name are present in the match
    filtered_matches = []
    for match in matches:
        match_name_upper = match.name.upper()
        if first_name_upper in match_name_upper and last_name_upper in match_name_upper:
            filtered_matches.append(match)
    
    return filtered_matches

def is_in_exclusion_list(db: Session, first_name: str, last_name: str) -> bool:
    """
    Simple check if name is in exclusion list
    Returns True if found, False otherwise
    """
    matches = check_name_in_exclusion_list(db, first_name, last_name)
    return len(matches) > 0


