import os
import argparse
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, TensorBoard, ReduceLROnPlateau
import sys

# Add backend to path so we can import our models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.ml.models.deep_learning import DeepLearningModels

def get_callbacks(model_name: str, exp_dir: str = '../experiments'):
    """Generate Keras callbacks for training."""
    os.makedirs(exp_dir, exist_ok=True)
    model_dir = os.path.join(exp_dir, model_name)
    os.makedirs(model_dir, exist_ok=True)
    
    checkpoint_path = os.path.join(model_dir, 'best_model.h5')
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=checkpoint_path, monitor='val_accuracy', save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6, verbose=1),
        TensorBoard(log_dir=os.path.join(model_dir, 'logs'))
    ]
    return callbacks

def train_model(args):
    # Dummy data generator for illustration since we don't have real dataset yet
    # In a real setup, we would use tf.keras.preprocessing.image_dataset_from_directory 
    # or the DatasetManager we created.
    
    print(f"Initializing training for {args.model_type}...")
    
    dl_models = DeepLearningModels(input_shape=(224, 224, 3), num_classes=args.num_classes)
    
    if args.model_type == 'cnn':
        model = dl_models.build_custom_cnn()
    elif args.model_type == 'mobilenet':
        model = dl_models.build_mobilenet_v2(freeze_base=args.freeze)
    elif args.model_type == 'efficientnet':
        model = dl_models.build_efficientnet_b0(freeze_base=args.freeze)
    else:
        raise ValueError(f"Unknown model type: {args.model_type}")

    optimizer = tf.keras.optimizers.Adam(learning_rate=args.learning_rate)
    model.compile(
        optimizer=optimizer,
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    callbacks = get_callbacks(args.model_type)
    
    print("WARNING: Using dummy data for training script validation.")
    import numpy as np
    X_dummy = np.random.rand(32, 224, 224, 3).astype('float32')
    y_dummy = np.random.randint(0, args.num_classes, size=(32,))
    
    history = model.fit(
        X_dummy, y_dummy,
        validation_split=0.2,
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=callbacks,
        verbose=1
    )
    
    print(f"Training completed. Best model saved in ../experiments/{args.model_type}/best_model.h5")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Deep Learning Models for SolarGuard")
    parser.add_argument("--model_type", type=str, default="cnn", choices=["cnn", "mobilenet", "efficientnet"])
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--learning_rate", type=float, default=0.001)
    parser.add_argument("--num_classes", type=int, default=2)
    parser.add_argument("--unfreeze", dest="freeze", action="store_false", help="Unfreeze base model layers")
    parser.set_defaults(freeze=True)
    
    args = parser.parse_args()
    train_model(args)
