import json
import numpy as np
import onnxruntime as ort
from PIL import Image
from io import BytesIO
from app.core.config import BASE_DIR

# Paths
MODEL_DIR = BASE_DIR / "models" / "05_visual_damage_classifier"
MODEL_PATH = MODEL_DIR / "disaster_cv_model.onnx"
CLASS_INDICES_PATH = MODEL_DIR / "class_indices.json"


class DamageAssessmentService:
    def __init__(self):
        self.session = None
        self.class_indices = None
        self.input_name = None
        self._load_resources()

    def _load_resources(self):
        """Load ONNX model and classes once at startup."""
        print("📸 Loading ONNX Computer Vision Model...")
        try:
            # Load ONNX model
            self.session = ort.InferenceSession(
                str(MODEL_PATH),
                providers=["CPUExecutionProvider"]
            )
            print("✅ ONNX model loaded")

            # Cache input tensor name
            self.input_name = self.session.get_inputs()[0].name

            # Load class mapping
            with open(CLASS_INDICES_PATH, "r") as f:
                self.class_indices = json.load(f)
            print(f"✅ Class indices loaded: {self.class_indices}")

        except Exception as e:
            print(f"❌ Error loading CV model: {e}")

    def _preprocess_image(self, image_bytes: bytes):
        """
        Same preprocessing as TF:
        - RGB
        - resize 224x224
        - normalize 1./255
        - add batch dimension
        """
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img).astype("float32") / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def _get_triage_logic(self, label: str):
        """Same triage rules as your TF code."""
        triage_map = {
            "4_damage_major": {
                "priority": "CRITICAL (RED)",
                "action": "Dispatch Search & Rescue Team",
                "color": "#ef4444"
            },
            "2_fire_smoke": {
                "priority": "CRITICAL (RED)",
                "action": "Notify Fire Brigade & Hazmat",
                "color": "#ef4444"
            },
            "1_flood_water": {
                "priority": "HIGH (ORANGE)",
                "action": "Utilities Shutdown & Boat Rescue",
                "color": "#f97316"
            },
            "3_damage_minor": {
                "priority": "MEDIUM (YELLOW)",
                "action": "Civil Engineer Inspection Required",
                "color": "#eab308"
            },
            "0_no_damage": {
                "priority": "LOW (GREEN)",
                "action": "Log as Safe Route",
                "color": "#22c55e"
            }
        }
        return triage_map.get(label, {
            "priority": "UNKNOWN",
            "action": "Manual Review",
            "color": "#6b7280"
        })

    def predict_damage(self, image_bytes: bytes):
        if self.session is None:
            return {"error": "Model not loaded"}

        try:
            # Preprocess
            img_array = self._preprocess_image(image_bytes)

            # ONNX inference
            preds = self.session.run(
                None,
                {self.input_name: img_array}
            )[0]

            # Extract prediction
            class_idx = int(np.argmax(preds))
            confidence = float(np.max(preds))
            label = self.class_indices.get(str(class_idx)) or self.class_indices.get(class_idx)

            triage = self._get_triage_logic(label)

            return {
                "status": "success",
                "detected_event": label,
                "confidence": confidence,
                "triage_priority": triage["priority"],
                "action_recommendation": triage["action"],
                "ui_color": triage["color"]
            }

        except Exception as e:
            return {"error": str(e)}


# Singleton
cv_service = DamageAssessmentService()
