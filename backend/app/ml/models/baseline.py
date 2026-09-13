import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import time
import os

class BaselineMLModel:
    def __init__(self, model_type="random_forest"):
        self.model_type = model_type
        if model_type == "random_forest":
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        elif model_type == "svm":
            self.model = SVC(kernel='linear', probability=True, random_state=42)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
            
    def _flatten_images(self, X: np.ndarray) -> np.ndarray:
        """Flatten image data for classical ML algorithms"""
        if len(X.shape) == 4:
            # Flatten (N, H, W, C) -> (N, H*W*C)
            return X.reshape(X.shape[0], -1)
        return X

    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        """Train the baseline model and record training time."""
        X_train_flat = self._flatten_images(X_train)
        
        start_time = time.time()
        self.model.fit(X_train_flat, y_train)
        self.training_time = time.time() - start_time
        
        return self.training_time

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        """Evaluate model and return metrics."""
        X_test_flat = self._flatten_images(X_test)
        
        start_time = time.time()
        y_pred = self.model.predict(X_test_flat)
        inference_time = time.time() - start_time
        
        metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, average='weighted'),
            "recall": recall_score(y_test, y_pred, average='weighted'),
            "f1_score": f1_score(y_test, y_pred, average='weighted'),
            "inference_time": inference_time,
            "training_time": getattr(self, 'training_time', None)
        }
        
        return metrics

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_flat = self._flatten_images(X)
        return self.model.predict(X_flat)
        
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        X_flat = self._flatten_images(X)
        return self.model.predict_proba(X_flat)

    def save(self, filepath: str):
        joblib.dump(self.model, filepath)
        
    def load(self, filepath: str):
        if os.path.exists(filepath):
            self.model = joblib.load(filepath)
        else:
            raise FileNotFoundError(f"Model file not found: {filepath}")
