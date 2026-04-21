<h1 align="center">🌍 DisasterInsight AI - Backend API</h1>

<p align="center">
  The official backend service for the <strong>DisasterInsight AI Platform</strong>.
  <br />
  A production-ready FastAPI service that provides disaster-related insights using four distinct machine learning models.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-FastAPI-green?style=for-the-badge&logo=fastapi" alt="FastAPI Badge"/>
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge" alt="License Badge"/>
</p>


## 🚀 Live API


- ✅ **Swagger UI (interactive API docs):**  
  🔗 [zainafxal-disaster-insight-api.hf.space/docs](https://zainafxal-disaster-insight-api.hf.space/docs)


- ✅ **Health check endpoint:**  
  🔗 [zainafxal-disaster-insight-api.hf.space/health](https://zainafxal-disaster-insight-api.hf.space/health)


---

## 🛠️ Getting Started: Running Locally

Follow these instructions to get the API server up and running on your local machine for development. The required AI models are already included in this repository.

### **Prerequisites**

*   Git
*   [Conda](https://docs.conda.io/en/latest/miniconda.html) (Recommended) or Python 3.9+ with `venv`

### **1. Clone the Repository**

First, clone the entire project repository (if you haven't already) and navigate into this API directory.

```bash
git clone https://github.com/zainafxal/DisasterInsight-AI.git
cd DisasterInsight-AI/disaster-insight-api
```

### **2. Set Up the Environment**

You can use either Conda (recommended for handling complex ML dependencies) or `Pip`.

#### **Option A (Recommended):** Using Conda

Create and activate the Conda environment from the provided YAML file. This will install all dependencies, including PyTorch.

```bash
# Create the environment
conda env create -f environment.yml

# Create Environment File
cp .env.example .env
# Open .env and add your GOOGLE_API_KEY

# Activate the environment
conda activate disaster-insight-api-env
```

#### **Option B:** Using Pip and a Virtual Environment

If you prefer not to use Conda, you can use venv and pip.

```bash
# Create a virtual environment
python -m venv venv

# Create Environment File
cp .env.example .env
# Open .env and add your GOOGLE_API_KEY

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
```

### **3. Run the API Server**

Once the environment is activated, start the Uvicorn server:

```bash
uvicorn main:app --reload

# or you can run main.py file in root directory (disaster-insight-api)
```


The API will now be running locally.

*   🚀 **API URL:** http://127.0.0.1:8000
    
*   📚 **Interactive Docs:** http://127.0.0.1:8000/docs

---

The core inference engine powering the platform. This FastAPI service orchestrates **5 AI Models** and handles the **Agentic RAG** workflow.

## 🚀 Key Capabilities

This is not just a CRUD API. It is a complex **AI Orchestration Layer** capable of:

*   **🤖 Agentic Workflow:** Integrates **Google Gemini 2.0** with custom tools (Risk Models, Forecasting, Knowledge Base) to answer complex queries.
*   **👁️ Computer Vision:** Runs high-performance **ONNX inference** to classify disaster imagery and assign triage priority.
*   **📚 RAG Pipeline:** Automatically ingests safety protocols (PDFs) into **ChromaDB** on startup for context-aware answers.
*   **⚡ Optimization:** Uses LRU Caching for models and Async endpoints for high concurrency.

---

## 📦 Models Served

This API serves five distinct, pre-trained models:

1.  **Tweet Classifier (M1):** Classifies text into 10 humanitarian categories. **(Transformers/DistilBERT)**
2.  **Static Risk Predictor (M2):** Assesses event risk based on historical features. **(XGBoost)**
3.  **Earthquake Forecaster (M3):** Long-term global frequency forecasting. **(Prophet)**
4.  **Regional Impact Model (M4):** Short-term high-impact probability for specific zones. **(XGBoost)**
5.  **Visual Damage Assessor (M5):** Classifies disaster images (Fire/Flood/Damage) for triage. **(MobileNetV2 via ONNX)**

---

## 📂 API Endpoints Summary

*   `POST /api/v1/classify-tweet`: Classifies a single tweet.
*   `POST /api/v1/predict-risk`: Predicts the static risk of a disaster event.
*   `GET  /api/v1/global-earthquake-forecast`: Retrieves the global earthquake frequency forecast.
*   `POST /api/v1/predict-regional-impact`: Forecasts next-quarter impact probability for specific high-risk regions.
*   `POST /api/v1/analyze-damage`: Computer Vision image analysis.

**Agent & RAG :**

*   `POST /api/v1/chat/ask`: Send message to the Multimodal Agent.
*   `POST /api/v1/chat/ingest-docs`: Trigger manual PDF ingestion into Vector DB.

*Full request and response schemas are available in the Swagger UI.*

---

## 🛠 Tech Stack

*   **Framework:** FastAPI, Uvicorn
*   **GenAI & RAG:** Google Generative AI SDK, LangChain concepts, ChromaDB
*   **ML Libraries:** PyTorch, Scikit-learn, XGBoost, Prophet, ONNX Runtime
*   **Utilities:** Pydantic, Python-Multipart

---

## 👨‍💻 About the Creator

**Muhammad Zain**  
*Data Scientist | AI Engineer | Applied ML Developer | LLM Developer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zainafxal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/zainafxal)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/zainafxal)
[![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/zainafxal)
[![Hugging Face](https://img.shields.io/badge/HuggingFace-FFD21F?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/zainafxal)

---

## ⚠️ Limitations

*   The models are trained on specific historical datasets and should not be used as a replacement for official emergency services.
*   Forecasts are statistical probabilities, not deterministic predictions of specific events.
*   The Regional Impact Forecaster (M4) is only validated for **China, India, Indonesia, and the Philippines**.

---

📑 For more detailed technical information, see [API_SUMMARY.md](./API_SUMMARY.md).