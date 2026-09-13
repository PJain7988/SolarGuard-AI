import os
import cv2
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict
from sklearn.model_selection import train_test_split
import albumentations as A

class DatasetManager:
    def __init__(self, data_dir: str, target_size: Tuple[int, int] = (224, 224)):
        self.data_dir = data_dir
        self.target_size = target_size
        self.classes = []
        self._load_classes()
        
        # Albumentations augmentation pipeline
        self.augmentor = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.RandomRotate90(p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.GaussNoise(p=0.2),
        ])

    def _load_classes(self):
        """Automatically detect classes based on folder names if they exist"""
        if os.path.exists(self.data_dir):
            self.classes = [d for d in os.listdir(self.data_dir) 
                            if os.path.isdir(os.path.join(self.data_dir, d))]
            self.classes.sort()

    def get_dataset_statistics(self) -> Dict:
        """Returns statistics about the current dataset distribution."""
        if not self.classes:
            return {"error": "Dataset directory not found or empty."}
            
        stats = {
            "total_images": 0,
            "classes": self.classes,
            "class_distribution": {}
        }
        
        for cls in self.classes:
            cls_path = os.path.join(self.data_dir, cls)
            # Count only valid image files
            num_images = len([f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            stats["class_distribution"][cls] = num_images
            stats["total_images"] += num_images
            
        return stats

    def load_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Loads and resizes all images into memory for baseline ML models."""
        X, y = [], []
        
        if not self.classes:
            return np.array([]), np.array([])
            
        for label, cls in enumerate(self.classes):
            cls_path = os.path.join(self.data_dir, cls)
            for img_name in os.listdir(cls_path):
                if not img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    continue
                
                img_path = os.path.join(cls_path, img_name)
                img = cv2.imread(img_path)
                if img is not None:
                    # Convert BGR to RGB
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    # Resize
                    img = cv2.resize(img, self.target_size)
                    X.append(img)
                    y.append(label)
                    
        return np.array(X), np.array(y)

    def prepare_train_test_split(self, test_size=0.2, random_state=42):
        """Prepares train, validation, and test splits."""
        X, y = self.load_data()
        if len(X) == 0:
            return None
            
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=test_size, stratify=y, random_state=random_state
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=random_state
        )
        
        return {
            "X_train": X_train, "y_train": y_train,
            "X_val": X_val, "y_val": y_val,
            "X_test": X_test, "y_test": y_test
        }
