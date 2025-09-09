import pandas as pd
import streamlit as st

def format_risk_score(score: float) -> str:
    """Formats a risk score with color."""
    if score > 0.75:
        return f"🔴 High Risk ({score:.2%})"
    elif score > 0.5:
        return f"🟠 Moderate Risk ({score:.2%})"
    else:
        return f"🟢 Low Risk ({score:.2%})"

def process_usgs_data(geojson_data):
    """Processes GeoJSON from USGS API into a clean DataFrame."""
    if not geojson_data or 'features' not in geojson_data:
        return pd.DataFrame()

    features = []
    for feature in geojson_data['features']:
        properties = feature['properties']
        geom = feature['geometry']['coordinates']
        features.append({
            'time': pd.to_datetime(properties['time'], unit='ms'),
            'place': properties['place'],
            'magnitude': properties['mag'],
            'depth': geom[2],
            'url': properties['url'],
            'lat': geom[1],
            'lon': geom[0]
        })
    
    df = pd.DataFrame(features)
    if not df.empty:
        df = df.sort_values('time', ascending=False).reset_index(drop=True)
    return df