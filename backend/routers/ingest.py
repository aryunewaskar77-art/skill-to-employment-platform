import pandas as pd
import uuid as _uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import timedelta, date

from database import get_db
import models
from identity import backfill_candidate_events

router = APIRouter(prefix="/api/v1/ingest", tags=["ingest"])

def parse_file(file: UploadFile):
    content = file.file.read()
    if file.filename.endswith('.csv'):
        df = pd.read_csv(BytesIO(content))
    elif file.filename.endswith('.json'):
        df = pd.read_json(BytesIO(content))
    else:
        raise HTTPException(status_code=400, detail="Only CSV or JSON files are allowed")

    # replace nan with None
    df = df.replace({pd.NA: None, float('nan'): None})
    return df.to_dict(orient="records")

def _resolve_identities(db: Session) -> dict:
    """Lightweight inline identity resolution: phone-match → auto-link, else auto-new."""
    unresolved = db.query(models.StagingCandidate).filter(
        models.StagingCandidate.resolved == False
    ).all()
    results = {"auto-link": 0, "auto-new": 0, "review-queue": 0}

    for sc in unresolved:
        existing_master = None
        if sc.phone:
            existing_master = db.query(models.MasterCandidate).filter(
                models.MasterCandidate.phone == sc.phone
            ).first()

        if existing_master:
            sc.resolved = True
            sc.master_id = existing_master.id
            results["auto-link"] += 1
        else:
            new_master = models.MasterCandidate(
                id=str(_uuid.uuid4()),
                name=sc.name, dob=sc.dob,
                phone=sc.phone, district=sc.district, course=sc.course
            )
            db.add(new_master)
            sc.resolved = True
            sc.master_id = new_master.id
            results["auto-new"] += 1

    db.commit()
    return results

def trigger_pipeline(db: Session, records_ingested: int):
    """Run lightweight identity resolution then event backfill after each ingest."""
    id_results = _resolve_identities(db)
    backfill_candidate_events(db)

    return {
        "status": "success",
        "records_ingested": records_ingested,
        "auto_linked_count": id_results.get("auto-link", 0),
        "review_queue_count": id_results.get("review-queue", 0),
        "new_candidates_created": id_results.get("auto-new", 0)
    }

@router.post("/training")
def ingest_training(file: UploadFile = File(...), db: Session = Depends(get_db)):
    records = parse_file(file)
    valid_rows = []
    
    for row in records:
        dob_val = row.get('dob')
        dob_parsed = pd.to_datetime(dob_val).date() if pd.notnull(dob_val) and dob_val else None
        
        db_obj = models.StagingCandidate(
            candidate_id=str(row.get('candidate_id', '')),
            name=str(row.get('name', '')) if row.get('name') else None,
            dob=dob_parsed,
            phone=str(row.get('phone', '')) if row.get('phone') else None,
            district=str(row.get('district', '')) if row.get('district') else None,
            course=str(row.get('course', '')) if row.get('course') else None,
            attendance_pct=float(row.get('attendance')) if row.get('attendance') is not None else None,
            resolved=False
        )
        valid_rows.append(db_obj)
        
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return trigger_pipeline(db, len(valid_rows))

@router.post("/certification")
def ingest_certification(file: UploadFile = File(...), db: Session = Depends(get_db)):
    records = parse_file(file)
    valid_rows = []
    
    for row in records:
        issue_val = row.get('issue_date')
        issue_parsed = pd.to_datetime(issue_val).date() if pd.notnull(issue_val) and issue_val else None
        
        db_obj = models.StagingCertification(
            candidate_id=str(row.get('candidate_id', '')),
            nsqf_level=int(row.get('nsqf_level', 0)) if row.get('nsqf_level') else None,
            occupation_code=str(row.get('certificate_number', '')) if row.get('certificate_number') else None,
            issue_date=issue_parsed
        )
        valid_rows.append(db_obj)
        
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return trigger_pipeline(db, len(valid_rows))

@router.post("/employment")
def ingest_employment(file: UploadFile = File(...), db: Session = Depends(get_db)):
    records = parse_file(file)
    valid_rows = []
    
    for row in records:
        join_val = row.get('joining_date')
        join_parsed = pd.to_datetime(join_val).date() if pd.notnull(join_val) and join_val else None
        
        db_obj = models.StagingEmployment(
            candidate_id=str(row.get('candidate_id', '')),
            employer=str(row.get('employer_name', '')) if row.get('employer_name') else None,
            job_role=str(row.get('job_role', '')) if row.get('job_role') else None,
            joining_date=join_parsed,
            wage_band=str(row.get('salary_band', '')) if row.get('salary_band') else None,
            status="verified_employed" if row.get('verified_employed') else "pending"
        )
        valid_rows.append(db_obj)
        
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return trigger_pipeline(db, len(valid_rows))
