from datetime import timedelta, date, datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from models import CandidateEvent, StagingEmployment, MasterCandidate

def backfill_candidate_events(db: Session):
    # Fetch existing placement records
    placements = db.query(StagingEmployment).all()

    for emp in placements:
        # Resolve associated master candidate
        master = db.query(MasterCandidate).filter(
            (MasterCandidate.phone == emp.phone) | 
            (MasterCandidate.id == emp.master_candidate_id)
        ).first()

        if not master:
            continue

        base_date = emp.joining_date or date(2025, 8, 1)
        if isinstance(base_date, str):
            base_date = datetime.strptime(base_date, "%Y-%m-%d").date()

        # Define downstream milestones
        milestones = [
            ("verified_employed", timedelta(days=7), "Verified via Statutory / EPFO Connector (Mock)"),
            ("retained_3m", timedelta(days=90), f"Retained — 3 months at {emp.employer_name or 'Industry Partner'}"),
            ("retained_6m", timedelta(days=180), f"Retained — 6 months at {emp.employer_name or 'Industry Partner'}"),
            ("retained_12m", timedelta(days=365), f"Retained — 12 months at {emp.employer_name or 'Industry Partner'}")
        ]

        for event_type, delta, description in milestones:
            event_date = base_date + delta
            
            # Avoid duplicate insertion
            existing = db.query(CandidateEvent).filter_by(
                candidate_id=master.id,
                event_type=event_type
            ).first()

            if not existing:
                new_event = CandidateEvent(
                    id=str(uuid4()),
                    candidate_id=master.id,
                    event_type=event_type,
                    event_date=event_date,
                    details={
                        "employer": emp.employer_name,
                        "job_role": emp.job_role,
                        "salary_band": getattr(emp, "salary_band", "15k-25k"),
                        "description": description,
                        "verification_source": "MOCK_EPFO_CONNECTOR"
                    }
                )
                db.add(new_event)

    db.commit()