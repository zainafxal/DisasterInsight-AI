<h1 align="center">🌍 DisasterInsight AI - Backend API</h1>

<p align="center">
  The official backend service for the <strong>DisasterInsight AI Platform</strong>.
  <br />
  A production-ready FastAPI service that provides disaster-related insights using four distinct machine learning models.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-FastAPI-green?style=for-the-badge&logo=fastapi" alt="FastAPI Badge"/>
  <a href="https://huggingface.co/spaces/zainafxal/disaster-insight-api"><img src="https://img.shields.io/badge/Deployment-Hugging_Face-yellow?style=for-the-badge&logo=huggingface" alt="Hugging Face Deployment"/></a>
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge" alt="License Badge"/>
</p>

---

## 🚀 Live API Endpoints

This API is deployed and live on **Hugging Face Spaces**.

*   **Swagger UI (Interactive Docs):**  
    [**https://zainafxal-disaster-insight-api.hf.space/docs**](https://zainafxal-disaster-insight-api.hf.space/docs)

*   **Health Check Endpoint:**  
    [**https://zainafxal-disaster-insight-api.hf.space/health**](https://zainafxal-disaster-insight-api.hf.space/health)

---

## 🖥️ Frontend Application

This API serves as the backend for the official DisasterInsight AI web application, which is also live.

> **Visit the Live Web App:** [**https://huggingface.co/spaces/zainafxal/disaster-insight-webapp**](https://huggingface.co/spaces/zainafxal/disaster-insight-webapp)

---

## 🛠️ Getting Started: Running Locally

Follow these instructions to get the API server up and running on your local machine for development. The required AI models are already included in this repository.

### **Prerequisites**

*   Git
*   [Conda](https://docs.conda.io/en/latest/miniconda.html) (Recommended) or Python 3.9+ with `venv`

### **1. Clone the Repository**

First, clone the entire project repository (if you haven't already) and navigate into this API directory.

```bash
git clone https://github.com/your-username/DisasterInsight-AI.git
cd DisasterInsight-AI/disaster-insight-api
```

### **2. Set Up the Environment**

You can use either Conda (recommended for handling complex ML dependencies) or `Pip`.

#### **Option A (Recommended):** Using Conda

Create and activate the Conda environment from the provided YAML file. This will install all dependencies, including PyTorch.

```bash
# Create the environment
conda env create -f environment.yml

# Activate the environment
conda activate disaster-insight-api-env
```

#### **Option B:** Using Pip and a Virtual Environment

If you prefer not to use Conda, you can use venv and pip.

```bash
# Create a virtual environment
python -m venv venv

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

## 📦 Models Served

This API provides access to four pre-trained models:

1.  **Tweet Classifier (M1):** Classifies disaster-related tweets into humanitarian categories. *(Built with Transformers)*
2.  **Static Risk Predictor (M2):** Assesses disaster event risk based on historical features. *(Built with Scikit-learn / XGBoost)*
3.  **Earthquake Frequency Forecaster (M3):** Provides long-term global earthquake frequency forecasts. *(Built with Prophet)*
4.  **Regional Impact Forecaster (M4):** Predicts short-term impact probability for specific regions. *(Built with XGBoost)*

---

## 📂 API Endpoints Summary

*   `POST /api/v1/classify-tweet`: Classifies a single tweet.
*   `POST /api/v1/predict-risk`: Predicts the static risk of a disaster event.
*   `GET  /api/v1/global-earthquake-forecast`: Retrieves the global earthquake frequency forecast.
*   `POST /api/v1/predict-regional-impact`: Forecasts next-quarter impact probability for specific high-risk regions.

*Full request and response schemas are available in the Swagger UI.*

---

## 🛠 Tech Stack

*   **Framework:** FastAPI, Uvicorn
*   **ML Libraries:** Transformers, PyTorch, Scikit-learn, XGBoost, Prophet
*   **Deployment:** Hugging Face Spaces (via Docker)

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