from sqlalchemy.orm import Session
from models import MasterCandidate, StagingCandidate, ReviewQueue, IdentityDecision, CandidateEvent, SourceRecord, StagingCertification, StagingEmployment
import uuid
from rapidfuzz import fuzz
import jellyfish

def resolve_identities(db: Session):
    unresolved = db.query(StagingCandidate).filter(StagingCandidate.resolved == False).all()
    results = {"auto-link": 0, "auto-new": 0, "review-queue": 0}
    
    # Load all master candidates into memory (fine for prototype)
    masters = db.query(MasterCandidate).all()
    
    for staging in unresolved:
        decision = process_candidate(staging, masters, db)
        results[decision['type']] += 1
        
        if decision['type'] == 'auto-new':
            masters.append(decision['master'])
            
    db.commit()
    return results

def process_candidate(staging: StagingCandidate, masters: list, db: Session):
    # Tier 1: Deterministic match on phone
    if staging.phone:
        for m in masters:
            if m.phone == staging.phone:
                return execute_decision(staging, m, "auto-link", 1.0, {"tier": 1, "matched_field": "phone"}, db)

    # Tier 2: Fuzzy match on name + DOB + district
    for m in masters:
        if m.dob and staging.dob and m.district and staging.district:
            if m.dob == staging.dob and m.district == staging.district:
                name_score = fuzz.ratio(str(staging.name).lower(), str(m.name).lower()) / 100.0
                if name_score >= 0.9:
                    evidence = {"tier": 2, "name_score": name_score, "matched_fields": ["dob", "district"]}
                    return execute_decision(staging, m, "auto-link", name_score, evidence, db)

    # Tier 3: Probabilistic match
    best_match = None
    best_score = 0.0
    best_evidence = {}

    s_phonetic = jellyfish.metaphone(str(staging.name).lower()) if staging.name else ""

    for m in masters:
        score = 0.0
        evidence = {"tier": 3}
        
        # Name similarity (weight: 0.4)
        name_sim = fuzz.ratio(str(staging.name).lower(), str(m.name).lower()) / 100.0 if staging.name and m.name else 0.0
        score += name_sim * 0.4
        evidence['name_sim'] = name_sim

        # Phonetic match (weight: 0.2)
        m_phonetic = jellyfish.metaphone(str(m.name).lower()) if m.name else ""
        if s_phonetic and m_phonetic and s_phonetic == m_phonetic:
            score += 0.2
            evidence['phonetic_match'] = True

        # DOB proximity (weight: 0.2)
        if staging.dob and m.dob:
            delta = abs((staging.dob - m.dob).days)
            if delta == 0:
                score += 0.2
                evidence['dob_match'] = "exact"
            elif delta <= 31:
                score += 0.1
                evidence['dob_match'] = "close"

        # District/Course overlap (weight: 0.2)
        if staging.district and m.district and staging.district == m.district:
            score += 0.1
            evidence['district_match'] = True
        if staging.course and m.course and staging.course == m.course:
            score += 0.1
            evidence['course_match'] = True

        if score > best_score:
            best_score = score
            best_match = m
            best_evidence = evidence

    if best_match and best_score >= 0.9:
        return execute_decision(staging, best_match, "auto-link", best_score, best_evidence, db)
    elif best_match and best_score >= 0.6:
        return execute_decision(staging, best_match, "review-queue", best_score, best_evidence, db)
    else:
        # Create new master candidate
        new_master = MasterCandidate(
            id=str(uuid.uuid4()),
            name=staging.name,
            dob=staging.dob,
            phone=staging.phone,
            district=staging.district,
            course=staging.course
        )
        db.add(new_master)
        return execute_decision(staging, new_master, "auto-new", best_score, best_evidence, db)

def execute_decision(staging, master, decision_type, score, evidence, db):
    if decision_type in ("auto-link", "auto-new"):
        staging.resolved = True
        staging.master_id = master.id
        
        decision = IdentityDecision(
            staging_id=staging.id,
            master_id=master.id,
            decision_type=decision_type,
            confidence_score=score,
            match_evidence=evidence
        )
        db.add(decision)
    elif decision_type == "review-queue":
        queue_item = ReviewQueue(
            staging_id=staging.id,
            proposed_master_id=master.id,
            confidence_score=score,
            match_evidence=evidence
        )
        db.add(queue_item)
        
    return {
        "staging_id": staging.id,
        "type": decision_type,
        "master": master,
        "score": score
    }

from collections import defaultdict

def backfill_candidate_events(db: Session):
    # Fetch all resolved staging candidates
    staging_candidates = db.query(StagingCandidate).filter(StagingCandidate.resolved == True).all()
    
    events = []
    sources = []
    
    # Group staging candidates by master_id
    master_map = defaultdict(list)
    for sc in staging_candidates:
        if sc.master_id:
            master_map[sc.master_id].append(sc)
            
    for master_id, sc_list in master_map.items():
        # Metric for completeness: number of non-null fields
        def completeness_score(sc):
            score = 0
            if sc.course: score += 1
            if sc.batch_id: score += 1
            if sc.attendance_pct is not None: score += 1
            if sc.assessment_score is not None: score += 1
            return score
            
        best_sc = max(sc_list, key=completeness_score)
        
        # 1. Source Records for all Staging Candidates belonging to this master
        for sc in sc_list:
            sources.append(SourceRecord(
                candidate_id=master_id,
                source_table="staging_candidates",
                source_id=str(sc.id),
                raw_payload={"name": sc.name, "phone": sc.phone, "dob": str(sc.dob), "course": sc.course}
            ))
            
        # 2. Single Enrolled Event per MasterCandidate
        events.append(CandidateEvent(
            candidate_id=master_id,
            event_type="enrolled",
            event_date=None,
            source_system="staging_candidates",
            status="confirmed",
            raw_payload={"course": best_sc.course, "batch_id": best_sc.batch_id}
        ))
        
        # 3. Single Trained Event per MasterCandidate
        events.append(CandidateEvent(
            candidate_id=master_id,
            event_type="trained",
            event_date=None,
            source_system="staging_candidates",
            status="completed" if best_sc.attendance_pct and best_sc.attendance_pct >= 70 else "incomplete",
            raw_payload={"attendance_pct": best_sc.attendance_pct, "assessment_score": best_sc.assessment_score}
        ))
        
        # 4. Certifications & Employment for all candidate_ids mapped to this master
        candidate_ids = [sc.candidate_id for sc in sc_list]
        
        # Fetch certifications
        certs = db.query(StagingCertification).filter(StagingCertification.candidate_id.in_(candidate_ids)).all()
        for cert in certs:
            sources.append(SourceRecord(
                candidate_id=master_id,
                source_table="staging_certifications",
                source_id=str(cert.id),
                raw_payload={"nsqf_level": cert.nsqf_level, "occupation_code": cert.occupation_code}
            ))
            events.append(CandidateEvent(
                candidate_id=master_id,
                event_type="certified",
                event_date=cert.issue_date,
                source_system="staging_certifications",
                status="certified",
                raw_payload={"nsqf_level": cert.nsqf_level, "occupation_code": cert.occupation_code}
            ))
            
        # Fetch employment
        employments = db.query(StagingEmployment).filter(StagingEmployment.candidate_id.in_(candidate_ids)).all()
        for emp in employments:
            sources.append(SourceRecord(
                candidate_id=master_id,
                source_table="staging_employment",
                source_id=str(emp.id),
                raw_payload={"employer": emp.employer, "job_role": emp.job_role, "status": emp.status}
            ))
            
            event_type = "verified_employed" if emp.status == "verified" else "placed"
            events.append(CandidateEvent(
                candidate_id=master_id,
                event_type=event_type,
                event_date=emp.joining_date,
                source_system="staging_employment",
                status=emp.status,
                raw_payload={"employer": emp.employer, "job_role": emp.job_role, "wage_band": emp.wage_band}
            ))
            
    db.add_all(events)
    db.add_all(sources)
    db.commit()
    
    return {"events_created": len(events), "sources_created": len(sources)}
