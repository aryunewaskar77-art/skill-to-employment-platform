from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime, date
import re

def parse_date(v):
    if not v:
        return None
    if isinstance(v, date):
        return v
    # Try multiple formats
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(str(v).strip(), fmt).date()
        except ValueError:
            pass
    raise ValueError("Invalid date format")

class CandidateIngest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    candidate_id: str
    name: str
    dob: Optional[date] = None
    phone: str
    district: Optional[str] = None
    course: Optional[str] = None
    batch_id: Optional[str] = None
    attendance_pct: Optional[float] = None
    assessment_score: Optional[float] = None

    @field_validator('name')
    @classmethod
    def clean_name(cls, v: str) -> str:
        return v.strip().title() if v else v

    @field_validator('phone')
    @classmethod
    def clean_phone(cls, v: str) -> str:
        if not v:
            raise ValueError("Phone cannot be empty")
        # Remove non-numeric characters
        num = re.sub(r'\D', '', str(v))
        
        # Add E.164 +91 if needed
        if len(num) == 10:
            return f"+91{num}"
        elif len(num) == 12 and num.startswith("91"):
            return f"+{num}"
        elif len(num) > 10:
            return f"+{num}" # best effort
        raise ValueError("Invalid phone number length")

    @field_validator('dob', mode='before')
    @classmethod
    def clean_dob(cls, v):
        return parse_date(v)

class CertificationIngest(BaseModel):
    candidate_id: str
    nsqf_level: Optional[int] = None
    occupation_code: Optional[str] = None
    issue_date: Optional[date] = None

    @field_validator('issue_date', mode='before')
    @classmethod
    def clean_issue_date(cls, v):
        return parse_date(v)

class EmploymentIngest(BaseModel):
    candidate_id: str
    employer: Optional[str] = None
    job_role: Optional[str] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None
    wage_band: Optional[str] = None

    @field_validator('employer', 'job_role', 'status')
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v
        
    @field_validator('joining_date', mode='before')
    @classmethod
    def clean_joining_date(cls, v):
        return parse_date(v)

class JobPostingIngest(BaseModel):
    employer: str
    district: str
    skill_requirements: str
    openings: Optional[int] = 1

    @field_validator('employer', 'district', 'skill_requirements')
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v
