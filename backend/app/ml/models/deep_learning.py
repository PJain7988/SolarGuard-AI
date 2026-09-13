import tensorflow as tf
from tensorflow.keras import layers, models, applications

class DeepLearningModels:
    def __init__(self, input_shape=(224, 224, 3), num_classes=2):
        self.input_shape = input_shape
        self.num_classes = num_classes

    def build_custom_cnn(self) -> tf.keras.Model:
        """Builds a custom CNN architecture from scratch."""
        model = models.Sequential([
            layers.Input(shape=self.input_shape),
            
            # Block 1
            layers.Conv2D(32, (3, 3), padding='same'),
            layers.BatchNormalization(),
            layers.Activation('relu'),
            layers.MaxPooling2D((2, 2)),
            
            # Block 2
            layers.Conv2D(64, (3, 3), padding='same'),
            layers.BatchNormalization(),
            layers.Activation('relu'),
            layers.MaxPooling2D((2, 2)),
            
            # Block 3
            layers.Conv2D(128, (3, 3), padding='same'),
            layers.BatchNormalization(),
            layers.Activation('relu'),
            layers.MaxPooling2D((2, 2)),
            
            # Block 4
            layers.Conv2D(256, (3, 3), padding='same'),
            layers.BatchNormalization(),
            layers.Activation('relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.3),
            
            # Classification head
            layers.GlobalAveragePooling2D(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model

    def build_mobilenet_v2(self, freeze_base=True) -> tf.keras.Model:
        """Builds a model based on MobileNetV2 with transfer learning."""
        base_model = applications.MobileNetV2(
            input_shape=self.input_shape,
            include_top=False,
            weights='imagenet'
        )
        
        if freeze_base:
            base_model.trainable = False
            
        inputs = tf.keras.Input(shape=self.input_shape)
        # MobileNetV2 expects input in [-1, 1]
        x = applications.mobilenet_v2.preprocess_input(inputs)
        x = base_model(x, training=not freeze_base)
        
        # Custom classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.4)(x)
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = tf.keras.Model(inputs, outputs)
        return model

    def build_efficientnet_b0(self, freeze_base=True) -> tf.keras.Model:
        """Builds a model based on EfficientNetB0 with transfer learning."""
        base_model = applications.EfficientNetB0(
            input_shape=self.input_shape,
            include_top=False,
            weights='imagenet'
        )
        
        if freeze_base:
            base_model.trainable = False
            
        inputs = tf.keras.Input(shape=self.input_shape)
        # EfficientNetB0 expects input in [0, 255] and handles normalization internally
        x = base_model(inputs, training=not freeze_base)
        
        # Custom classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.4)(x)
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = tf.keras.Model(inputs, outputs)
        return model
