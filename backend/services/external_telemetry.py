from datetime import datetime, timezone

def get_synthetic_telemetry_metadata() -> dict:
    return {
        "data_provenance": "Maharashtra State Skilling Data Observatory + Synthetic Simulation (SIH26-26135)",
        "last_refreshed_at": datetime.now(timezone.utc).isoformat()
    }

def get_plfs_benchmarks() -> dict:
    """Returns static macro benchmark data inspired by actual PLFS surveys."""
    return {
        "maharashtra_unemployment_rate_pct": 5.2,
        "maharashtra_female_lfpr_pct": 32.5,
        "urban_rural_divide_ratio": 1.4
    }
