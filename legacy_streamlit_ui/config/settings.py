# API Configuration
API_BASE_URL = "http://127.0.0.1:8000/api/v1"

# Live Data API Configuration
USGS_API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"

# Static data for dropdowns in Risk Planner
# In a real app, this might come from a database or a file.
VALID_COUNTRIES = [
    'Afghanistan', 'China', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 
    'Pakistan', 'Philippines', 'Turkey', 'United States of America' # Example list
]
VALID_REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
VALID_DISASTER_TYPES = ['Earthquake', 'Flood', 'Storm', 'Drought', 'Landslide', 'Volcanic activity']