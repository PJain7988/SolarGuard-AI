from fastapi import APIRouter
from typing import Dict
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/")
async def get_reports_summary() -> Dict:
    # Generate mock data for the reports dashboard
    today = datetime.now()
    recent_reports = []
    
    report_types = ["Inspection Summary", "Anomaly Detection Log", "Hardware Degradation", "Maintenance Schedule"]
    statuses = ["Completed", "Processing", "Archived"]
    
    for i in range(8):
        date = today - timedelta(days=i*2)
        r_type = random.choice(report_types)
        recent_reports.append({
            "id": f"RPT-{random.randint(1000, 9999)}",
            "type": r_type,
            "date": date.strftime("%Y-%m-%d"),
            "size": f"{random.uniform(1.2, 14.5):.1f} MB",
            "status": random.choice(statuses) if i < 3 else "Completed"
        })
        
    return {
        "status": "success",
        "total_reports": 124,
        "storage_used": "4.2 GB",
        "scheduled_reports": 3,
        "recent_reports": recent_reports
    }
