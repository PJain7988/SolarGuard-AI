from fastapi import APIRouter
from typing import Dict
import random

router = APIRouter()

@router.get("/stats")
async def get_dataset_stats() -> Dict:
    # Generate dynamic numbers to simulate database growth
    # We'll use a random walk around base numbers to simulate live dataset ingestion
    base_clean = 4500
    base_dust = 2100
    base_crack = 1200
    base_hotspot = 800
    base_delam = 400
    
    # Randomly increment to simulate incoming telemetry data being added to the dataset
    added = random.randint(10, 100)
    
    clean = base_clean + int(added * 0.45)
    dust = base_dust + int(added * 0.25)
    crack = base_crack + int(added * 0.15)
    hotspot = base_hotspot + int(added * 0.10)
    delam = base_delam + int(added * 0.05)
    
    total = clean + dust + crack + hotspot + delam
    
    return {
        "status": "online",
        "total_volume": total,
        "classes": 5,
        "distribution": [
            {"name": "Clean / Normal", "value": clean, "color": "#10b981"},
            {"name": "Dust / Dirt", "value": dust, "color": "#f59e0b"},
            {"name": "Crack", "value": crack, "color": "#ef4444"},
            {"name": "Hotspot", "value": hotspot, "color": "#f97316"},
            {"name": "Delamination", "value": delam, "color": "#8b5cf6"},
        ]
    }
