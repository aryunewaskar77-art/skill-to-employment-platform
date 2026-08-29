import requests
import json
import pandas as pd
import time
import os

BASE_URL = "http://localhost:8000"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "synthetic")

def run():
    print("Regenerating synthetic data...")
    os.system("python3 data/generate_indian_data.py")
    
    print("Clearing the database...")
    from database import engine
    import models
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    print("Make sure your FastAPI server is running on localhost:8000!")
    try:
        requests.get(f"{BASE_URL}/health")
    except requests.exceptions.ConnectionError:
        print("FastAPI server is not running! Start it with 'uvicorn main:app --reload' in the backend dir, then re-run this script.")
        return
        
    print("\n--- WARNING ---")
    print("You should drop and recreate the DB schema before running this if you want a clean slate!")
    print("Hitting endpoints...")
    
    # Ingest candidates
    print("Ingesting candidates...")
    candidates = pd.read_csv(os.path.join(DATA_DIR, "candidates.csv")).to_dict(orient="records")
    res = requests.post(f"{BASE_URL}/ingest/candidates", json=candidates)
    print(res.json())
    
    # Ingest certifications
    print("Ingesting certifications...")
    certs = pd.read_csv(os.path.join(DATA_DIR, "certifications.csv")).to_dict(orient="records")
    res = requests.post(f"{BASE_URL}/ingest/certifications", json=certs)
    print(res.json())
    
    # Ingest employment
    print("Ingesting employment...")
    with open(os.path.join(DATA_DIR, "employment.json")) as f:
        emp = json.load(f)
    res = requests.post(f"{BASE_URL}/ingest/employment", json=emp)
    print(res.json())
    
    # Run resolution
    print("Running identity resolution...")
    res = requests.post(f"{BASE_URL}/resolution/run")
    print(res.json())
    
    # Backfill events
    print("Backfilling events...")
    res = requests.post(f"{BASE_URL}/resolution/backfill-events")
    print(res.json())
    
    print("\nNow retraining the model...")
    os.system("python3 backend/train_model.py")
    
if __name__ == "__main__":
    run()
