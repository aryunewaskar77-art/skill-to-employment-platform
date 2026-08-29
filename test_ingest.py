from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from main import app

client = TestClient(app)

def test_certifications():
    csv_content = b"candidate_id,nsqf_level,occupation_code,issue_date\n123,5,1234.01,2023-01-01"
    response = client.post("/ingest/certifications", files={"file": ("certifications.csv", csv_content, "text/csv")})
    print("Certifications Response:", response.json())

def test_candidates_with_certs():
    csv_content = b"candidate_id,nsqf_level,occupation_code,issue_date\n123,5,1234.01,2023-01-01"
    response = client.post("/ingest/candidates", files={"file": ("certifications.csv", csv_content, "text/csv")})
    print("Candidates Response:", response.json())

if __name__ == "__main__":
    test_certifications()
    test_candidates_with_certs()
