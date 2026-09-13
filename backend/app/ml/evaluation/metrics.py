import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report
)
import matplotlib.pyplot as plt
import seaborn as sns
import os

class ModelEvaluator:
    def __init__(self, classes, output_dir="../experiments/evaluations"):
        self.classes = classes
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.results = {}

    def evaluate(self, model_name: str, y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray = None):
        """Evaluate a model and store the metrics."""
        metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision_macro": precision_score(y_true, y_pred, average='macro', zero_division=0),
            "recall_macro": recall_score(y_true, y_pred, average='macro', zero_division=0),
            "f1_macro": f1_score(y_true, y_pred, average='macro', zero_division=0),
            "f1_weighted": f1_score(y_true, y_pred, average='weighted', zero_division=0)
        }
        
        # Calculate ROC-AUC for binary or multiclass
        if y_prob is not None:
            try:
                if len(self.classes) == 2:
                    # binary case requires prob of positive class
                    metrics["roc_auc"] = roc_auc_score(y_true, y_prob[:, 1])
                else:
                    metrics["roc_auc"] = roc_auc_score(y_true, y_prob, multi_class='ovr')
            except Exception as e:
                metrics["roc_auc"] = None
                
        self.results[model_name] = metrics
        
        # Save confusion matrix plot
        self._plot_confusion_matrix(y_true, y_pred, model_name)
        
        return metrics

    def _plot_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray, model_name: str):
        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=self.classes, yticklabels=self.classes)
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, f'cm_{model_name}.png'))
        plt.close()

    def compare_models(self) -> pd.DataFrame:
        """Returns a dataframe comparing all evaluated models."""
        if not self.results:
            return pd.DataFrame()
            
        df = pd.DataFrame.from_dict(self.results, orient='index')
        df = df.round(4)
        
        # Save comparison report
        df.to_csv(os.path.join(self.output_dir, 'model_comparison.csv'))
        return df
