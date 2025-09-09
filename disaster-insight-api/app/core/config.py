from pathlib import Path

# Define the base directory of the API project (disaster_api)
BASE_DIR = Path(__file__).resolve().parent.parent

# Define the path to the models directory inside disaster_api/
MODELS_DIR = BASE_DIR / "models"

# --- Model Paths ---
# Create specific paths for each model component
# Model 1: NLP Classifier
NLP_MODEL_PATH = MODELS_DIR / "01_fine-tuned_disaster_tweet_classifier"

# Model 2: Static Risk Predictor
RISK_PIPELINE_PATH = MODELS_DIR / "02_disaster_risk_predictor" / "xgb_risk_prediction_pipeline.joblib"

# Model 3: Global Earthquake Forecaster
GLOBAL_FORECAST_MODEL_PATH = MODELS_DIR / "03_earthquake_forecaster" / "prophet_earthquake_model.json"
# Corrected path to the CSV file
GLOBAL_FORECAST_DATA_PATH = MODELS_DIR / "03_earthquake_forecaster" / "earthquake_frequency_forecast.csv" 

# Model 4: Regional Impact Forecaster
REGIONAL_FORECAST_MODEL_PATH = MODELS_DIR / "04_regional_impact_forecaster" / "xgb_regional_impact_forecaster.joblib"