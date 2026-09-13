import os
import tensorflow as tf

# Ensure directory exists
output_dir = r"d:\AI_ML_Project\Solar_Panel_Detect\experiments\cnn"
os.makedirs(output_dir, exist_ok=True)
model_path = os.path.join(output_dir, "best_model.h5")

print("Building dummy neural network...")
# Create a lightweight dummy model for fast inference (untrained)
inputs = tf.keras.layers.Input(shape=(224, 224, 3))
x = tf.keras.layers.Conv2D(8, 3, activation='relu', padding='same')(inputs)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
outputs = tf.keras.layers.Dense(4, activation='softmax')(x)

model = tf.keras.models.Model(inputs=inputs, outputs=outputs)
model.compile(optimizer='adam', loss='categorical_crossentropy')

# Save the model
model.save(model_path)
print(f"Model saved successfully to {model_path}")
