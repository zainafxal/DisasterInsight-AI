export interface EarthquakeData {
  id: string;
  time: Date;
  place: string;
  magnitude: number;
  depth: number;
  url: string;
  lat: number;
  lon: number;
}

export interface ForecastData {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ClassificationResult {
  label: string;
  score: number;
}

export interface RiskAssessment {
  high_risk_probability: number;
  risk_factors?: Record<string, number>;
}

export interface RegionalForecast {
  high_impact_probability: number;
  confidence_interval?: [number, number];
}