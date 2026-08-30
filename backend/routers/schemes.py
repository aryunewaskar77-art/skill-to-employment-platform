from fastapi import APIRouter
from pydantic import BaseModel
from services.external_telemetry import get_synthetic_telemetry_metadata

router = APIRouter(
    prefix="/api/v1/schemes",
    tags=["Schemes Performance"]
)

class SchemePerformanceMetric(BaseModel):
    scheme_id: str
    scheme_name: str
    budget_sanctioned_cr: float
    budget_utilized_cr: float
    total_enrolled: int
    total_certified: int
    total_placed: int
    enroll_to_cert_pct: float
    cert_to_place_pct: float
    retention_30d_pct: float
    retention_90d_pct: float
    retention_180d_pct: float
    retention_365d_pct: float
    avg_starting_salary_inr: float
    avg_12m_salary_inr: float
    wage_growth_pct: float
    cost_per_certified_inr: float
    cost_per_retained_candidate_inr: float
    policy_health_status: str

class SchemePerformanceResponse(BaseModel):
    metadata: dict
    data: list[SchemePerformanceMetric]

@router.get("/performance", response_model=SchemePerformanceResponse)
def get_scheme_performance():
    # Synthetic data generation mimicking real-world policy outcomes
    
    schemes_data = [
        {
            "scheme_id": "SCH_PMKUVA",
            "scheme_name": "MSSDS - Pramod Mahajan Kaushalya Vikas Yojna (PMKUVA)",
            "budget_sanctioned_cr": 250.0,
            "budget_utilized_cr": 210.5,
            "total_enrolled": 125000,
            "total_certified": 98000,
            "total_placed": 55000,
            "enroll_to_cert_pct": 78.4,
            "cert_to_place_pct": 56.1,
            "retention_30d_pct": 85.0,
            "retention_90d_pct": 72.5,
            "retention_180d_pct": 65.0,
            "retention_365d_pct": 52.0,
            "avg_starting_salary_inr": 14500.0,
            "avg_12m_salary_inr": 16200.0,
            "wage_growth_pct": 11.7,
            "cost_per_certified_inr": 21479.5, # (210.5Cr / 98000)
            "cost_per_retained_candidate_inr": 73601.3,
            "policy_health_status": "MODERATE"
        },
        {
            "scheme_id": "SCH_CTS",
            "scheme_name": "DVET - Craftsmen Training Scheme (CTS / ITIs)",
            "budget_sanctioned_cr": 450.0,
            "budget_utilized_cr": 440.0,
            "total_enrolled": 210000,
            "total_certified": 185000,
            "total_placed": 110000,
            "enroll_to_cert_pct": 88.0,
            "cert_to_place_pct": 59.4,
            "retention_30d_pct": 92.0,
            "retention_90d_pct": 85.0,
            "retention_180d_pct": 78.0,
            "retention_365d_pct": 71.0,
            "avg_starting_salary_inr": 16500.0,
            "avg_12m_salary_inr": 19800.0,
            "wage_growth_pct": 20.0,
            "cost_per_certified_inr": 23783.7,
            "cost_per_retained_candidate_inr": 56338.0,
            "policy_health_status": "HIGH_ROI"
        },
        {
            "scheme_id": "SCH_PMKVY4",
            "scheme_name": "Central - PMKVY 4.0 & NAPS",
            "budget_sanctioned_cr": 320.0,
            "budget_utilized_cr": 180.0,
            "total_enrolled": 95000,
            "total_certified": 68000,
            "total_placed": 22000,
            "enroll_to_cert_pct": 71.5,
            "cert_to_place_pct": 32.3,
            "retention_30d_pct": 75.0,
            "retention_90d_pct": 60.0,
            "retention_180d_pct": 45.0,
            "retention_365d_pct": 31.0,
            "avg_starting_salary_inr": 12500.0,
            "avg_12m_salary_inr": 13000.0,
            "wage_growth_pct": 4.0,
            "cost_per_certified_inr": 26470.5,
            "cost_per_retained_candidate_inr": 263929.6,
            "policy_health_status": "NEEDS_CURRICULUM_AUDIT"
        },
        {
            "scheme_id": "SCH_CMYWTS",
            "scheme_name": "CMYWTS - Mukhyamantri Yuva Karya Prashikshan Yojna",
            "budget_sanctioned_cr": 150.0,
            "budget_utilized_cr": 145.0,
            "total_enrolled": 55000,
            "total_certified": 52000,
            "total_placed": 42000,
            "enroll_to_cert_pct": 94.5,
            "cert_to_place_pct": 80.7,
            "retention_30d_pct": 95.0,
            "retention_90d_pct": 88.0,
            "retention_180d_pct": 85.0,
            "retention_365d_pct": 81.0,
            "avg_starting_salary_inr": 18500.0,
            "avg_12m_salary_inr": 22500.0,
            "wage_growth_pct": 21.6,
            "cost_per_certified_inr": 27884.6,
            "cost_per_retained_candidate_inr": 42621.9,
            "policy_health_status": "HIGH_ROI"
        }
    ]

    return {
        "metadata": get_synthetic_telemetry_metadata(),
        "data": schemes_data
    }
