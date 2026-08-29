from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/state-summary")
def get_state_summary(db: Session = Depends(get_db)):
    """
    Returns KPI counts of distinct candidates by event type.
    """
    counts = (
        db.query(models.CandidateEvent.event_type, func.count(func.distinct(models.CandidateEvent.candidate_id)))
        .group_by(models.CandidateEvent.event_type)
        .all()
    )
    
    # Pre-fill standard expected fields to 0
    summary = {
        "enrolled": 0,
        "trained": 0,
        "certified": 0,
        "placed": 0,
        "verified_employed": 0
    }
    
    for event_type, count in counts:
        summary[event_type] = count
        
    return summary
