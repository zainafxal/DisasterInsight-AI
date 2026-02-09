import pandas as pd
from datetime import datetime
from app.services.predictor import prediction_service
from app.services.rag_service import query_knowledge_base

# --- TOOL 1: RISK PREDICTION ---
def get_disaster_risk_assessment(region: str, disaster_type: str):
    """
    Consults the XGBoost Risk Model to predict if a region is High Risk.
    Args:
        region: The country or city name (e.g., "Pakistan", "Japan").
        disaster_type: The type of disaster (e.g., "Earthquake", "Flood").
    """
    # 1. We construct a DataFrame mimicking your ML model's training schema.
    # Since the LLM won't know exact GDP/Year columns, we use reasonable defaults 
    # or "Average" values for the model to run successfully.
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    # NOTE: In a production app, you would look up real GDP/Year data for the 'region'.
    # For this demo/scholarship, using representative defaults is acceptable 
    # to demonstrate the "Tool Calling" architecture functionality.
    input_data = pd.DataFrame([{
        'Disaster Group': 'Natural',
        'Disaster Subgroup': 'Meteorological', # Simplified default
        'Disaster Type': disaster_type,
        'Country': region,
        'Region': 'Asia', # Simplified default
        'Start Year': current_year,
        'Start Month': current_month
    }])
    
    try:
        result = prediction_service.predict_static_risk(input_data)
        prob = result.get('high_risk_probability', 0)
        
        risk_label = "Low"
        if prob > 0.7: risk_label = "CRITICAL"
        elif prob > 0.4: risk_label = "High"
        elif prob > 0.2: risk_label = "Moderate"
        
        return f"RISK MODEL OUTPUT: The predicted risk for {disaster_type} in {region} is {risk_label} (Probability: {prob:.1%})."
    except Exception as e:
        return f"Risk Model Error: {str(e)}"

# --- TOOL 2: TEXT CLASSIFICATION ---
def analyze_emergency_message(message: str):
    """
    Uses the DistilBERT Model to classify a text as 'Emergency', 'News', etc.
    Args:
        message: The text to analyze (e.g., "Help! Water entering house").
    """
    try:
        result = prediction_service.predict_tweet_classification(message)
        label = result['label'].replace('_', ' ').title()
        score = result['score']
        return f"AI CLASSIFICATION: The message is classified as '{label}' with {score:.1%} confidence."
    except Exception as e:
        return f"Classifier Error: {str(e)}"

# --- TOOL 3: KNOWLEDGE BASE (RAG) ---
def search_safety_protocols(query: str):
    """
    Searches the Official Disaster Protocol Database (PDFs) for safety guides.
    Args:
        query: The topic to search for (e.g., "First aid for burns", "Earthquake kit").
    """
    try:
        # Calls the vector DB function we wrote in Phase 2
        return query_knowledge_base(query, n_results=2)
    except Exception as e:
        return f"Knowledge Base Error: {str(e)}"

# --- TOOL 4: GLOBAL FORECAST ---
def get_global_earthquake_forecast():
    """
    Retrieves the Prophet Model's forecast for global earthquake frequency for the next month.
    """
    try:
        forecast = prediction_service.get_global_forecast(periods=30)
        if isinstance(forecast, dict) and "error" in forecast:
            return f"Forecast Error: {forecast['error']}"
            
        # Summarize the data for the LLM so we don't overload the context window
        avg_freq = sum([f['yhat'] for f in forecast]) / len(forecast)
        trend = "increasing" if forecast[-1]['yhat'] > forecast[0]['yhat'] else "decreasing"
        
        return f"PROPHET FORECAST: The global earthquake frequency is projected to be {trend} next month, averaging {avg_freq:.1f} events per month."
    except Exception as e:
        return f"Forecast Error: {str(e)}"