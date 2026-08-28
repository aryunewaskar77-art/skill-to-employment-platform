import os
import random
import json
import uuid
import pandas as pd
from faker import Faker
from datetime import datetime, timedelta

# Initialize Indian locale Faker
fake = Faker('en_IN')
Faker.seed(42)
random.seed(42)

# Maharashtra Districts
MH_DISTRICTS = [
    "Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg",
    "Pune", "Satara", "Sangli", "Solapur", "Kolhapur",
    "Nashik", "Dhule", "Jalgaon", "Ahmednagar", "Nandurbar",
    "Aurangabad", "Jalna", "Beed", "Osmanabad", "Nanded", "Latur", "Parbhani", "Hingoli",
    "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli",
    "Amravati", "Akola", "Washim", "Buldhana", "Yavatmal"
]

COURSES = [
    "Data Entry Operator", "Retail Sales Associate", "Python Developer", 
    "Electrician", "Plumber", "Customer Care Executive", "Field Technician",
    "General Duty Assistant", "Logistics Associate"
]

WAGE_BANDS = ["10k-15k", "15k-25k", "25k-40k", "40k-60k", "60k+"]
EMPLOYMENT_STATUSES = ["verified", "self_reported", "unverified"]

JOB_SKILL_VARIATIONS = [
    ["Python data wrangling", "data manipulation in Pandas", "proficient in Python data stack", "pandas and python scripting"],
    ["Retail inventory management", "handling store inventory", "stock keeping and retail", "inventory tracking"],
    ["Basic electrical repairs", "wiring and electrical troubleshooting", "electrician skills", "repairing electrical faults"],
    ["Customer handling and calls", "BPO calling", "fluent in English and customer service", "inbound customer support"],
    ["Plumbing maintenance", "pipe fitting and plumbing", "fixing leaks and pipes", "plumbing installations"],
    ["Data entry at high speed", "fast typing and excel", "entering data accurately", "proficient in MS Excel and data entry"]
]

def generate_phone():
    return f"{random.randint(6,9)}{random.randint(100000000, 999999999)}"

def apply_variation(candidate):
    """Introduce realistic variations for identity resolution testing."""
    c = candidate.copy()
    c['candidate_id'] = str(uuid.uuid4()) # It's a new record appearing in a different system
    
    var_type = random.choice(["name", "phone", "dob", "multiple"])
    
    # 1. Name Variation (e.g., initials, missing last name, nickname)
    if var_type in ["name", "multiple"]:
        parts = c['name'].split()
        if len(parts) > 1:
            if random.random() > 0.5:
                # First initial + Last name
                c['name'] = f"{parts[0][0]}. {parts[-1]}"
            else:
                # Just first name (like a nickname/casual entry)
                c['name'] = parts[0]
                
    # 2. Phone Variation (+91 prefix, missing digit, or typo)
    if var_type in ["phone", "multiple"]:
        ph = str(c['phone']).replace("+91", "").replace(" ", "")
        if random.random() > 0.5:
            c['phone'] = f"+91{ph}"
        else:
            # Minor typo in phone (change last digit)
            new_last = str((int(ph[-1]) + 1) % 10)
            c['phone'] = ph[:-1] + new_last
            
    # 3. DOB Variation (swap month/day, or year typo)
    if var_type in ["dob", "multiple"] and c['dob']:
        try:
            dt = datetime.strptime(c['dob'], "%Y-%m-%d")
            if dt.day <= 12 and random.random() > 0.5:
                # Swap month and day
                c['dob'] = f"{dt.year}-{dt.day:02d}-{dt.month:02d}"
            else:
                # Typo in year
                c['dob'] = f"{dt.year + random.choice([-1, 1])}-{dt.month:02d}-{dt.day:02d}"
        except:
            pass

    return c

def generate_datasets():
    # 1. Generate Candidates
    candidates = []
    base_candidates = []
    
    for _ in range(500):
        c = {
            "candidate_id": str(uuid.uuid4()),
            "name": fake.name(),
            "dob": fake.date_of_birth(minimum_age=18, maximum_age=45).strftime("%Y-%m-%d"),
            "phone": generate_phone(),
            "district": random.choice(MH_DISTRICTS),
            "course": random.choice(COURSES),
            "batch_id": f"BATCH_{random.randint(1000, 9999)}",
            "attendance_pct": round(random.uniform(50.0, 100.0), 2),
            "assessment_score": round(random.uniform(40.0, 95.0), 2)
        }
        base_candidates.append(c)
        candidates.append(c)
        
    # Inject ~40 duplicates
    duplicates_to_inject = random.sample(base_candidates, 40)
    for c in duplicates_to_inject:
        candidates.append(apply_variation(c))
        
    # Shuffle so duplicates aren't all at the end
    random.shuffle(candidates)
    
    df_candidates = pd.DataFrame(candidates)
    
    # 2. Generate Certifications
    certifications = []
    for c in candidates:
        # Not everyone gets certified
        if random.random() > 0.2:
            certifications.append({
                "candidate_id": c["candidate_id"],
                "nsqf_level": random.randint(1, 10),
                "occupation_code": f"{random.randint(1000, 9999)}.{random.randint(1, 99):02d}",
                "issue_date": fake.date_between(start_date="-3y", end_date="today").strftime("%Y-%m-%d")
            })
    df_certs = pd.DataFrame(certifications)
    
    # 3. Generate Employment Data
    employment = []
    employers = [fake.company() for _ in range(50)]
    
    for c in candidates:
        # About 60% got placed
        if random.random() > 0.4:
            employment.append({
                "candidate_id": c["candidate_id"],
                "employer": random.choice(employers),
                "job_role": c["course"], # often matches the course
                "joining_date": fake.date_between(start_date="-2y", end_date="today").strftime("%Y-%m-%d"),
                "status": random.choice(EMPLOYMENT_STATUSES),
                "wage_band": random.choice(WAGE_BANDS)
            })
            
    # 4. Generate Job Postings
    job_postings = []
    for _ in range(100):
        skill_group = random.choice(JOB_SKILL_VARIATIONS)
        job_postings.append({
            "employer": random.choice(employers),
            "district": random.choice(MH_DISTRICTS),
            "skill_requirements": random.choice(skill_group),
            "openings": random.randint(1, 20)
        })
        
    # Save to /data/synthetic/
    out_dir = os.path.join(os.path.dirname(__file__), "synthetic")
    
    df_candidates.to_csv(os.path.join(out_dir, "candidates.csv"), index=False)
    df_certs.to_csv(os.path.join(out_dir, "certifications.csv"), index=False)
    
    with open(os.path.join(out_dir, "employment.json"), 'w') as f:
        json.dump(employment, f, indent=2)
        
    with open(os.path.join(out_dir, "job_postings.json"), 'w') as f:
        json.dump(job_postings, f, indent=2)
        
    print(f"Generated {len(candidates)} candidates (including ~40 duplicates).")
    print(f"Generated {len(certifications)} certifications.")
    print(f"Generated {len(employment)} employment records.")
    print(f"Generated {len(job_postings)} job postings.")
    print(f"All files saved to {out_dir}")

if __name__ == "__main__":
    generate_datasets()
