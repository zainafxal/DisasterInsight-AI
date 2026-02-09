from fastapi import APIRouter, HTTPException, File, UploadFile
import pandas as pd
from pydantic import BaseModel

# Your existing services
from app.services.predictor import prediction_service

# New agent + RAG services
from app.services.agent_service import process_chat_message
from app.services.rag_service import ingest_documents

# New CV service
from app.services.cv_service import cv_service

# Existing schemas
from . import schemas


# -----------------------------
# Shared Router
# -----------------------------
router = APIRouter()

@router.get("/")
def api_v1_root():
    """
    Simple health check for the API v1 root path.
    Fixes 404 errors when frontend pings '/api/v1/'.
    """
    return {"message": "Disaster Insight API v1 is online"}


# ============================================================
# 📌 1. Tweet Classification Endpoint
# ============================================================
@router.post("/classify-tweet", response_model=schemas.TweetClassificationResponse)
def classify_tweet(request: schemas.TweetClassificationRequest):
    """
    Classifies a single piece of text into a disaster-related category.
    """
    try:
        result = prediction_service.predict_tweet_classification(request.text)
        return schemas.TweetClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 2. Static Disaster Risk Prediction
# ============================================================
@router.post("/predict-risk", response_model=schemas.StaticRiskResponse)
def predict_risk(request: schemas.StaticRiskRequest):
    """
    Predicts the static risk of a disaster event becoming high-impact.
    """
    try:
        input_dict = request.model_dump()

        key_mapping = {
            "start_year": "Start Year",
            "start_month": "Start Month",
            "disaster_group": "Disaster Group",
            "disaster_subgroup": "Disaster Subgroup",
            "disaster_type": "Disaster Type",
            "country": "Country",
            "region": "Region"
        }

        renamed_input = {key_mapping.get(k, k): v for k, v in input_dict.items()}
        input_df = pd.DataFrame([renamed_input])

        result = prediction_service.predict_static_risk(input_df)
        return schemas.StaticRiskResponse(**result)

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing or invalid field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 3. Global Earthquake Forecast
# ============================================================
@router.get("/global-earthquake-forecast", response_model=schemas.GlobalForecastResponse)
def get_global_forecast():
    """
    Retrieves the global forecast for significant earthquake frequency.
    """
    try:
        forecast_data = prediction_service.get_global_forecast(periods=60)
        return schemas.GlobalForecastResponse(forecast=forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 4. Regional Impact Prediction
# ============================================================
@router.post("/predict-regional-impact", response_model=schemas.RegionalImpactResponse)
def predict_regional_impact(request: schemas.RegionalImpactRequest):
    """
    Forecasts the probability of major regional earthquakes next quarter.
    """
    try:
        input_df = pd.DataFrame([request.model_dump()])
        result = prediction_service.predict_regional_impact(input_df)
        return schemas.RegionalImpactResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 5. Chat Agent: Ask
# ============================================================
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat/ask", response_model=ChatResponse)
async def ask_agent(request: ChatRequest):
    """
    Chat interface where the AI Agent can:
    ✔ answer questions  
    ✔ call ML models  
    ✔ search PDF documents (RAG)  
    """
    try:
        response_text = await process_chat_message(request.message)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 6. Chat Agent: Document Ingestion (RAG)
# ============================================================
@router.post("/chat/ingest-docs")
async def ingest_knowledge_base():
    """
    Reads PDFs in /documents and updates the Vector DB for RAG retrieval.
    """
    try:
        ingest_documents()
        return {
            "status": "success",
            "message": "Documents processed and stored in Vector DB."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📌 7. Image-Based Damage Analysis (CV Model)
# ============================================================
@router.post("/analyze-damage")
async def analyze_damage_image(file: UploadFile = File(...)):
    """
    Receives an image file, runs the CV model, and returns Triage assessment.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        result = cv_service.predict_damage(contents)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
