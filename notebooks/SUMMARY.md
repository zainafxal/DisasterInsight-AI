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
  5. Rigorously evaluates the forecast using time-series cross-validation, yielding a reliable **Mean Absolute Error (MAE)** of **[UPDATE THIS VALUE]** earthquakes/month.

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