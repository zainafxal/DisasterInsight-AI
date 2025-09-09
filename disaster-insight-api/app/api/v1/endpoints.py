from fastapi import APIRouter, HTTPException
import pandas as pd

from app.services.predictor import prediction_service
from . import schemas

router = APIRouter()

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

@router.post("/predict-risk", response_model=schemas.StaticRiskResponse)
def predict_risk(request: schemas.StaticRiskRequest):
    """
    Predicts the static risk of a disaster event becoming high-impact based on its characteristics.
    """
    try:
        # Step 1: Convert request to dictionary
        input_dict = request.model_dump()

        # Step 2: Rename keys to match model column expectations
        key_mapping = {
            "start_year": "Start Year",
            "start_month": "Start Month",
            "disaster_group": "Disaster Group",
            "disaster_subgroup": "Disaster Subgroup",
            "disaster_type": "Disaster Type",
            "country": "Country",
            "region": "Region"
        }

        # Rename the keys using dictionary comprehension
        renamed_input = {key_mapping.get(k, k): v for k, v in input_dict.items()}

        # Step 3: Convert to DataFrame
        input_data = pd.DataFrame([renamed_input])

        # Step 4: Predict
        result = prediction_service.predict_static_risk(input_data)
        return schemas.StaticRiskResponse(**result)

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing or invalid field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/global-earthquake-forecast", response_model=schemas.GlobalForecastResponse)
def get_global_forecast():
    """
    Retrieves the pre-calculated global forecast for significant earthquake frequency.
    """
    try:
        forecast_data = prediction_service.get_global_forecast(periods=60) # Get 5 years
        return schemas.GlobalForecastResponse(forecast=forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.post("/predict-regional-impact", response_model=schemas.RegionalImpactResponse)
def predict_regional_impact(request: schemas.RegionalImpactRequest):
    """
    Forecasts the probability of a high-impact earthquake in the next quarter 
    based on the current quarter's seismic activity.
    Note: This model is only trained for a specific set of high-risk regions.
    """
    try:
        input_data = pd.DataFrame([request.model_dump()])
        result = prediction_service.predict_regional_impact(input_data)
        return schemas.RegionalImpactResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))