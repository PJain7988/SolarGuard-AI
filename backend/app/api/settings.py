from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

# Global settings state for MVP
GLOBAL_SETTINGS = {
    "camera_resolution": "1080p",
    "detection_threshold": 0.85,
    "auto_save_images": True,
    "alert_notifications": True,
    "system_theme": "dark",
    "ml_engine": "MobileNetV2"
}

class SettingsUpdate(BaseModel):
    camera_resolution: str = None
    detection_threshold: float = None
    auto_save_images: bool = None
    alert_notifications: bool = None
    system_theme: str = None
    ml_engine: str = None

@router.get("/")
async def get_settings() -> Dict:
    return {"status": "success", "settings": GLOBAL_SETTINGS}

@router.put("/")
async def update_settings(updates: SettingsUpdate) -> Dict:
    global GLOBAL_SETTINGS
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key in GLOBAL_SETTINGS:
            GLOBAL_SETTINGS[key] = value
            
    return {"status": "success", "settings": GLOBAL_SETTINGS}
