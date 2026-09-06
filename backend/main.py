import os
import io
import json
from contextlib import asynccontextmanager
from typing import List, Dict, Any

# Ensure keras and matplotlib use local workspace paths to avoid sandbox/permission issues
os.environ["KERAS_HOME"] = os.path.join(os.path.dirname(__file__), ".keras")
os.environ["MPLCONFIGDIR"] = os.path.join(os.path.dirname(__file__), ".matplotlib")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import keras

CLASS_LABELS: List[str] = [
    'Corn___Common_Rust',
    'Corn___Gray_Leaf_Spot',
    'Corn___Healthy',
    'Corn___Northern_Leaf_Blight',
    'Potato___Early_Blight',
    'Potato___Healthy',
    'Potato___Late_Blight',
    'Rice___Brown_Spot',
    'Rice___Healthy',
    'Rice___Leaf_Blast',
    'Rice___Neck_Blast',
    'Sugarcane_Bacterial Blight',
    'Sugarcane_Healthy',
    'Sugarcane_Red Rot',
    'Wheat___Brown_Rust',
    'Wheat___Healthy',
    'Wheat___Yellow_Rust'
]

def parse_class_label(raw_label: str) -> Dict[str, Any]:
    """Parse raw class label into crop, condition, and healthy status."""
    is_healthy = "healthy" in raw_label.lower()
    
    if "___" in raw_label:
        parts = raw_label.split("___", 1)
        crop = parts[0].strip().replace("_", " ")
        condition = parts[1].strip().replace("_", " ")
    elif "_" in raw_label:
        parts = raw_label.split("_", 1)
        crop = parts[0].strip().replace("_", " ")
        condition = parts[1].strip().replace("_", " ")
    else:
        crop = "Unknown Crop"
        condition = raw_label.strip()

    display_name = f"{crop} — {condition}"
    return {
        "raw": raw_label,
        "crop": crop,
        "condition": condition,
        "display_name": display_name,
        "is_healthy": is_healthy
    }

MODEL = None
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "crop_disease_model_final.keras")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}")
    print(f"Loading Keras model from {MODEL_PATH}...")
    MODEL = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
    yield
    MODEL = None

app = FastAPI(
    title="Smart Farm Disease Detection API",
    description="Inference API for MobileNetV2 crop disease detection model",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local dev and frontend deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "classes_count": len(CLASS_LABELS)
    }

@app.get("/api/classes")
def get_classes():
    return [
        {"index": idx, **parse_class_label(label)}
        for idx, label in enumerate(CLASS_LABELS)
    ]

@app.post("/api/predict")
async def predict_crop_disease(file: UploadFile = File(...)):
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (JPEG/PNG/WEBP)")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

    # Preprocess image: target shape (180, 180, 3), float32
    target_size = (180, 180)
    resized_image = image.resize(target_size)
    img_array = np.array(resized_image, dtype=np.float32)
    img_batch = np.expand_dims(img_array, axis=0)  # Shape: (1, 180, 180, 3)

    # Note: The model's config includes TrueDivide(127.5) and Subtract(1.0) layers,
    # so input expects raw [0, 255] RGB float32 pixels.
    predictions = MODEL.predict(img_batch)
    probabilities = predictions[0]

    top_index = int(np.argmax(probabilities))
    top_confidence = float(probabilities[top_index])
    top_label_info = parse_class_label(CLASS_LABELS[top_index])

    # Get top 3 predictions for differential confidence
    sorted_indices = np.argsort(probabilities)[::-1][:3]
    top_predictions = []
    for idx in sorted_indices:
        label_info = parse_class_label(CLASS_LABELS[idx])
        top_predictions.append({
            "index": int(idx),
            **label_info,
            "confidence": float(probabilities[idx]),
            "percentage": round(float(probabilities[idx]) * 100, 2)
        })

    return {
        "status": "success",
        "predicted_class": CLASS_LABELS[top_index],
        "crop": top_label_info["crop"],
        "condition": top_label_info["condition"],
        "display_name": top_label_info["display_name"],
        "is_healthy": top_label_info["is_healthy"],
        "confidence": top_confidence,
        "percentage": round(top_confidence * 100, 2),
        "top_predictions": top_predictions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

