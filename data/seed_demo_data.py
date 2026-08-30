import sys
import os

# Ensure the backend directory is in the Python path so `models`, `database`,
# and `identity` can be imported regardless of which directory this is run from.
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import datetime
import uuid
from sqlalchemy import func
from database import SessionLocal
import models


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_dob(s):
    return datetime.datetime.strptime(s, "%Y-%m-%d").date()


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def clean_database(db):
    print("Cleaning database...")
    db.query(models.SourceRecord).delete()
    db.query(models.CandidateEvent).delete()
    db.query(models.IdentityDecision).delete()
    db.query(models.ReviewQueue).delete()
    db.query(models.StagingCandidate).delete()
    db.query(models.StagingCertification).delete()
    db.query(models.StagingEmployment).delete()
    db.query(models.StagingJobPosting).delete()
    db.query(models.MasterCandidate).delete()
    db.commit()
    print("  Database cleaned.")


def seed_golden_candidates(db):
    print("Seeding 25 Tier-1/2 Golden Candidates...")
    districts = ["Pune", "Mumbai Suburban", "Nagpur", "Nashik"]
    roles     = ["Python Developer", "Electrician", "General Duty Assistant", "CNC Machinist"]
    st_candidates, st_certs, st_emps = [], [], []

    for i in range(1, 26):
        cid  = f"CAND-G-{1000 + i}"
        dist = districts[i % len(districts)]
        role = roles[i % len(roles)]
        st_candidates.append(models.StagingCandidate(
            candidate_id=cid,
            name=f"Golden Candidate {i}",
            dob=datetime.date(2000, 1, (i % 28) + 1),
            phone=f"9876500{i:03d}",
            district=dist, course=role,
            attendance_pct=85.0 + (i % 15),
            resolved=False
        ))
        st_certs.append(models.StagingCertification(
            candidate_id=cid,
            nsqf_level=4 + (i % 2),
            occupation_code=f"OCC-{role[:3].upper()}",
            issue_date=datetime.date(2023, 6, 1)
        ))
        st_emps.append(models.StagingEmployment(
            candidate_id=cid,
            employer=f"Top Tech {dist}",
            job_role=role,
            joining_date=datetime.date(2023, 8, 15),
            status="Employed",
            wage_band="3-5 LPA"
        ))

    db.add_all(st_candidates); db.add_all(st_certs); db.add_all(st_emps)
    db.commit()
    print(f"  {len(st_candidates)} golden candidates seeded.")


def seed_ambiguous_candidates(db):
    print("Seeding 14 Tier-3 Ambiguous Match Records...")
    st_candidates = []
    pairs = [
        ("Aarav Sharma", "Arav Sharma",  "9876543210", "2001-05-10", "2001-05-10", "Pune",            "Pune"),
        ("Priya Patel",  "Priya P.",     "9876543211", "1999-12-01", "1999-12-01", "Mumbai Suburban", "Mumbai Suburban"),
        ("Rahul Verma",  "Rahul Verma",  "9876543212", "1998-04-15", "1998-05-15", "Nagpur",          "Nagpur"),
        ("Sneha K",      "Sneha K",      "9876543213", "2002-08-20", "2002-08-20", "Pune",            "Mumbai Suburban"),
        ("Vikram Singh", "Bikram Singh", "9876543214", "2000-02-28", "2000-02-28", "Nashik",          "Nashik"),
        ("Neha Gupta",   "Neha Guptaa",  "9876543215", "1997-07-07", "1997-07-07", "Pune",            "Pune"),
        ("Rohan Das",    "Rohan Das",    "9876543216", "1996-11-11", "1996-11-11", "Nagpur",          "Nagpur"),
    ]
    for i, (n1, n2, ph, d1, d2, dist1, dist2) in enumerate(pairs):
        st_candidates.append(models.StagingCandidate(candidate_id=f"CAND-AMB1-{i}", name=n1, dob=parse_dob(d1), phone=ph, district=dist1, course="Data Entry", attendance_pct=90.0, resolved=False))
        st_candidates.append(models.StagingCandidate(candidate_id=f"CAND-AMB2-{i}", name=n2, dob=parse_dob(d2), phone=ph, district=dist2, course="Data Entry", attendance_pct=88.0, resolved=False))
    db.add_all(st_candidates); db.commit()
    print(f"  {len(st_candidates)} ambiguous staging records seeded.")


def seed_job_postings(db):
    print("Seeding Job Postings (All 36 Maharashtra Districts)...")
    P = models.StagingJobPosting
    postings = [
        P(employer="Tata Motors",            district="Pune",            skill_requirements="CNC Machinist, Fitter",                      openings=500),
        P(employer="Infosys",                district="Pune",            skill_requirements="Python Developer, Software Testing",          openings=800),
        P(employer="Bajaj Auto",             district="Pune",            skill_requirements="Auto Mechanic, Welder",                       openings=350),
        P(employer="HDFC Bank",              district="Mumbai Suburban", skill_requirements="Retail Banking, Data Entry",                  openings=300),
        P(employer="Reliance Retail",        district="Mumbai Suburban", skill_requirements="General Duty Assistant, Customer Service",    openings=200),
        P(employer="Accenture",              district="Mumbai Suburban", skill_requirements="Python Developer, BPO Operations",            openings=650),
        P(employer="JSW Steel",              district="Mumbai City",     skill_requirements="Electrician, Fitter, Welder",                 openings=400),
        P(employer="Axis Bank",              district="Mumbai City",     skill_requirements="Retail Sales, Data Entry",                    openings=250),
        P(employer="L&T Construction",       district="Thane",           skill_requirements="Civil Construction, Electrician",             openings=550),
        P(employer="Godrej Industries",      district="Thane",           skill_requirements="Fitter, CNC Machinist",                       openings=300),
        P(employer="Hiranandani Developers", district="Thane",           skill_requirements="Plumber, Welder",                            openings=200),
        P(employer="JNPT Logistics",         district="Raigad",          skill_requirements="Electrician, General Duty Assistant",         openings=220),
        P(employer="Aarav Shipping",         district="Raigad",          skill_requirements="Logistics Coordinator, Fitter",              openings=180),
        P(employer="Patkar Plantations",     district="Ratnagiri",       skill_requirements="General Duty Assistant, Electrician",         openings=80),
        P(employer="Alphonso Agro",          district="Ratnagiri",       skill_requirements="Agri Tech, Data Entry",                       openings=60),
        P(employer="Coastal Tourism MH",     district="Sindhudurg",      skill_requirements="Hospitality, Customer Service",               openings=70),
        P(employer="Fisheries Dept",         district="Sindhudurg",      skill_requirements="General Duty Assistant, Electrician",         openings=50),
        P(employer="Palghar MSME Cluster",   district="Palghar",         skill_requirements="Welder, CNC Machinist",                       openings=140),
        P(employer="Vedanta Ltd",            district="Palghar",         skill_requirements="Electrician, Fitter",                         openings=200),
        P(employer="Mahindra Logistics",     district="Nashik",          skill_requirements="Electrician, Auto Mechanic",                  openings=600),
        P(employer="Crompton Greaves",       district="Nashik",          skill_requirements="Electrician, Fitter",                         openings=350),
        P(employer="Jalgaon Textiles",       district="Jalgaon",         skill_requirements="Textile Technician, Welder",                  openings=180),
        P(employer="Khandesh Agro",          district="Jalgaon",         skill_requirements="Data Entry, General Duty Assistant",           openings=90),
        P(employer="Dhule MIDC",             district="Dhule",           skill_requirements="Fitter, CNC Machinist",                       openings=150),
        P(employer="Tribal Craft Dhule",     district="Dhule",           skill_requirements="General Duty Assistant, Electrician",         openings=60),
        P(employer="Nandurbar Krushi",       district="Nandurbar",       skill_requirements="Agri Tech, General Duty Assistant",            openings=80),
        P(employer="Ahmednagar Steel",       district="Ahmednagar",      skill_requirements="Welder, Fitter, CNC Machinist",               openings=280),
        P(employer="Parner Dairy",           district="Ahmednagar",      skill_requirements="Data Entry, General Duty Assistant",           openings=70),
        P(employer="Satara Sugars",          district="Satara",          skill_requirements="Electrician, General Duty Assistant",         openings=110),
        P(employer="Karad Steel",            district="Satara",          skill_requirements="Welder, Fitter",                              openings=90),
        P(employer="Sangli Pharma",          district="Sangli",          skill_requirements="Data Entry, Lab Technician",                  openings=130),
        P(employer="Solapur Textiles",       district="Solapur",         skill_requirements="Textile Technician, Welder",                  openings=220),
        P(employer="Sholapur MIDC",          district="Solapur",         skill_requirements="Fitter, Electrician",                         openings=180),
        P(employer="Kolhapur Auto Cluster",  district="Kolhapur",        skill_requirements="Auto Mechanic, CNC Machinist, Fitter",        openings=400),
        P(employer="Shahu Sugar Kolhapur",   district="Kolhapur",        skill_requirements="Electrician, General Duty Assistant",         openings=120),
        P(employer="Aurangabad DMIC",        district="Aurangabad",      skill_requirements="CNC Machinist, Auto Mechanic, Electrician",   openings=750),
        P(employer="Skoda Auto VW India",    district="Aurangabad",      skill_requirements="Auto Mechanic, Welder",                       openings=500),
        P(employer="Jalna Steel",            district="Jalna",           skill_requirements="Welder, Fitter, CNC Machinist",               openings=220),
        P(employer="Nanded Sugar",           district="Nanded",          skill_requirements="Electrician, General Duty Assistant",         openings=130),
        P(employer="Marathwada Textiles",    district="Parbhani",        skill_requirements="Textile Technician, Welder",                  openings=100),
        P(employer="Hingoli Agro",           district="Hingoli",         skill_requirements="General Duty Assistant, Data Entry",           openings=60),
        P(employer="Latur Pharma",           district="Latur",           skill_requirements="Lab Technician, Data Entry",                  openings=150),
        P(employer="Osmanabad Leather",      district="Osmanabad",       skill_requirements="General Duty Assistant, Electrician",         openings=90),
        P(employer="Beed Agriculture",       district="Beed",            skill_requirements="Agri Tech, General Duty Assistant",            openings=80),
        P(employer="Future Supply Chain",    district="Nagpur",          skill_requirements="Electrician, CNC Machinist, Logistics",       openings=400),
        P(employer="Nagpur Metro Rail",      district="Nagpur",          skill_requirements="Electrician, Fitter, Civil Construction",     openings=350),
        P(employer="Wardha Cement",          district="Wardha",          skill_requirements="Welder, Electrician, General Duty Assistant", openings=140),
        P(employer="Bhandara Rice Mill",     district="Bhandara",        skill_requirements="General Duty Assistant, Fitter",              openings=70),
        P(employer="Gondia Paper Mill",      district="Gondia",          skill_requirements="Electrician, General Duty Assistant",         openings=90),
        P(employer="Chandrapur BALCO",       district="Chandrapur",      skill_requirements="Electrician, Fitter, CNC Machinist",          openings=300),
        P(employer="Gadchiroli Forest",      district="Gadchiroli",      skill_requirements="General Duty Assistant, Data Entry",           openings=50),
        P(employer="Amravati Cotton Gin",    district="Amravati",        skill_requirements="Electrician, General Duty Assistant, Welder", openings=160),
        P(employer="Akola Oilseed Proc.",    district="Akola",           skill_requirements="Electrician, Fitter",                         openings=120),
        P(employer="Washim Agro Services",   district="Washim",          skill_requirements="General Duty Assistant, Data Entry",           openings=60),
        P(employer="Buldhana Solar Farm",    district="Buldhana",        skill_requirements="Electrician, Solar Technician",               openings=110),
        P(employer="Yavatmal Cotton Mkt",    district="Yavatmal",        skill_requirements="General Duty Assistant, Data Entry",           openings=80),
    ]
    db.add_all(postings); db.commit()
    print(f"  {len(postings)} job postings seeded across all 36 districts.")


def run_identity_resolution(db):
    """Lightweight in-script resolution: links golden candidates to master records."""
    print("Running identity resolution pass...")
    unresolved = db.query(models.StagingCandidate).filter(models.StagingCandidate.resolved == False).all()
    created = 0
    for sc in unresolved:
        # Try to find matching master by phone + name
        existing = db.query(models.MasterCandidate).filter(
            models.MasterCandidate.phone == sc.phone
        ).first()
        if existing:
            sc.resolved = True
            sc.master_id = existing.id
        else:
            m = models.MasterCandidate(
                id=str(uuid.uuid4()),
                name=sc.name, dob=sc.dob,
                phone=sc.phone, district=sc.district, course=sc.course
            )
            db.add(m)
            sc.resolved = True
            sc.master_id = m.id
            created += 1
    db.commit()
    print(f"  Resolution done: {created} new master records created.")


def run_event_backfill(db):
    """Generate the full 8-stage lifecycle for every resolved candidate."""
    print("Running event backfill...")
    TODAY    = datetime.date(2026, 8, 30)
    JOINING  = datetime.date(2024, 6, 1)   # ~820 days ago — all retention milestones qualify

    resolved = db.query(models.StagingCandidate).filter(models.StagingCandidate.resolved == True).all()
    master_map = {}
    for sc in resolved:
        if sc.master_id and sc.master_id not in master_map:
            master_map[sc.master_id] = sc

    certs_by_cid  = {}
    for cert in db.query(models.StagingCertification).all():
        certs_by_cid.setdefault(cert.candidate_id, []).append(cert)

    emps_by_cid   = {}
    for emp in db.query(models.StagingEmployment).all():
        emps_by_cid.setdefault(emp.candidate_id, []).append(emp)

    events = []
    for master_id, sc in master_map.items():
        # enrolled
        events.append(models.CandidateEvent(candidate_id=master_id, event_type="enrolled", event_date=sc.dob, source_system="staging_candidates", status="confirmed", raw_payload={"course": sc.course}))
        # trained
        events.append(models.CandidateEvent(candidate_id=master_id, event_type="trained", event_date=None, source_system="staging_candidates", status="completed", raw_payload={"attendance_pct": sc.attendance_pct}))
        # certified
        for cert in certs_by_cid.get(sc.candidate_id, []):
            events.append(models.CandidateEvent(candidate_id=master_id, event_type="certified", event_date=cert.issue_date, source_system="staging_certifications", status="certified", raw_payload={"nsqf_level": cert.nsqf_level, "occupation_code": cert.occupation_code}))
        # employment + retention
        for emp in emps_by_cid.get(sc.candidate_id, []):
            joining = emp.joining_date or JOINING
            days    = (TODAY - joining).days
            payload = {"employer": emp.employer, "job_role": emp.job_role, "wage_band": emp.wage_band}
            events.append(models.CandidateEvent(candidate_id=master_id, event_type="placed",            event_date=joining,                      source_system="staging_employment", status=emp.status, raw_payload=payload))
            events.append(models.CandidateEvent(candidate_id=master_id, event_type="verified_employed", event_date=joining + datetime.timedelta(days=7),   source_system="epfo_mock", status="verified",  raw_payload=payload))
            if days > 90:
                events.append(models.CandidateEvent(candidate_id=master_id, event_type="retained_3m",  event_date=joining + datetime.timedelta(days=90),  source_system="epfo_mock", status="retained",  raw_payload=payload))
            if days > 180:
                events.append(models.CandidateEvent(candidate_id=master_id, event_type="retained_6m",  event_date=joining + datetime.timedelta(days=180), source_system="epfo_mock", status="retained",  raw_payload=payload))
            if days > 365:
                events.append(models.CandidateEvent(candidate_id=master_id, event_type="retained_12m", event_date=joining + datetime.timedelta(days=365), source_system="epfo_mock", status="retained",  raw_payload=payload))

    db.add_all(events); db.commit()
    print(f"  {len(events)} candidate events generated.")


def print_summary(db):
    event_counts = db.query(models.CandidateEvent.event_type, func.count()).group_by(models.CandidateEvent.event_type).all()
    print("\n" + "=" * 60)
    print("DEMO SEEDING COMPLETE - PIPELINE SUMMARY")
    print("=" * 60)
    print(f"  Master Candidates   : {db.query(models.MasterCandidate).count()}")
    print(f"  Candidate Events    : {db.query(models.CandidateEvent).count()}")
    print(f"  Review Queue Items  : {db.query(models.ReviewQueue).count()}")
    print(f"  Job Postings        : {db.query(models.StagingJobPosting).count()}")
    print("\n  Event Type Breakdown:")
    for event_type, count in sorted(event_counts):
        print(f"    [OK] {event_type:<22}: {count}")
    print("=" * 60)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        clean_database(db)
        seed_golden_candidates(db)
        seed_ambiguous_candidates(db)
        seed_job_postings(db)
        run_identity_resolution(db)
        run_event_backfill(db)
        print_summary(db)
    except Exception:
        import traceback
        print("\nError during seeding:")
        traceback.print_exc()
    finally:
        db.close()
