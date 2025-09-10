---
title: Disaster Insight API
emoji: 🌍
colorFrom: indigo
colorTo: yellow
sdk: docker
pinned: true
license: apache-2.0
short_description: AI API for disaster detection and forecasting.
---

# 🌍 Disaster Insight AI-API

The **Disaster Insight AI API** is a production-ready **FastAPI service** that provides disaster-related insights using state-of-the-art machine learning models.  
It is deployed and live on **Hugging Face Spaces**.

---

## 🚀 Live API

- ✅ **Swagger UI (interactive API docs):**  
  🔗 [zainafxal-disaster-insight-api.hf.space/docs](https://zainafxal-disaster-insight-api.hf.space/docs)

- ✅ **Health check endpoint:**  
  🔗 [zainafxal-disaster-insight-api.hf.space/health](https://zainafxal-disaster-insight-api.hf.space/health)

---

## 📦 Models Available

This API serves **four pre-trained models**:

1. **Tweet Classifier (M1)** – Classifies disaster-related tweets into humanitarian categories. *(Transformers)*  
2. **Static Risk Predictor (M2)** – Assesses disaster event risk based on historical features. *(Scikit-learn / XGBoost)*  
3. **Earthquake Frequency Forecaster (M3)** – Provides long-term global earthquake frequency forecasts. *(Prophet)*  
4. **Regional Impact Forecaster (M4)** – Predicts short-term impact probability for specific regions. *(XGBoost)*  

---

## 📂 Endpoints

- `POST /api/v1/classify-tweet` → Classify tweets into humanitarian categories.  
- `POST /api/v1/predict-risk` → Predict static disaster risk.  
- `GET  /api/v1/global-earthquake-forecast` → Get earthquake frequency forecasts.  
- `POST /api/v1/predict-regional-impact` → Predict next-quarter regional impact probability.  

Full request/response schemas are available in the **Swagger UI**.

---

## 🛠 Tech Stack

- **Framework:** FastAPI + Uvicorn  
- **ML Libraries:** Transformers · PyTorch · Scikit-learn · XGBoost · Prophet  
- **Deployment:** Hugging Face Spaces (Docker)  

---

## ⚠️ Limitations

- Models are trained on specific datasets; predictions should not be used as real-time early warning systems.  
- Forecasts are statistical and **not precise event predictions**.  
- Regional impact forecasting (M4) is valid only for **China, India, Indonesia, and the Philippines**.  

---

📑 **More details:** see [API_SUMMARY.md](./API_SUMMARY.md).
