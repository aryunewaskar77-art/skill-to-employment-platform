from sqlalchemy import Column, Integer, String, Float, Date, JSON, Boolean, DateTime
import uuid
import datetime
from database import Base

class StagingCandidate(Base):
    __tablename__ = "staging_candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, index=True)
    name = Column(String)
    dob = Column(Date, nullable=True)
    phone = Column(String)
    district = Column(String)
    course = Column(String)
    batch_id = Column(String)
    attendance_pct = Column(Float, nullable=True)
    assessment_score = Column(Float, nullable=True)
    resolved = Column(Boolean, default=False)
    master_id = Column(String, nullable=True)

class StagingCertification(Base):
    __tablename__ = "staging_certifications"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, index=True)
    nsqf_level = Column(Integer)
    occupation_code = Column(String)
    issue_date = Column(Date, nullable=True)

class StagingEmployment(Base):
    __tablename__ = "staging_employment"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, index=True)
    employer = Column(String)
    job_role = Column(String)
    joining_date = Column(Date, nullable=True)
    status = Column(String)
    wage_band = Column(String)

class MasterCandidate(Base):
    __tablename__ = "master_candidates"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    dob = Column(Date, nullable=True)
    phone = Column(String, index=True)
    district = Column(String)
    course = Column(String)

class ReviewQueue(Base):
    __tablename__ = "review_queue"
    id = Column(Integer, primary_key=True, index=True)
    staging_id = Column(Integer, index=True)
    proposed_master_id = Column(String)
    confidence_score = Column(Float)
    match_evidence = Column(JSON)
    status = Column(String, default="pending")

class IdentityDecision(Base):
    __tablename__ = "identity_decisions"
    id = Column(Integer, primary_key=True, index=True)
    staging_id = Column(Integer)
    master_id = Column(String)
    decision_type = Column(String)
    confidence_score = Column(Float)
    match_evidence = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
