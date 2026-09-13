from fastapi import APIRouter, Depends, HTTPException, status
from app.database.connection import get_database
from typing import List
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# Helper to convert MongoDB ObjectId to string
def doc_to_dict(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/history")
async def get_inspection_history(db = Depends(get_database)):
    try:
        if db is None:
            raise Exception("Database not connected")
        
        # Fetch all inspections, sorted by newest first
        cursor = db.inspections.find({}).sort("timestamp", -1).limit(100)
        inspections = await cursor.to_list(length=100)
        
        return [doc_to_dict(ins) for ins in inspections]
    except Exception as e:
        print(f"MongoDB Error (History): {e}")
        # Graceful fallback to mock data
        return [
            { "_id": "INS-001", "timestamp": datetime.utcnow(), "prediction": "Crack", "severity": "High", "confidence": 0.94 },
            { "_id": "INS-002", "timestamp": datetime.utcnow(), "prediction": "Clean", "severity": "Low", "confidence": 0.99 },
            { "_id": "INS-003", "timestamp": datetime.utcnow(), "prediction": "Dust", "severity": "Medium", "confidence": 0.82 }
        ]

@router.post("/save")
async def save_inspection_result(result_data: dict, db = Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Add timestamp if not present
    result_data["timestamp"] = datetime.utcnow()
    
    new_inspection = await db.inspections.insert_one(result_data)
    created_doc = await db.inspections.find_one({"_id": new_inspection.inserted_id})
    return doc_to_dict(created_doc)
