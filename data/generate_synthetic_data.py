import pandas as pd
import numpy as np
import json
import os

def generate_csv(filename, num_records=100):
    np.random.seed(42)
    skills = ["Python", "JavaScript", "React", "Data Science", "Machine Learning", "SQL", "AWS", "Docker"]
    
    data = {
        "user_id": range(1, num_records + 1),
        "primary_skill": np.random.choice(skills, num_records),
        "years_experience": np.random.randint(1, 15, num_records),
        "employability_score": np.random.uniform(50.0, 99.9, num_records).round(2)
    }
    
    df = pd.DataFrame(data)
    filepath = os.path.join(os.path.dirname(__file__), filename)
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath}")

def generate_json(filename, num_records=100):
    np.random.seed(42)
    roles = ["Software Engineer", "Data Analyst", "Frontend Developer", "DevOps Engineer"]
    
    data = []
    for i in range(1, num_records + 1):
        record = {
            "job_id": i,
            "title": np.random.choice(roles),
            "required_experience": int(np.random.randint(1, 10)),
            "is_active": bool(np.random.choice([True, False]))
        }
        data.append(record)
        
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Generated {filepath}")

if __name__ == "__main__":
    generate_csv("users.csv")
    generate_json("jobs.json")
