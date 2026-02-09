# DisasterInsight AI: Project Summary Report

**Version:** 1.0 (Final Release)  
**Author:** MUHAMMAD ZAIN

---

## 1. Project Objective

The primary objective of DisasterInsight AI is to bridge the gap between chaotic data and actionable intelligence during crises. By orchestrating multiple AI disciplines—**Generative AI, Computer Vision, and Predictive Modeling**—into a single platform, we empower responders to see, read, and predict disaster impacts in real-time.

---

## 2. System Architecture

The platform operates on a decoupled microservices architecture:

1.  **Presentation Layer (React):** A modern UI handling complex data visualization and chat interactions.
2.  **Orchestration Layer (FastAPI):** A backend that manages the "Brain" (Agent) and serves specialized inference models.
3.  **Intelligence Layer:** A suite of 5 specialized models and a Vector Database (RAG).

---

## 3. Methodology and Modules

### **M1: Real-Time NLP Classifier**
- **Objective:** Filter social noise to find actionable humanitarian signals.
- **Model:** Fine-tuned **DistilBERT** Transformer.
- **Result:** **74% F1-Score** on multi-class crisis categorization.

### **M2: Static Risk Predictor**
- **Objective:** Quantify the risk of high-fatality events based on historical data.
- **Model:** **XGBoost Classifier** with Scikit-learn pipelines.
- **Result:** **ROC-AUC 0.87** on EMDAT historical dataset.

### **M3: Global Forecasting (Strategic)**
- **Objective:** Establish a baseline for global seismic activity.
- **Model:** **Prophet** Time-Series Model.
- **Result:** Accurate long-term trend analysis with confidence intervals.

### **M4: Regional Forecasting (Tactical)**
- **Objective:** High-precision alerts for specific vulnerable zones (e.g., SE Asia).
- **Model:** Specialized **XGBoost** model trained on regional subsets.
- **Result:** **67% Precision** in predicting high-impact events.

### **M5: Visual Damage Assessment (New)**
- **Objective:** To automate the triage of disaster imagery (photos/drone shots).
- **Model:** **MobileNetV2** (Transfer Learning) converted to **ONNX** for optimized CPU inference.
- **Capability:** Classifies images (Fire, Flood, Building Collapse) and assigns a **Triage Priority (Red/Orange/Green)** automatically.
- **Result:** **91% Accuracy** on the validation set.

### **M6: Agentic RAG System (New)**
- **Objective:** To provide a conversational interface that can "reason" and "retrieve".
- **Architecture:** Powered by **Google Gemini 2.0**. The agent utilizes **Function Calling** to autonomously use the Risk and Forecast models as tools.
- **RAG Implementation:** Uses **ChromaDB** to index official disaster protocol PDFs. When a user asks "What to do during a flood?", the agent retrieves verified guidelines instead of hallucinating.

---

## 4. Limitations

- **M4 Specificity:** The Regional Forecaster is valid only for the 4 trained countries.
- **Static Risk:** M2 does not account for real-time weather changes.
- **RAG Knowledge:** The agent's knowledge is limited to the documents ingested into the `documents/` folder.

---

## 5. Future Improvements

-   **Edge Deployment:** Port the ONNX CV model to a mobile app for offline usage in the field.
-   **Multi-Agent System:** Implement a swarm where one agent monitors news while another plans logistics.
-   **Cloud Native:** Containerize the full stack using Kubernetes (K8s) for auto-scaling.