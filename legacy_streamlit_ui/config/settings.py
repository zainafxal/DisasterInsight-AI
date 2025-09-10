import os
from dotenv import load_dotenv

# Load environment variables from .env if present (for local development)
load_dotenv()

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000/api/v1")

# Live Data API Configuration
USGS_API_URL = os.getenv(
    "USGS_API_URL",
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"
)

# Static data for dropdowns in Risk Planner
VALID_COUNTRIES = [
    'Afghanistan', 'China', 'India', 'Indonesia', 'Iran (Islamic Republic of)',
    'Pakistan', 'Philippines', 'Turkey', 'United States of America'  # Example list
]
VALID_REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
VALID_DISASTER_TYPES = ['Earthquake', 'Flood', 'Storm', 'Drought', 'Landslide', 'Volcanic activity']
