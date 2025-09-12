# DisasterInsight AI: Project Summary Report

**Version:** 1.0  
**Date:** 23-August-2025  
**Author:** MUHAMMAD ZAIN

---

## 1. Project Objective

The primary objective of the DisasterInsight AI project was to design, build, and deploy a full-stack, end-to-end platform for global disaster analytics. The platform aims to transform chaotic, high-volume data streams into actionable intelligence for emergency responders, NGOs, and strategic planners by leveraging a suite of specialized AI models. The system provides a three-tiered intelligence capability: real-time detection, predictive risk assessment, and strategic forecasting.

---

## 2. System Architecture

The platform operates on a modern, decoupled three-tier architecture:

1.  **React Frontend:** A professional, responsive user interface that serves as the main entry point for users. It visualizes data and allows interaction with the models.
2.  **FastAPI Backend:** A high-performance Python backend that loads the trained AI models and exposes their functionality through a versioned REST API.
3.  **AI/ML Models:** Four distinct, serialized models that form the intelligent core of the platform.

```text
+------------------------+      +---------------------------+      +--------------------------+
|                        |      |                           |      |                          |
|   React Frontend       | ---> |     FastAPI Backend       | ---> |    4x AI / ML Models     |
| (on Hugging Face)      |      |   (on Hugging Face)       |      | (Transformers, XGBoost...) |
|                        |      |                           |      |                          |
+------------------------+      +---------------------------+      +--------------------------+
```
---

## 3. Methodology and Modules

Four core analytical modules were developed to power the platform.


### **M1: Real-Time NLP Disaster Tweet Classifier**

- **Objective:**  
  To filter and classify unstructured social media text into 10 distinct humanitarian categories.

- **Data Sources:**  
  CrisesNLP, HumanAid, and CrisisBench datasets, which were harmonized into a unified schema.

- **Modeling Approach:**  
  A pre-trained `distilbert-base-uncased` Transformer model was fine-tuned on the combined text corpus for multi-class text classification.

- **Key Results:**  
  The model achieved a **74% Weighted F1-Score** on the unseen benchmark dataset, demonstrating strong performance in noise filtration (`not_humanitarian` class) and identifying key event types.

---

### **M2: Static Disaster Risk Predictor**

- **Objective:**  
  To predict the probability of a disaster event becoming a "high-impact" incident (defined as >10 fatalities) based on its static characteristics.

- **Data Source:**  
  The EMDAT International Disaster Database.

- **Modeling Approach:**  
  An XGBoost Classifier was trained on a structured dataset with features like `Country`, `Region`, and `Disaster Type`.  
  The model was encapsulated in a `Scikit-learn` pipeline for reproducible preprocessing.

- **Key Results:**  
  The model achieved an excellent **ROC-AUC score of 0.87**, indicating a strong ability to distinguish between high and low-risk events.  
  Feature importance analysis revealed that **Disaster Group** and specific geographic regions were the most significant predictors.

---

### **M3: Global Earthquake Frequency Forecaster**

- **Objective:**  
  To provide a strategic, long-term forecast of the global monthly frequency of significant earthquakes (Magnitude ≥ 6.0), establishing a baseline for anomaly detection.

- **Data Source:**  
  The USGS Earthquake Database (1970–2016).

- **Modeling Approach:**  
  A time-series forecasting model was built using Meta's **Prophet** library to capture long-term trends and yearly seasonality.

- **Key Results:**  
  Rigorous time-series cross-validation yielded a **Mean Absolute Error (MAE)** of approximately **4.3 earthquakes per month**, providing a reliable error margin for the forecast.

---

### **M4: Tactical Regional Impact Forecaster**

- **Objective:**  
  To predict the near-term (next quarter) probability of a fatal earthquake in four specific high-risk countries (**China, India, Indonesia, Philippines**).

- **Data Source:**  
  Filtered earthquake events from the EMDAT database.

- **Modeling Approach:**  
  Advanced time-series feature engineering was used to create a quarterly summary of seismic activity.  
  An XGBoost Classifier was trained using a chronological split to predict the outcome in the subsequent quarter.

- **Key Results:**  
  The model functions as a **high-precision alarm**, achieving **67% Precision** on the "High-Impact Event" class — meaning it is correct two out of three times when raising an alert.

---

## 4. Limitations and Challenges

- **Data Dependency:**  
  Model performance is inherently tied to the quality and scope of the training data. Models may not generalize well to regions or disaster types not well-represented in the source datasets.

- **Model Specificity:**  
  The M4 Regional Forecaster is highly specialized and valid only for the four countries it was trained on.

- **NLP Scope:**  
  The M1 NLP model is **not** a misinformation or "fake news" detector and is primarily trained on English text.

- **Static vs. Dynamic Risk:**  
  The M2 Risk Predictor uses **static, historical data** and cannot account for dynamic, real-time variables such as weather or preparedness levels.

---

## 5. Future Improvements

- **Enhance NLP Model:**  
  Retrain the M1 classifier to improve recall on under-represented but critical classes like `requests_or_needs`.

- **Incorporate Dynamic Data:**  
  Augment the M2 Risk Predictor with live data (e.g., **weather APIs**, **population density**) for improved real-time assessments.

- **Expand Forecasting:**  
  Develop additional M3-style models for other recurring disaster types (e.g., **hurricanes**, **floods**).

- **Cloud Deployment:**  
  Migrate from **Hugging Face Spaces** to a scalable cloud provider like **AWS** or **Google Cloud** for better performance, reliability, and MLOps capabilities.
