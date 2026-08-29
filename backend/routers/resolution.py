from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from identity import resolve_identities
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/resolution", tags=["resolution"])

@router.post("/run")
def run_resolution(db: Session = Depends(get_db)):
    """Runs the identity resolution pipeline for all unresolved staging candidates."""
    results = resolve_identities(db)
    return results

@router.get("/review-queue")
def get_review_queue(db: Session = Depends(get_db)):
    """Fetches all pending items in the review queue."""
    items = db.query(models.ReviewQueue).filter(models.ReviewQueue.status == "pending").all()
    return items

class ResolveRequest(BaseModel):
    action: str # "accept" or "reject"

@router.post("/review-queue/{queue_id}/resolve")
def resolve_queue_item(queue_id: int, req: ResolveRequest, db: Session = Depends(get_db)):
    """Resolves a specific queue item by manually accepting or rejecting the proposed match."""
    item = db.query(models.ReviewQueue).filter(models.ReviewQueue.id == queue_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    if item.status != "pending":
        raise HTTPException(status_code=400, detail="Item already resolved")
        
    staging = db.query(models.StagingCandidate).filter(models.StagingCandidate.id == item.staging_id).first()
    if not staging:
        raise HTTPException(status_code=404, detail="Staging record not found")
        
    if req.action == "accept":
        staging.resolved = True
        staging.master_id = item.proposed_master_id
        
        decision = models.IdentityDecision(
            staging_id=staging.id,
            master_id=item.proposed_master_id,
            decision_type="manual-accept",
            confidence_score=item.confidence_score,
            match_evidence=item.match_evidence
        )
        db.add(decision)
        
    elif req.action == "reject":
        # Create new master candidate
        new_master = models.MasterCandidate(
            id=str(uuid.uuid4()),
            name=staging.name,
            dob=staging.dob,
            phone=staging.phone,
            district=staging.district,
            course=staging.course
        )
        db.add(new_master)
        
        staging.resolved = True
        staging.master_id = new_master.id
        
        decision = models.IdentityDecision(
            staging_id=staging.id,
            master_id=new_master.id,
            decision_type="manual-reject",
            confidence_score=item.confidence_score,
            match_evidence=item.match_evidence
        )
        db.add(decision)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    item.status = "resolved"
    db.commit()
    
    return {"status": "success", "action": req.action, "master_id": staging.master_id}
