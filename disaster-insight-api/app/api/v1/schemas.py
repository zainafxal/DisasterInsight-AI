from pydantic import BaseModel, Field
from typing import List

# --- Tweet Classification ---
class TweetClassificationRequest(BaseModel):
    text: str = Field(..., min_length=1, example="Just felt a huge earthquake in Tokyo, so scary!")

class TweetClassificationResponse(BaseModel):
    label: str
    score: float

# --- Static Risk Prediction ---
class StaticRiskRequest(BaseModel):
    disaster_group: str = Field(..., example="Natural")
    disaster_subgroup: str = Field(..., example="Geophysical")
    disaster_type: str = Field(..., example="Earthquake")
    country: str = Field(..., example="Japan")
    region: str = Field(..., example="Asia")
    start_year: int = Field(..., example=2024)
    start_month: int = Field(..., example=9)
    
    class Config:
        # Pydantic v2
        json_schema_extra = {
            "example": {
                "disaster_group": "Natural",
                "disaster_subgroup": "Hydrological",
                "disaster_type": "Flood",
                "country": "Pakistan",
                "region": "Asia",
                "start_year": 2022,
                "start_month": 8
            }
        }


class StaticRiskResponse(BaseModel):
    high_risk_probability: float

# --- Global Forecast ---
class GlobalForecastItem(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float

class GlobalForecastResponse(BaseModel):
    forecast: List[GlobalForecastItem]

# --- Regional Impact Prediction ---
class RegionalImpactRequest(BaseModel):
    event_count: int = Field(..., example=5)
    max_magnitude: float = Field(..., example=6.8)
    avg_magnitude: float = Field(..., example=5.5)

class RegionalImpactResponse(BaseModel):
    high_impact_probability: float