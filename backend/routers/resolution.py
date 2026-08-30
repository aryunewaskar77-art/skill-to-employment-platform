from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from identity import backfill_candidate_events
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/api/v1/identity", tags=["identity"])

def _resolve_identities(db: Session) -> dict:
    """Inline identity resolution: phone-match → auto-link, else create new master."""
    unresolved = db.query(models.StagingCandidate).filter(
        models.StagingCandidate.resolved == False
    ).all()
    results = {"auto-link": 0, "auto-new": 0, "review-queue": 0}
    for sc in unresolved:
        existing = db.query(models.MasterCandidate).filter(
            models.MasterCandidate.phone == sc.phone
        ).first() if sc.phone else None
        if existing:
            sc.resolved = True; sc.master_id = existing.id
            results["auto-link"] += 1
        else:
            m = models.MasterCandidate(
                id=str(uuid.uuid4()), name=sc.name, dob=sc.dob,
                phone=sc.phone, district=sc.district, course=sc.course
            )
            db.add(m); sc.resolved = True; sc.master_id = m.id
            results["auto-new"] += 1
    db.commit()
    return results

@router.post("/run")
def run_resolution(db: Session = Depends(get_db)):
    """Runs the identity resolution pipeline for all unresolved staging candidates."""
    results = _resolve_identities(db)
    return results

@router.post("/backfill-events")
def backfill_events(db: Session = Depends(get_db)):
    """Backfills candidate events based on staging data mapping."""
    return backfill_candidate_events(db)

@router.get("/review-queue")
def get_review_queue(db: Session = Depends(get_db)):
    """Fetches items in the review queue needing human review, including candidate details."""
    items = db.query(models.ReviewQueue).filter(
        models.ReviewQueue.status.in_(["pending", "NEEDS_HUMAN_REVIEW"])
    ).all()
    
    results = []
    for item in items:
        staging = db.query(models.StagingCandidate).filter(models.StagingCandidate.id == item.staging_id).first()
        master = db.query(models.MasterCandidate).filter(models.MasterCandidate.id == item.proposed_master_id).first()
        
        if not staging or not master:
            continue
            
        results.append({
            "queue_id": item.id,
            "confidence_score": item.confidence_score,
            "match_evidence": item.match_evidence,
            "status": item.status,
            "staging_record": {
                "id": staging.id,
                "name": staging.name,
                "phone": staging.phone,
                "dob": staging.dob,
                "district": staging.district,
                "course": staging.course
            },
            "master_record": {
                "id": master.id,
                "name": master.name,
                "phone": master.phone,
                "dob": master.dob,
                "district": master.district,
                "course": master.course
            }
        })
    return results

class ResolveManualRequest(BaseModel):
    queue_id: int
    action: str # "merge" or "split"

@router.post("/resolve-manual")
def resolve_manual(req: ResolveManualRequest, db: Session = Depends(get_db)):
    item = db.query(models.ReviewQueue).filter(models.ReviewQueue.id == req.queue_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    if item.status == "resolved":
        raise HTTPException(status_code=400, detail="Item already resolved")
        
    staging = db.query(models.StagingCandidate).filter(models.StagingCandidate.id == item.staging_id).first()
    if not staging:
        raise HTTPException(status_code=404, detail="Staging record not found")
        
    if req.action == "merge":
        staging.resolved = True
        staging.master_id = item.proposed_master_id
        
        decision = models.IdentityDecision(
            staging_id=staging.id,
            master_id=item.proposed_master_id,
            decision_type="manual-merge",
            confidence_score=item.confidence_score,
            match_evidence=item.match_evidence
        )
        db.add(decision)
        
    elif req.action == "split":
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
            decision_type="manual-split",
            confidence_score=item.confidence_score,
            match_evidence=item.match_evidence
        )
        db.add(decision)
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'merge' or 'split'")
        
    item.status = "resolved"
    db.commit()
    
    # Backfill events for this specific candidate if needed, but typically done in batch.
    
    return {"status": "success", "action": req.action, "master_id": staging.master_id}

@router.post("/seed-review-samples")
def seed_review_samples(db: Session = Depends(get_db)):
    """Injects synthetic ambiguous candidate records that trigger Tier 3 review status for demo purposes."""
    import datetime as dt

    # Clear existing demo queue items to keep it fresh
    existing_q = db.query(models.ReviewQueue).filter(models.ReviewQueue.status == "NEEDS_HUMAN_REVIEW").all()
    for eq in existing_q:
        db.delete(eq)
    db.commit()

    cases = [
        {
            "desc": "Typo in Name",
            "staging": {"name": "Aarav S. Sharma", "phone": "9123456780", "dob": "2000-01-15", "district": "Pune", "course": "Fitter"},
            "master": {"name": "Arav Sharma", "phone": "9123456780", "dob": "2000-01-15", "district": "Pune", "course": "Fitter"},
            "conf": 0.78,
            "evidence": {"name_sim": 0.85, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Phone Transposition",
            "staging": {"name": "Snehal Deshmukh", "phone": "8877665544", "dob": "2001-02-22", "district": "Nagpur", "course": "Electrician"},
            "master": {"name": "Snehal Deshmukh", "phone": "8877665454", "dob": "2001-02-22", "district": "Nagpur", "course": "Electrician"},
            "conf": 0.81,
            "evidence": {"name_sim": 1.0, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "DOB Day/Month Flip",
            "staging": {"name": "Pooja Patil", "phone": "7766554433", "dob": "2002-05-08", "district": "Nashik", "course": "Welder"},
            "master": {"name": "Pooja Patil", "phone": "7766554433", "dob": "2002-08-05", "district": "Nashik", "course": "Welder"},
            "conf": 0.74,
            "evidence": {"name_sim": 1.0, "dob_match": "close", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Nick/Shortened Name",
            "staging": {"name": "Abhi Shinde", "phone": "9988776655", "dob": "1999-03-10", "district": "Aurangabad", "course": "Turner"},
            "master": {"name": "Abhishek Shinde", "phone": "9988776655", "dob": "1999-03-10", "district": "Aurangabad", "course": "Turner"},
            "conf": 0.71,
            "evidence": {"name_sim": 0.65, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Cross-Scheme Variation",
            "staging": {"name": "Rohan Jadhav", "phone": "8899001122", "dob": "2003-04-14", "district": "Thane (Rural)", "course": "Mechanic"},
            "master": {"name": "Rohan Jadhav", "phone": "8899001122", "dob": "2003-04-14", "district": "Thane", "course": "Auto Mechanic"},
            "conf": 0.68,
            "evidence": {"name_sim": 1.0, "dob_match": "exact", "district_match": False, "course_sim": True}
        },
        {
            "desc": "Maiden Name to Married Name",
            "staging": {"name": "Kavita Kulkarni", "phone": "7788990011", "dob": "1998-11-20", "district": "Solapur", "course": "Data Entry"},
            "master": {"name": "Kavita Joshi", "phone": "7788990011", "dob": "1998-11-20", "district": "Solapur", "course": "Data Entry"},
            "conf": 0.65,
            "evidence": {"name_sim": 0.50, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Initials Expansion",
            "staging": {"name": "M. K. Gandhi", "phone": "9900112233", "dob": "1997-10-02", "district": "Jalgaon", "course": "Machinist"},
            "master": {"name": "Mohandas K. Gandhi", "phone": "9900112233", "dob": "1997-10-02", "district": "Jalgaon", "course": "Machinist"},
            "conf": 0.72,
            "evidence": {"name_sim": 0.60, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Different Course but Same Person",
            "staging": {"name": "Siddharth Verma", "phone": "8811223344", "dob": "2001-07-07", "district": "Amravati", "course": "Web Development"},
            "master": {"name": "Siddharth Verma", "phone": "8811223344", "dob": "2001-07-07", "district": "Amravati", "course": "Python Programming"},
            "conf": 0.79,
            "evidence": {"name_sim": 1.0, "dob_match": "exact", "district_match": True, "course_sim": False}
        },
        {
            "desc": "Missing Middle Name",
            "staging": {"name": "Vikram Singh", "phone": "9922334455", "dob": "2000-12-12", "district": "Kolhapur", "course": "Plumber"},
            "master": {"name": "Vikram Pratap Singh", "phone": "9922334455", "dob": "2000-12-12", "district": "Kolhapur", "course": "Plumber"},
            "conf": 0.75,
            "evidence": {"name_sim": 0.80, "dob_match": "exact", "district_match": True, "course_sim": True}
        },
        {
            "desc": "Minor DOB Error + Typo",
            "staging": {"name": "Anita Desai", "phone": "7733445566", "dob": "1999-06-15", "district": "Latur", "course": "Nursing"},
            "master": {"name": "Anitta Desay", "phone": "7733445566", "dob": "1999-06-16", "district": "Latur", "course": "Nursing"},
            "conf": 0.62,
            "evidence": {"name_sim": 0.75, "dob_match": "close", "district_match": True, "course_sim": True}
        }
    ]

    def parse_dob(dob_str):
        try:
            return dt.datetime.strptime(dob_str, "%Y-%m-%d").date()
        except Exception:
            return None

    for case in cases:
        # Insert Master
        m = models.MasterCandidate(
            id=str(uuid.uuid4()),
            name=case["master"]["name"],
            phone=case["master"]["phone"],
            dob=parse_dob(case["master"]["dob"]),
            district=case["master"]["district"],
            course=case["master"]["course"]
        )
        db.add(m)

        # Insert Staging — only use valid StagingCandidate columns
        s = models.StagingCandidate(
            candidate_id=str(uuid.uuid4()),
            name=case["staging"]["name"],
            phone=case["staging"]["phone"],
            dob=parse_dob(case["staging"]["dob"]),
            district=case["staging"]["district"],
            course=case["staging"]["course"],
            resolved=False
        )
        db.add(s)
        db.flush()  # flush to get s.id without full commit

        # Insert Queue
        q = models.ReviewQueue(
            staging_id=s.id,
            proposed_master_id=m.id,
            confidence_score=case["conf"],
            match_evidence=case["evidence"],
            status="NEEDS_HUMAN_REVIEW"
        )
        db.add(q)

    db.commit()
    return {"status": "success", "message": f"{len(cases)} synthetic test records injected.", "count": len(cases)}

