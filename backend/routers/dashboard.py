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

@router.get("/skills-list")
def get_skills_list(db: Session = Depends(get_db)):
    """
    Returns a unique list of all available skills/courses.
    """
    skills = (
        db.query(models.MasterCandidate.course)
        .filter(models.MasterCandidate.course != None)
        .distinct()
        .order_by(models.MasterCandidate.course)
        .all()
    )
    return [s[0] for s in skills if s[0]]

@router.get("/skill-stats/{skill_name}")
def get_skill_stats(skill_name: str, db: Session = Depends(get_db)):
    """
    Returns detailed pipeline stats, job demand, and district distribution for a specific skill.
    """
    # Relax search string for basic LIKE match
    search_term = f"%{skill_name}%"
    
    # 1. Pipeline Funnel (Events for candidates enrolled in this course)
    candidates_subquery = db.query(models.MasterCandidate.id).filter(
        models.MasterCandidate.course.ilike(search_term)
    ).subquery()
    
    counts = (
        db.query(models.CandidateEvent.event_type, func.count(func.distinct(models.CandidateEvent.candidate_id)))
        .filter(models.CandidateEvent.candidate_id.in_(candidates_subquery))
        .group_by(models.CandidateEvent.event_type)
        .all()
    )
    
    pipeline = {
        "enrolled": 0, "trained": 0, "certified": 0, "placed": 0, "verified_employed": 0
    }
    for event_type, count in counts:
        if event_type in pipeline:
            pipeline[event_type] = count
            
    # 2. District Distribution (Enrolled base)
    district_counts = (
        db.query(models.MasterCandidate.district, func.count(models.MasterCandidate.id))
        .filter(models.MasterCandidate.course.ilike(search_term))
        .group_by(models.MasterCandidate.district)
        .order_by(func.count(models.MasterCandidate.id).desc())
        .limit(10)
        .all()
    )
    districts = [{"district": d, "count": c} for d, c in district_counts]
    
    # 3. Job Demand (Job Postings matching skill)
    job_demand = db.query(func.sum(models.StagingJobPosting.openings)).filter(
        models.StagingJobPosting.skill_requirements.ilike(search_term)
    ).scalar() or 0
    
    return {
        "skill": skill_name,
        "pipeline": pipeline,
        "districts": districts,
        "job_demand": int(job_demand)
    }

