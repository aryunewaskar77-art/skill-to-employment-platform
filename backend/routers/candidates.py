from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.get("/{uuid}/timeline")
def get_candidate_timeline(uuid: str, db: Session = Depends(get_db)):
    """
    Returns the full ordered event history (longitudinal outcome model) 
    for a single candidate, powering the candidate journey view.
    """
    # Verify candidate exists
    candidate = db.query(models.MasterCandidate).filter(models.MasterCandidate.id == uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    # Fetch all events for this candidate, ordered by date
    events = (
        db.query(models.CandidateEvent)
        .filter(models.CandidateEvent.candidate_id == uuid)
        .order_by(models.CandidateEvent.event_date.asc(), models.CandidateEvent.created_at.asc())
        .all()
    )
    
    # Fetch provenance / source records
    sources = db.query(models.SourceRecord).filter(models.SourceRecord.candidate_id == uuid).all()
    
    return {
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "dob": candidate.dob,
            "phone": candidate.phone,
            "district": candidate.district,
            "course": candidate.course
        },
        "timeline": [
            {
                "id": ev.id,
                "event_type": ev.event_type,
                "event_date": ev.event_date,
                "source_system": ev.source_system,
                "status": ev.status,
                "raw_payload": ev.raw_payload
            }
            for ev in events
        ],
        "provenance": [
            {
                "id": src.id,
                "source_table": src.source_table,
                "source_id": src.source_id,
                "raw_payload": src.raw_payload
            }
            for src in sources
        ]
    }
