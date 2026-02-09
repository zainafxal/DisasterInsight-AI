import axios from 'axios';
import toast from 'react-hot-toast';
import type {
  EarthquakeData,
  ForecastData,
  ClassificationResult,
  RiskAssessment,
  RegionalForecast
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const USGS_API_URL = import.meta.env.VITE_USGS_API_URL || 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'; 

console.log('API Configuration:', {
  API_BASE_URL,
  env: import.meta.env.MODE
});

// --- THE FIX IS HERE: Added 'export' ---
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request,
      config: error.config
    });
    
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to API server. Please ensure FastAPI is running on http://127.0.0.1:8000');
    } else if (error.response) {
      const message = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
      toast.error(message);
    } else if (error.request) {
      toast.error('No response from server. Please check if the API is running.');
    } else {
      toast.error('Error setting up the request');
    }
    
    return Promise.reject(error);
  }
);

// --- New and updated API functions ---

export const api = {
  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get('/global-earthquake-forecast');
      return response.status === 200 && response.data.forecast !== undefined;
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  },

  // Live USGS data
  async getLiveEarthquakes(): Promise<EarthquakeData[]> {
    try {
      console.log('Fetching USGS data from:', USGS_API_URL);
      const response = await axios.get(USGS_API_URL);
      const features = response.data.features || [];
      
      return features.map((feature: any) => ({
        id: feature.id,
        time: new Date(feature.properties.time),
        place: feature.properties.place,
        magnitude: feature.properties.mag,
        depth: feature.geometry.coordinates[2],
        url: feature.properties.url,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
      }));
    } catch (error) {
      console.error('Failed to fetch USGS data:', error);
      throw error;
    }
  },

  // Count major earthquakes
  async getMajorEventCount(): Promise<number> {
    try {
      const earthquakes = await this.getLiveEarthquakes();
      return earthquakes.filter(eq => eq.magnitude >= 6.0).length;
    } catch (error) {
      console.error('Failed to get major event count:', error);
      return 0;
    }
  },

  // Latency measurement
  async getAPILatency(): Promise<number | null> {
    try {
      const startTime = performance.now();
      await apiClient.get('/global-earthquake-forecast');
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (error) {
      console.error('Failed to measure API latency:', error);
      return null;
    }
  },

  // Global forecast
  async getGlobalForecast(): Promise<ForecastData[]> {
    try {
      const response = await apiClient.get('/global-earthquake-forecast');
      return response.data.forecast || [];
    } catch (error) {
      console.error('Failed to fetch global forecast:', error);
      return [];
    }
  },

  // Text classification
  async classifyText(text: string): Promise<ClassificationResult> {
    const response = await apiClient.post('/classify-tweet', { text });
    return response.data;
  },

  // Risk prediction
  async predictRisk(data: {
    disaster_group: string;
    disaster_subgroup: string;
    disaster_type: string;
    country: string;
    region: string;
    start_year: number;
    start_month: number;
  }): Promise<RiskAssessment> {
    const response = await apiClient.post('/predict-risk', data);
    return response.data;
  },

  // Regional impact prediction
  async predictRegionalImpact(data: {
    event_count: number;
    max_magnitude: number;
    avg_magnitude: number;
  }): Promise<RegionalForecast> {
    const response = await apiClient.post('/predict-regional-impact', data);
    return response.data;
  },

  // Health check
  async pingRoot(): Promise<boolean> {
    try {
      const root = await axios.get(`${API_BASE_URL}/`, {
        timeout: 4000,
        validateStatus: () => true, 
      });
      if (root.status >= 200 && root.status < 300) return true;

      const fallback = await axios.get(`${API_BASE_URL}/global-earthquake-forecast`, {
        timeout: 4000,
        validateStatus: () => true,
      });
      return fallback.status >= 200 && fallback.status < 300;
    } catch {
      return false;
    }
  },

  // ============================================================
  // ⭐ NEW: COMPUTER VISION DAMAGE ANALYSIS ENDPOINT
  // ============================================================
   async analyzeDamageImage(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await apiClient.post('/analyze-damage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('CV Analysis failed:', error);
      throw error;
    }
  },

}
