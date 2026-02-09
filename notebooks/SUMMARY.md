## AI Model Development: Notebooks Summary

This directory contains the Jupyter notebooks detailing the end-to-end development of the core AI and Machine Learning models for the **Disaster Insight AI** platform. Each notebook is a self-contained module that handles a specific data science task, from data ingestion and cleaning to model training, evaluation, and serialization.

The workflow is designed to be sequential, with each notebook producing a model or analysis that serves a distinct function within the final web application.

### 1. 01_disaster_tweet_classification.ipynb

- **Purpose:** To build the platform's foundational real-time detection engine. This model filters unstructured text (e.g., social media posts) to identify relevant disaster information and classify it into specific humanitarian categories.
- **Workflow:**
  - Loads and merges the CrisesNLP and HumanAid text datasets.
  - Performs extensive data cleaning, EDA, and label harmonization.
  - Fine-tunes a DistilBERT Transformer model for multi-class text classification.
  - Evaluates the model on a separate, unseen benchmark dataset, achieving a respectable performance on a noisy, 10-class problem.
- **Key Output:** A saved, fine-tuned NLP model and tokenizer located in `models/01_disaster_tweet_classifier/`.

### 2. 02_disaster_risk_prediction.ipynb

- **Purpose:** To develop a static risk assessment model. This model predicts the likelihood of a disaster event becoming a "high-impact" incident based on its core, static characteristics.
- **Workflow:**
  - Loads the comprehensive, tabular EMDAT global disaster database.
  - Performs significant data cleaning and feature engineering, including the creation of a binary `high_risk_label` based on fatality counts.
  - Trains a powerful XGBoost Classifier on the structured data.
  - Evaluates the model, achieving an excellent **86.7% ROC-AUC score**, and generates an explainable feature importance analysis.
- **Key Output:** A saved, end-to-end Scikit-learn pipeline (preprocessor + model) located in `models/02_disaster_risk_predictor/xgb_risk_prediction_pipeline.joblib`.

### 3. 03_earthquake_frequency_forecasting.ipynb

- **Purpose:** To create a strategic, global baseline forecast for seismic activity. This model provides a long-term outlook on the expected frequency of significant earthquakes, allowing for the identification of anomalous periods.

- **Workflow:**
  1. Loads a historical earthquake dataset and cleans the raw data.
  2. Filters the dataset to begin from **1970-01-01** to ensure model serialization is compatible across all operating systems.
  3. Engineers a time-series target by filtering for significant earthquakes (Magnitude >= 6.0) and aggregating their counts monthly.
  4. Trains a **Prophet** time-series model to capture long-term trends and seasonality.
  5. Rigorously evaluates the forecast using time-series cross-validation, yielding a reliable **Mean Absolute Error (MAE)** of **4.33** earthquakes/month.

- **Key Output:** A saved Prophet model (.json) and its corresponding forecast data (.csv) located in `models/03_earthquake_forecaster/`.

### 4. 04_regional_impact_forecasting.ipynb

- **Purpose:** To build an advanced, tactical forecasting model that predicts near-term risk for specific, high-vulnerability regions. This is the most proactive analytical component of the platform.
- **Workflow:**
  - Loads the EMDAT dataset and filters it to focus on four high-risk countries: **China, India, Indonesia, and the Philippines**.
  - Performs advanced time-series feature engineering, creating quarterly summaries of seismic activity.
  - Creates a "lead" target variable to predict the probability of a fatal earthquake in the next quarter based on the current quarter's data.
  - Trains an XGBoost Classifier on this chronologically-structured data.
  - Evaluates the model on the most recent data, demonstrating its function as a high-precision (though low-recall) "alarm system."
- **Key Output:** A saved, specialized XGBoost model for tactical forecasting located in `models/04_regional_impact_forecaster/xgb_regional_impact_forecaster.joblib`.


### 5. 05_disaster_visual_intelligence.ipynb

- **Purpose:** To implement the platform’s computer vision–based visual intelligence module. This model provides physical confirmation of disaster events from images, categorizes the type and severity of damage, and converts predictions into actionable triage priorities for downstream agents and responders.

- **Workflow:**
  - Sets up a TensorFlow/Keras training environment with GPU acceleration and a standardized 224×224 RGB input shape.
  - Loads a curated, class-balanced dataset of **2,000** post-disaster images (400 per class) across five categories:
    - `0_no_damage`
    - `1_flood_water`
    - `2_fire_smoke`
    - `3_damage_minor`
    - `4_damage_major`
  - Builds an image preprocessing and augmentation pipeline using `ImageDataGenerator`, including rescaling, rotation, shifts, shear, zoom, and horizontal flips, with an **80/20 train–validation split**.
  - Trains and compares two architectures:
    - **Model A:** A custom CNN baseline trained from scratch.
    - **Model B:** A MobileNetV2 transfer-learning model (ImageNet weights, frozen base with a custom classification head).
  - Selects **Model B (MobileNetV2)** as the production model based on markedly better validation performance (≈**94% accuracy**) and more stable training behavior.
  - Performs detailed evaluation using a **classification report** and **confusion matrix**, confirming high per-class precision/recall and strong separation between critical classes (e.g., Fire vs Flood vs Major Damage).
  - Implements a **triage logic layer** that maps predicted classes to operational priorities and actions:
    - `4_damage_major`, `2_fire_smoke` → **CRITICAL (RED)** – Search & Rescue / Fire & Hazmat.
    - `1_flood_water` → **HIGH (ORANGE)** – Evacuation and utilities shutdown.
    - `3_damage_minor` → **MEDIUM (YELLOW)** – Engineering inspection.
    - `0_no_damage` → **LOW (GREEN)** – Safe route logging.
  - Creates an end-to-end **inference and triage function** that:
    - Accepts a user-uploaded image.
    - Runs the trained MobileNetV2 model to predict the damage class and confidence.
    - Returns a human-readable **“Incident Triage Report”** including priority level, recommended action, and a protocol query string for use by the project’s LLM/RAG tools.
  - Exports the final model in multiple formats (TensorFlow SavedModel, `.h5`, and modern `.keras`) and saves a `class_indices.json` file that preserves the mapping from numeric class IDs to human-readable labels for use in the FastAPI backend.

- **Key Output:** A production-ready MobileNetV2-based disaster image classification and triage model (SavedModel directory, `.keras` and `.h5` files) plus its `class_indices.json` label mapping, stored under `models/05_disaster_visual_intelligence/`.