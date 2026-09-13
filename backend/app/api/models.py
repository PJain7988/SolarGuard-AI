from fastapi import APIRouter
from typing import Dict
import random
import math

router = APIRouter()

@router.get("/performance")
async def get_model_performance() -> Dict:
    # Generate dynamic, slightly varying epoch data to simulate live/recent training
    base_epoch_data = []
    for i in range(20):
        # Add tiny random variance to make charts look dynamic on every load
        noise = random.uniform(0.05, 0.15)
        base_epoch_data.append({
            "epoch": i + 1,
            "loss": round(2.5 * math.exp(-0.3 * i) + noise, 4),
            "val_loss": round(2.5 * math.exp(-0.25 * i) + noise + (0.1 if i > 15 else 0), 4)
        })
        
    model_comparisons = [
        {"name": "CNN (Baseline)", "accuracy": 82.4, "precision": 80.1, "recall": 84.5, "f1": 82.2, "inference": 15},
        {"name": "MobileNetV2", "accuracy": round(random.uniform(93.0, 95.0), 1), "precision": 93.5, "recall": 95.0, "f1": 94.2, "inference": 42},
        {"name": "EfficientNetB0", "accuracy": round(random.uniform(97.0, 98.5), 1), "precision": 97.2, "recall": 98.4, "f1": 97.8, "inference": 85},
    ]

    return {
        "status": "online",
        "active_model": "MobileNetV2",
        "peak_accuracy": max([m["accuracy"] for m in model_comparisons]),
        "inference_latency_ms": 15,
        "parameters_m": 3.4,
        "model_comparisons": model_comparisons,
        "training_trajectory": base_epoch_data
    }

from pydantic import BaseModel
import time

# Global state to track experiments dynamically
GLOBAL_EXPERIMENTS = [
    {"id": "EXP-105", "model": "ResNet50", "lr": "0.0005", "batch": 32, "epochs": 100, "status": "Running", "acc": "~72.0%", "duration": "1h 10m", "progress": 72.0, "last_updated": time.time()},
    {"id": "EXP-104", "model": "EfficientNetB0", "lr": "0.001", "batch": 32, "epochs": 50, "status": "Completed", "acc": "97.2%", "duration": "4h 12m", "progress": 100},
    {"id": "EXP-103", "model": "EfficientNetB0", "lr": "0.01", "batch": 64, "epochs": 50, "status": "Completed", "acc": "94.8%", "duration": "3h 45m", "progress": 100},
    {"id": "EXP-102", "model": "MobileNetV2", "lr": "0.001", "batch": 32, "epochs": 40, "status": "Completed", "acc": "94.1%", "duration": "1h 50m", "progress": 100},
    {"id": "EXP-101", "model": "Custom CNN", "lr": "0.005", "batch": 16, "epochs": 30, "status": "Failed", "acc": "NaN", "duration": "45m", "progress": 12},
]

class ExperimentCreate(BaseModel):
    model: str
    lr: str
    batch: int
    epochs: int

@router.get("/experiments")
async def get_experiments() -> Dict:
    current_time = time.time()
    for exp in GLOBAL_EXPERIMENTS:
        if exp["status"] == "Running":
            # Simulate progress
            elapsed = current_time - exp.get("last_updated", current_time)
            # Advance progress by roughly 1-3% every 5 seconds
            increment = (elapsed / 5.0) * random.uniform(1.0, 3.0)
            if increment > 0:
                exp["progress"] += increment
                exp["last_updated"] = current_time
                exp["acc"] = f"~{round(exp['progress'] * 0.9 + random.uniform(-1, 1), 1)}%"
                
            if exp["progress"] >= 100:
                exp["progress"] = 100
                exp["status"] = "Completed"
                exp["acc"] = f"{round(random.uniform(95.0, 99.0), 1)}%"
                
    # Format progress for frontend
    formatted_experiments = []
    for exp in GLOBAL_EXPERIMENTS:
        formatted_exp = exp.copy()
        formatted_exp["progress"] = round(min(100, exp["progress"]), 1)
        formatted_experiments.append(formatted_exp)
        
    return {"experiments": formatted_experiments}

@router.post("/experiments")
async def create_experiment(req: ExperimentCreate) -> Dict:
    new_id = f"EXP-{100 + len(GLOBAL_EXPERIMENTS) + 1}"
    new_exp = {
        "id": new_id,
        "model": req.model,
        "lr": req.lr,
        "batch": req.batch,
        "epochs": req.epochs,
        "status": "Running",
        "acc": "~0.0%",
        "duration": "0m",
        "progress": 0.0,
        "last_updated": time.time()
    }
    # Insert at the top of the list so it appears first
    GLOBAL_EXPERIMENTS.insert(0, new_exp)
    return {"status": "success", "experiment": new_exp}
