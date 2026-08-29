import csv
from io import StringIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(prefix="/ingest", tags=["ingest"])

def process_csv(file: UploadFile, schema_class, db_model_class, db: Session):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(content))
    
    received = 0
    accepted = 0
    rejected = 0
    reasons = []
    
    valid_rows = []
    
    for row_idx, row in enumerate(reader, start=2): # 1 is header
        received += 1
        try:
            # Clean empty strings to None
            cleaned_row = {k: (v if v.strip() != "" else None) for k, v in row.items()}
            # Validate and normalize
            obj = schema_class(**cleaned_row)
            # Create DB model
            db_obj = db_model_class(**obj.model_dump())
            valid_rows.append(db_obj)
            accepted += 1
        except Exception as e:
            rejected += 1
            reasons.append({"row_index": row_idx, "reason": str(e)})
            
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return {
        "received": received,
        "accepted": accepted,
        "rejected": rejected,
        "reasons": reasons
    }

@router.post("/candidates")
def ingest_candidates(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    return process_csv(file, schemas.CandidateIngest, models.StagingCandidate, db)

@router.post("/certifications")
def ingest_certifications(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    return process_csv(file, schemas.CertificationIngest, models.StagingCertification, db)

@router.post("/employment")
def ingest_employment(payload: List[dict], db: Session = Depends(get_db)):
    received = len(payload)
    accepted = 0
    rejected = 0
    reasons = []
    
    valid_rows = []
    
    for row_idx, row in enumerate(payload, start=1):
        try:
            obj = schemas.EmploymentIngest(**row)
            db_obj = models.StagingEmployment(**obj.model_dump())
            valid_rows.append(db_obj)
            accepted += 1
        except Exception as e:
            rejected += 1
            reasons.append({"row_index": row_idx, "reason": str(e)})
            
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return {
        "received": received,
        "accepted": accepted,
        "rejected": rejected,
        "reasons": reasons
    }

@router.post("/job-postings")
def ingest_job_postings(payload: List[dict], db: Session = Depends(get_db)):
    received = len(payload)
    accepted = 0
    rejected = 0
    reasons = []
    
    valid_rows = []
    
    for row_idx, row in enumerate(payload, start=1):
        try:
            obj = schemas.JobPostingIngest(**row)
            db_obj = models.StagingJobPosting(**obj.model_dump())
            valid_rows.append(db_obj)
            accepted += 1
        except Exception as e:
            rejected += 1
            reasons.append({"row_index": row_idx, "reason": str(e)})
            
    if valid_rows:
        db.add_all(valid_rows)
        db.commit()
        
    return {
        "received": received,
        "accepted": accepted,
        "rejected": rejected,
        "reasons": reasons
    }
