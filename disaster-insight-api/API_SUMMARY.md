# **API Technical Summary**

This document provides a technical overview of the models, data schemas, and endpoints of the **DisasterInsight AI API**.

## 📦 Models Served

| Model ID | Type | Technology | Purpose |
| :--- | :--- | :--- | :--- |
| **M1** | NLP | Transformers | Classify text into humanitarian categories. |
| **M2** | ML | XGBoost | Predict static risk based on location/type. |
| **M3** | Time-Series | Prophet | Forecast global earthquake frequency. |
| **M4** | ML | XGBoost | Forecast regional impact probability. |
| **M5** | CV | **ONNX / MobileNet** | **(New)** Analyze images for damage & triage. |

---

## 📂 API Endpoints Summary

### 🧠 Agent & RAG (New)

#### `POST /api/v1/chat/ask`
Interact with the multimodal agent.
*   **Input:** `{"message": "What is the flood risk in Pakistan?"}`
*   **Logic:** The Agent decides whether to call the **Risk Model Tool**, search the **Vector DB**, or answer directly.
*   **Output:** `{"response": "Based on historical data, the risk is High..."}`

#### `POST /api/v1/analyze-damage`
Submit an image for computer vision analysis.
*   **Input:** Multipart File (Image).
*   **Output:**
    ```json
    {
      "detected_event": "1_flood_water",
      "confidence": 0.98,
      "triage_priority": "HIGH (ORANGE)",
      "action_recommendation": "Utilities Shutdown & Boat Rescue"
    }
    ```

---

### 📊 Predictive & Analytical Endpoints

#### `POST /api/v1/classify-tweet`
*   **Input:** `{"text": "Emergency! Building collapsed."}`
*   **Output:** `{"label": "infrastructure_damage", "score": 0.99}`

#### `POST /api/v1/predict-risk`
*   **Input:** Disaster parameters (Country, Type, Year).
*   **Output:** High-risk probability score (0.0 - 1.0).

#### `GET /api/v1/global-earthquake-forecast`
*   **Output:** Time-series data points with `yhat` (forecast), `lower`, and `upper` bounds.

#### `POST /api/v1/predict-regional-impact`
*   **Input:** Quarterly seismic stats (Event count, Max magnitude).
*   **Output:** Probability of a fatal event in the next quarter.

---

## 🛠 Key Dependencies

-   **Orchestration:** FastAPI, Uvicorn
-   **Generative AI:** Google-GenerativeAI, LangChain (Concepts)
-   **Vector DB:** ChromaDB
-   **Inference:** ONNX Runtime, PyTorch, Scikit-learn

## ⚠️ Limitations

-   **M4 (Regional):** Valid only for China, India, Indonesia, Philippines.
-   **M5 (Vision):** Performance depends on image clarity. Trained on aerial/ground disaster datasets.