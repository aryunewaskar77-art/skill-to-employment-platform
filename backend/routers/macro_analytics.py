import random
from typing import Optional, List
from fastapi import APIRouter, Query
from pydantic import BaseModel
from services.external_telemetry import get_synthetic_telemetry_metadata

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Macro Analytics"]
)

# Constants for synthetic generation
MAHARASHTRA_DISTRICTS = {
    "Konkan": [
        {"name": "Mumbai City", "lat": 18.9067, "lng": 72.8147, "urban": 1.0, "ind_profile": ["Finance", "IT", "Services"], "base_pop": 3100000},
        {"name": "Mumbai Suburban", "lat": 19.1828, "lng": 72.8441, "urban": 1.0, "ind_profile": ["IT", "Media", "Services"], "base_pop": 9300000},
        {"name": "Thane", "lat": 19.2183, "lng": 72.9781, "urban": 0.8, "ind_profile": ["IT", "Manufacturing", "Logistics"], "base_pop": 8000000},
        {"name": "Palghar", "lat": 19.6960, "lng": 72.7655, "urban": 0.4, "ind_profile": ["Textiles", "Agriculture"], "base_pop": 2900000},
        {"name": "Raigad", "lat": 18.5158, "lng": 73.1822, "urban": 0.5, "ind_profile": ["Chemicals", "Manufacturing", "Logistics"], "base_pop": 2600000},
        {"name": "Ratnagiri", "lat": 16.9902, "lng": 73.3120, "urban": 0.2, "ind_profile": ["Agriculture", "Fisheries"], "base_pop": 1600000},
        {"name": "Sindhudurg", "lat": 16.1554, "lng": 73.6934, "urban": 0.2, "ind_profile": ["Tourism", "Agriculture"], "base_pop": 850000}
    ],
    "Pune": [
        {"name": "Pune", "lat": 18.5204, "lng": 73.8567, "urban": 0.7, "ind_profile": ["IT", "Automotive", "Engineering"], "base_pop": 9400000},
        {"name": "Satara", "lat": 17.6805, "lng": 74.0183, "urban": 0.3, "ind_profile": ["Manufacturing", "Agriculture"], "base_pop": 3000000},
        {"name": "Sangli", "lat": 16.8524, "lng": 74.5815, "urban": 0.3, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 2800000},
        {"name": "Solapur", "lat": 17.6599, "lng": 75.9064, "urban": 0.3, "ind_profile": ["Textiles", "Agriculture"], "base_pop": 4300000},
        {"name": "Kolhapur", "lat": 16.7050, "lng": 74.2433, "urban": 0.4, "ind_profile": ["Foundry", "Textiles", "Agriculture"], "base_pop": 3800000}
    ],
    "Nashik": [
        {"name": "Nashik", "lat": 20.0110, "lng": 73.7903, "urban": 0.5, "ind_profile": ["Manufacturing", "Agriculture", "Winery"], "base_pop": 6100000},
        {"name": "Dhule", "lat": 20.9042, "lng": 74.7749, "urban": 0.3, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 2000000},
        {"name": "Nandurbar", "lat": 21.3718, "lng": 74.2423, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1600000},
        {"name": "Jalgaon", "lat": 21.0077, "lng": 75.5626, "urban": 0.4, "ind_profile": ["Agriculture", "Food Processing"], "base_pop": 4200000},
        {"name": "Ahmednagar", "lat": 19.0952, "lng": 74.7496, "urban": 0.3, "ind_profile": ["Agriculture", "Automotive components"], "base_pop": 4500000}
    ],
    "Chhatrapati Sambhaji Nagar (Marathwada)": [
        {"name": "Chhatrapati Sambhaji Nagar", "lat": 19.8762, "lng": 75.3433, "urban": 0.5, "ind_profile": ["Automotive", "Brewing", "Agriculture"], "base_pop": 3700000},
        {"name": "Jalna", "lat": 19.8297, "lng": 75.8800, "urban": 0.2, "ind_profile": ["Steel", "Agriculture"], "base_pop": 1900000},
        {"name": "Parbhani", "lat": 19.2668, "lng": 76.7762, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1800000},
        {"name": "Hingoli", "lat": 19.7212, "lng": 77.1436, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1100000},
        {"name": "Nanded", "lat": 19.1383, "lng": 77.3210, "urban": 0.3, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 3300000},
        {"name": "Latur", "lat": 18.4088, "lng": 76.5604, "urban": 0.3, "ind_profile": ["Agriculture", "Oil Mills"], "base_pop": 2400000},
        {"name": "Osmanabad (Dharashiv)", "lat": 18.1856, "lng": 76.0419, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1600000},
        {"name": "Beed", "lat": 18.9891, "lng": 75.7601, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 2500000}
    ],
    "Amravati": [
        {"name": "Amravati", "lat": 20.9320, "lng": 77.7523, "urban": 0.3, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 2800000},
        {"name": "Buldhana", "lat": 20.5317, "lng": 76.1809, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 2500000},
        {"name": "Akola", "lat": 20.7059, "lng": 77.0019, "urban": 0.4, "ind_profile": ["Agriculture", "Oil Mills"], "base_pop": 1800000},
        {"name": "Washim", "lat": 20.1065, "lng": 77.1264, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1200000},
        {"name": "Yavatmal", "lat": 20.3888, "lng": 78.1204, "urban": 0.2, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 2700000}
    ],
    "Nagpur": [
        {"name": "Nagpur", "lat": 21.1458, "lng": 79.0882, "urban": 0.6, "ind_profile": ["Logistics", "IT", "Manufacturing"], "base_pop": 4600000},
        {"name": "Wardha", "lat": 20.7453, "lng": 78.6022, "urban": 0.3, "ind_profile": ["Agriculture", "Textiles"], "base_pop": 1300000},
        {"name": "Bhandara", "lat": 21.1777, "lng": 79.6582, "urban": 0.2, "ind_profile": ["Agriculture", "Mining"], "base_pop": 1200000},
        {"name": "Gondia", "lat": 21.4624, "lng": 80.1960, "urban": 0.2, "ind_profile": ["Agriculture"], "base_pop": 1300000},
        {"name": "Chandrapur", "lat": 19.9615, "lng": 79.2961, "urban": 0.4, "ind_profile": ["Mining", "Power", "Cement"], "base_pop": 2200000},
        {"name": "Gadchiroli", "lat": 20.1849, "lng": 79.9948, "urban": 0.1, "ind_profile": ["Agriculture", "Forestry"], "base_pop": 1000000}
    ]
}

NCO_SECTORS = [
    {"sector": "IT/Software", "nco_code": "2512.0101"},
    {"sector": "Automotive", "nco_code": "8211.1401"},
    {"sector": "Healthcare", "nco_code": "5321.0101"},
    {"sector": "Logistics", "nco_code": "4323.0100"},
    {"sector": "Construction", "nco_code": "7111.0101"},
    {"sector": "Textiles", "nco_code": "8152.0101"},
]

class DeficitSector(BaseModel):
    sector: str
    nco_code: str
    supply: int
    demand: int
    gap: int

class MigrationTrend(BaseModel):
    net_migration_rate: float
    top_destination_districts: List[str]

class DistrictObservatoryProfile(BaseModel):
    district_name: str
    division: str
    hq_coordinates: dict # {lat, lng}
    demographics: dict
    skilling_capacity: dict
    industrial_profile: dict
    outcomes: dict
    top_deficit_sectors: List[DeficitSector]
    migration_trend: MigrationTrend
    gap_score: float

class MacroAnalyticsResponse(BaseModel):
    metadata: dict
    districts: List[DistrictObservatoryProfile]


def generate_synthetic_district_profile(div_name: str, dist: dict) -> DistrictObservatoryProfile:
    # Deterministic randomness based on district name for consistent API responses
    random.seed(dist["name"])
    
    # Demographics
    pop = dist["base_pop"] + random.randint(-100000, 100000)
    unemployment_rate = round(random.uniform(3.5, 8.5) - (dist["urban"] * 1.5), 1)
    female_lfpr = round(random.uniform(25.0, 45.0) + (dist["urban"] * 10), 1)
    
    # Skilling Capacity
    itis_count = max(5, int(dist["urban"] * 20 + pop / 500000))
    sanc_seats = itis_count * random.randint(200, 500)
    utilization = round(random.uniform(60.0, 95.0), 1)
    
    # Industrial
    msme_density = int(dist["urban"] * 500 + random.randint(50, 150))
    hiring_index = int(dist["urban"] * 40 + random.randint(20, 60))
    
    # Outcomes
    enrolled = int(sanc_seats * (utilization / 100))
    certified = int(enrolled * random.uniform(0.7, 0.9))
    placed = int(certified * random.uniform(0.4, 0.8) * (hiring_index / 100 + 0.5))
    retention_rate = round(random.uniform(40.0, 85.0), 1)
    retained_12m = int(placed * (retention_rate / 100))
    
    # Top Deficit Sectors
    sectors = random.sample(NCO_SECTORS, 3)
    deficits = []
    total_gap = 0
    for s in sectors:
        demand = random.randint(500, 5000) * (dist["urban"] + 0.5)
        supply = demand * random.uniform(0.1, 0.8)
        gap = int(demand - supply)
        total_gap += gap
        deficits.append(DeficitSector(
            sector=s["sector"],
            nco_code=s["nco_code"],
            supply=int(supply),
            demand=int(demand),
            gap=gap
        ))
        
    # Migration Trend
    # Urban areas have positive migration (inflow), rural have negative (outflow)
    migration_rate = round(random.uniform(0.5, 3.5) * (1 if dist["urban"] > 0.5 else -1), 2)
    destinations = []
    if migration_rate < 0:
        destinations = random.sample(["Pune", "Mumbai Suburban", "Thane", "Nashik", "Nagpur"], 2)

    return DistrictObservatoryProfile(
        district_name=dist["name"],
        division=div_name,
        hq_coordinates={"lat": dist["lat"], "lng": dist["lng"]},
        demographics={
            "total_population_approx": pop,
            "plfs_unemployment_rate_pct": unemployment_rate,
            "female_participation_pct": female_lfpr,
            "rural_urban_ratio": round((1 - dist["urban"]) / max(0.1, dist["urban"]), 2)
        },
        skilling_capacity={
            "total_itis_count": itis_count,
            "total_sanctioned_seats": sanc_seats,
            "seat_utilization_rate_pct": utilization
        },
        industrial_profile={
            "major_midc_zones": dist["ind_profile"],
            "msme_unit_density": msme_density,
            "active_employer_hiring_index": hiring_index
        },
        outcomes={
            "enrolled_count": enrolled,
            "certified_count": certified,
            "placed_count": placed,
            "retained_12m_count": retained_12m,
            "retention_rate_12m_pct": retention_rate
        },
        top_deficit_sectors=deficits,
        migration_trend=MigrationTrend(
            net_migration_rate=migration_rate,
            top_destination_districts=destinations
        ),
        gap_score=round(total_gap / max(1, pop) * 10000, 2)
    )

@router.get("/macro-district-observatory", response_model=MacroAnalyticsResponse)
def get_macro_district_observatory(
    division: Optional[str] = Query(None, description="Filter by administrative division"),
    sector: Optional[str] = Query(None, description="Filter by high demand sector"),
    sort_by: Optional[str] = Query("gap_score", description="Sort criteria")
):
    all_profiles = []
    
    for div_name, dist_list in MAHARASHTRA_DISTRICTS.items():
        if division and division.lower() not in div_name.lower():
            continue
            
        for dist in dist_list:
            profile = generate_synthetic_district_profile(div_name, dist)
            
            if sector:
                # Filter if the district has this sector in its top deficits
                has_sector = any(sector.lower() in d.sector.lower() for d in profile.top_deficit_sectors)
                if not has_sector:
                    continue
                    
            all_profiles.append(profile)
            
    # Sorting
    if sort_by == "gap_score":
        all_profiles.sort(key=lambda x: x.gap_score, reverse=True)
    elif sort_by == "retention":
        all_profiles.sort(key=lambda x: x.outcomes["retention_rate_12m_pct"], reverse=True)
    elif sort_by == "placement":
        all_profiles.sort(key=lambda x: x.outcomes["placed_count"], reverse=True)
    else:
        # Default alphabetical
        all_profiles.sort(key=lambda x: x.district_name)

    return MacroAnalyticsResponse(
        metadata=get_synthetic_telemetry_metadata(),
        districts=all_profiles
    )
