import numpy as np
import cv2
import tensorflow as tf
from tf_keras_vis.gradcam import Gradcam
from tf_keras_vis.utils.scores import CategoricalScore
import base64

class GradCamGenerator:
    def __init__(self, model: tf.keras.Model):
        self.model = model
        # tf-keras-vis requires the model to be wrapped, especially for custom models
        # It needs the last convolutional layer. 
        # For simplicity, we initialize Gradcam here.
        if self.model is not None:
            self.gradcam = Gradcam(self.model,
                                   model_modifier=self._model_modifier,
                                   clone=False)
        else:
            self.gradcam = None

    def _model_modifier(self, m):
        """Modifier to change last layer activation to linear (required by tf-keras-vis)"""
        m.layers[-1].activation = tf.keras.activations.linear
        return m

    def generate_heatmap(self, img_array: np.ndarray, class_idx: int) -> np.ndarray:
        """Generates a Grad-CAM heatmap for a specific class index."""
        if self.gradcam is None:
            return np.zeros((img_array.shape[1], img_array.shape[2]))
            
        score = CategoricalScore([class_idx])
        
        # Generate heatmap with GradCAM
        cam = self.gradcam(score, img_array, penultimate_layer=-1)
        heatmap = cam[0]
        
        return heatmap

    def overlay_heatmap(self, original_img: np.ndarray, heatmap: np.ndarray, alpha=0.5, colormap=cv2.COLORMAP_JET) -> np.ndarray:
        """Overlays the heatmap on the original image."""
        # Resize heatmap to match image dimensions
        heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
        
        # Convert heatmap to RGB format using colormap
        heatmap_uint8 = np.uint8(255 * heatmap)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, colormap)
        heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
        
        # Superimpose the heatmap on original image
        superimposed_img = cv2.addWeighted(original_img, 1-alpha, heatmap_color, alpha, 0)
        
        return superimposed_img

    def to_base64(self, img_array: np.ndarray) -> str:
        """Converts an image array to a base64 encoded string for API response."""
        # Convert RGB back to BGR for cv2 encoding
        bgr_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        _, buffer = cv2.imencode('.jpg', bgr_img)
        img_str = base64.b64encode(buffer).decode('utf-8')
        return img_str
