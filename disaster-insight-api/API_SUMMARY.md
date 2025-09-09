# **API Technical Summary**

This document provides a detailed technical overview of the models, data schemas, and limitations of the **Disaster Insight AI API**.

## 📦 Models Used

This API serves four distinct, pre-trained models. All model files must be placed in the `/models` directory.

| Model ID | Notebook Source                       | Model Format(s)                     | Purpose                                                              |
|----------|--------------------------------------|-------------------------------------|----------------------------------------------------------------------|
| M1       | 01_disaster_tweet_classification     | Hugging Face Transformers           | Real-time text classification into 10 humanitarian categories.      |
| M2       | 02_disaster_risk_prediction           | joblib (Scikit-learn Pipeline)     | Static risk assessment of a disaster event based on its features.   |
| M3       | 03_earthquake_frequency_forecasting   | json (Prophet Model) & .csv        | Strategic long-term global forecast of earthquake frequency.         |
| M4       | 04_regional_impact_forecasting        | joblib (XGBoost Model)             | Tactical forecast of next-quarter impact probability for specific regions. |

## 📂 Input Schemas & 🎯 Output Formats

All interactions with the API are via JSON. The API enforces strict data validation using Pydantic.

### Endpoint: `/api/v1/classify-tweet`
-   **Input (`TweetClassificationRequest`):**
    ```json
    {
      "text": "Just felt a huge earthquake in Tokyo, so scary!"
    }
    ```
-   **Output (`TweetClassificationResponse`):**
    ```json
    {
      "label": "sympathy_and_support",
      "score": 0.987
    }
    ```

### Endpoint: `/api/v1/predict-risk`
-   **Input (`StaticRiskRequest`):**
    ```json
    {
      "disaster_group": "Natural",
      "disaster_subgroup": "Hydrological",
      "disaster_type": "Flood",
      "country": "Pakistan",
      "region": "Asia",
      "start_year": 2022,
      "start_month": 8
    }
    ```
-   **Output (`StaticRiskResponse`):**
    ```json
    {
      "high_risk_probability": 0.854
    }
    ```
    *(Note: Probability is a float between 0.0 and 1.0)*

### Endpoint: `/api/v1/global-earthquake-forecast`
-   **Input:** None (GET request)
-   **Output (`GlobalForecastResponse`):** A JSON object containing a list of forecast items.
    ```json
    {
      "forecast": [
        {
          "ds": "2021-08-31",
          "yhat": 14.89,
          "yhat_lower": 8.04,
          "yhat_upper": 22.05
        },
        // ... more forecast items
      ]
    }
    ```

### Endpoint: `/api/v1/predict-regional-impact`
-   **Input (`RegionalImpactRequest`):**
    ```json
    {
      "event_count": 5,
      "max_magnitude": 6.8,
      "avg_magnitude": 5.5
    }
    ```
-   **Output (`RegionalImpactResponse`):**
    ```json
    {
      "high_impact_probability": 0.672
    }
    ```

---

## 🛠 Key Dependencies & Frameworks

-   **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) for high performance and automatic documentation.
-   **Server:** [Uvicorn](https://www.uvicorn.org/) as the ASGI server.
-   **Data Validation:** [Pydantic](https://pydantic-docs.helpmanual.io/) for robust schema enforcement.
-   **AI/ML Libraries:** `Transformers`, `PyTorch`, `Scikit-learn`, `XGBoost`, `Prophet`.

---

## ⚠️ Limitations & Responsible Use

- **M1 (NLP Classifier):** Primarily trained on English text. Not a "fake news" detector.
  
- **M2 (Static Risk):** Based on historical data; cannot account for real-time dynamic factors. "Risk" is simplified to a binary label based on fatalities.
  
- **M3 (Global Forecast):** Provides a global statistical baseline only. It is not a tool for predicting specific earthquake times, locations, or magnitudes. The model was trained on post-1970 data due to technical constraints with historical timestamp serialization.
  
- **M4 (Regional Forecast):** This model is a specialist and is only valid for **China, India, Indonesia, and the Philippines**. Its predictions should not be used for any other region. It is also a high-precision, low-recall model, meaning it will miss some risky periods.