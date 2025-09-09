import pandas as pd
import numpy as np
import joblib
import json
import traceback
from functools import lru_cache
from prophet import Prophet
from prophet.serialize import model_from_json
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from pathlib import Path

# ... (imports from config are the same)
from app.core.config import (
    NLP_MODEL_PATH,
    RISK_PIPELINE_PATH,
    GLOBAL_FORECAST_MODEL_PATH,
    GLOBAL_FORECAST_DATA_PATH,
    REGIONAL_FORECAST_MODEL_PATH
)

class PredictionService:
    # ... (__init__ and all loading methods are the same)
    def __init__(self):
        self.nlp_classifier = self._load_nlp_classifier()
        self.risk_pipeline = self._load_risk_pipeline()
        self.global_forecaster = self._load_global_forecaster()
        self.global_forecast_data = self._load_global_forecast_data()
        self.historical_earthquake_data = self._load_historical_earthquake_data() # Added for context
        self.regional_forecaster = self._load_regional_forecaster()

    @lru_cache(maxsize=1)
    def _load_nlp_classifier(self):
        print("Loading NLP classification model...")
        model_path_str = str(NLP_MODEL_PATH)
        tokenizer = AutoTokenizer.from_pretrained(model_path_str)
        model = AutoModelForSequenceClassification.from_pretrained(model_path_str)
        return pipeline("text-classification", model=model, tokenizer=tokenizer)

    @lru_cache(maxsize=1)
    def _load_risk_pipeline(self):
        print("Loading static risk prediction pipeline...")
        return joblib.load(str(RISK_PIPELINE_PATH))

    @lru_cache(maxsize=1)
    def _load_global_forecaster(self):
        print("Loading Prophet global forecasting model...")
        model_path = str(GLOBAL_FORECAST_MODEL_PATH)
        try:
            with open(model_path, "r", encoding="utf-8") as fin:
                model = model_from_json(fin.read())
            print("✅ Prophet model loaded successfully")
            return model
        except Exception:
            print("[❌ Prophet load failed]")
            traceback.print_exc()
            return None
    
    @lru_cache(maxsize=1)
    def _load_global_forecast_data(self):
        print("Loading global forecast data...")
        return pd.read_csv(str(GLOBAL_FORECAST_DATA_PATH), parse_dates=['ds'])
    
    # --- NEW METHOD TO LOAD HISTORICAL DATA ---
    @lru_cache(maxsize=1)
    def _load_historical_earthquake_data(self):
        print("Loading historical earthquake data...")
        # Construct the path based on the forecast data path
        historical_path = Path(GLOBAL_FORECAST_DATA_PATH).parent / "earthquake_monthly_historical_counts.csv"
        return pd.read_csv(str(historical_path), parse_dates=['ds'])
        
    @lru_cache(maxsize=1)
    def _load_regional_forecaster(self):
        print("Loading regional impact forecasting model...")
        return joblib.load(str(REGIONAL_FORECAST_MODEL_PATH))

    # --- Prediction methods ---
    def predict_tweet_classification(self, text: str):
        if self.nlp_classifier is None: return {"error": "Model not loaded"}
        result = self.nlp_classifier(text)
        return result[0]

    def predict_static_risk(self, data: pd.DataFrame):
        if self.risk_pipeline is None: return {"error": "Model not loaded"}
        prediction_proba = self.risk_pipeline.predict_proba(data)[:, 1]
        return {"high_risk_probability": float(prediction_proba[0])}

    # --- CORRECTED METHOD ---
    def get_global_forecast(self, periods: int = 60):
        """
        Retrieves the pre-calculated forecast from the file.
        It identifies the start of the forecast period and returns the requested number of periods.
        """
        if self.global_forecast_data is None or self.historical_earthquake_data is None:
            return {"error": "Forecast data not loaded"}

        # Find the last date of actual historical data
        last_historical_date = self.historical_earthquake_data['ds'].max()
        
        # The forecast starts on the month after the last historical date
        forecast_start_date = last_historical_date + pd.DateOffset(months=1)

        # Filter the forecast data to only include dates from the forecast period onwards
        future_forecast = self.global_forecast_data[
            self.global_forecast_data['ds'] >= forecast_start_date
        ].head(periods).copy()

        if future_forecast.empty:
            return {"error": "No future forecast data available in the file."}

        # Convert timestamp to string for JSON compatibility
        future_forecast['ds'] = future_forecast['ds'].dt.strftime('%Y-%m-%d')
        return future_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict(orient='records')


    def predict_regional_impact(self, data: pd.DataFrame):
        if self.regional_forecaster is None: return {"error": "Model not loaded"}
        prediction_proba = self.regional_forecaster.predict_proba(data)[:, 1]
        return {"high_impact_probability": float(prediction_proba[0])}

# Instantiate the service
prediction_service = PredictionService()