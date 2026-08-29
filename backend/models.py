from sqlalchemy import Column, Integer, String, Float, Date
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
