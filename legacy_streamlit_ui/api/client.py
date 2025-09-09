import requests
import streamlit as st
import pandas as pd
from config import settings

# --- API Communication Layer ---

@st.cache_data(ttl=600)  # Cache for 10 minutes
def get_live_usgs_data():
    """Fetches and processes live earthquake data from the USGS API."""
    try:
        response = requests.get(settings.USGS_API_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching live data from USGS: {e}")
        return None

@st.cache_data
def get_global_forecast():
    """Fetches the pre-calculated global forecast from our API."""
    try:
        response = requests.get(f"{settings.API_BASE_URL}/global-earthquake-forecast")
        response.raise_for_status()
        df = pd.DataFrame(response.json()['forecast'])
        df['ds'] = pd.to_datetime(df['ds'])
        return df
    except requests.exceptions.RequestException as e:
        st.error(f"API Error fetching global forecast: {e}")
        return pd.DataFrame()

def classify_text(text: str):
    """Calls the NLP classification endpoint."""
    if not text:
        return None
    try:
        response = requests.post(f"{settings.API_BASE_URL}/classify-tweet", json={"text": text})
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"API Error: {e}")
        return None

def predict_static_risk(data: dict):
    """Calls the static risk prediction endpoint."""
    try:
        response = requests.post(f"{settings.API_BASE_URL}/predict-risk", json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"API Error: {e}")
        return None

def predict_regional_impact(data: dict):
    """Calls the regional impact forecast endpoint."""
    try:
        response = requests.post(f"{settings.API_BASE_URL}/predict-regional-impact", json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"API Error: {e}")
        return None