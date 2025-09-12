# DisasterInsight AI – Dashboard User Guide

**Version:** 1.0  
**Last Updated:** September 12, 2025

---

## 1. Introduction

Welcome to the **DisasterInsight AI** platform! This guide will help you navigate our dashboard and leverage its powerful AI-driven tools for global disaster intelligence. Our mission is to empower emergency responders, NGOs, and analysts with actionable insights, all within a single, interactive interface.

The platform is built on a foundation of:
-   Cutting-edge Natural Language Processing (NLP)
-   Predictive Time-Series Forecasting
-   Machine Learning-based Risk Scoring
-   Real-Time Data Feeds from the USGS
-   A Modern, Responsive React User Interface

---

## 2. Platform Capabilities at a Glance

| Feature                  | Capability                                                                    |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Real-Time Detection**  | AI-powered humanitarian classification of disaster-related text.              |
| **Risk Assessment**      | ML-based risk scoring for user-defined disaster scenarios.                    |
| **Predictive Forecasting** | Strategic global and tactical regional forecasting of earthquake activity.      |
| **Live Earth Monitor**   | Near real-time seismic event monitoring via a direct USGS feed.               |

---

## 3. Dashboard Features & How to Use Them

### 3.1 Home: The Analytics Overview

The home page provides a high-level summary of global activity and platform status.

**At-a-Glance Metrics:**
-   **Major Events (Last 24h):** A count of significant recent events.
-   **Monitored Countries:** The number of countries included in our historical analysis.
-   **Total Records Analyzed:** The total volume of data processed by our models.

**Platform Status:**
-   **System Health:** A live indicator of the backend API's operational status.
-   **Global Coverage:** Confirms the 24/7 monitoring capability.

---

### 3.2 Live Global Earthquake Feed

This module provides a near real-time view of global seismic activity, powered by the USGS.

**Key Features:**
-   **Automatic Updates:** The data feed refreshes automatically every 60 seconds.
-   **Summary Metrics:** Instantly see the total number of recent events, counts of major (M6.0+) and shallow earthquakes.
-   **Interactive Map & Table:** Explore recent events visually on a global map or sort and filter the detailed data table. Each event includes time, location, magnitude, depth, and a direct link to the USGS report.

> **Use Case:** Achieve rapid situational awareness for ongoing global seismic activity and support immediate response coordination.

---

### 3.3 Real-Time Signal Analysis (NLP Classifier)

Triage unstructured text in real time to identify critical humanitarian information.

**AI Model:**
-   Powered by a fine-tuned **DistilBERT** Transformer model.
-   Classifies text into one of **10 humanitarian crisis categories**.

**How to Use:**
1.  Enter any text (e.g., a tweet, news headline, or field report) up to 500 characters into the input box.
2.  Click "Analyze".
3.  The model will return the most likely category with a high-confidence score and an interpretation of the label.
4.  Use the "Try Examples" button for a guided exploration of the model's capabilities.

> **Use Case:** Ideal for social media monitoring, filtering high-volume emergency communications, and performing automated first-line screening of unstructured reports.

---

### 3.4 Event Risk Scenario Planner

Assess the historical risk of a hypothetical disaster event to inform strategic planning.

**AI Model:**
-   An **XGBoost classifier** trained on over 20,000 historical disaster events from the EMDAT database.

**How to Use:**
1.  Use the dropdown menus to define a scenario: select a **Location** (Country/Region), **Disaster Type**, and **Time Period**.
2.  Click "Calculate Risk".
3.  The model will return a precise probability score and a clear risk level (Low, Moderate, High), along with an actionable interpretation.

> **Important Note:** This model is based on historical statistical patterns. It does not account for real-time dynamic factors like current weather, local preparedness, or recent political events.

> **Use Case:** Perfect for "what-if" analysis, strategic resource allocation, and mission readiness planning.

---

### 3.5 Forecasts: Global & Regional

#### Strategic Global Earthquake Forecast

-   **Model:** A **Prophet** time-series model trained on 50+ years of seismic data.
-   **Output:** A multi-year monthly forecast for the expected number of significant (M6.0+) global earthquakes.
-   **Features:** View the forecast with confidence intervals, analyze the long-term trend, and download the forecast data as a CSV for offline analysis.

> **Use Case:** Supports long-term resource planning, helps identify statistically anomalous months, and provides context for global seismic trends.

#### Tactical Regional Impact Forecast

-   **Model:** A specialized **XGBoost** model trained specifically on four high-risk countries: **China, India, Indonesia, and the Philippines**.
-   **Input:** Use the sliders to input the current quarter's seismic activity (event count, max/avg magnitude).
-   **Output:** A probability (%) of a fatal earthquake occurring in the *next* quarter.

> **Critical Limitations:** This model is a high-precision, low-recall system. An alert is a high-confidence signal, but a "safe" forecast does not guarantee safety. **Do not use for other regions.**

> **Use Case:** Enables targeted, high-consequence preparedness and heightened monitoring for the four focus countries.

---

## 4. Getting the Most Out of DisasterInsight AI

-   **Combine Tools:** Use the real-time tools (Live Feed, NLP) for immediate triage and the planners/forecasts for strategic decision-making.
-   **Understand the Outputs:** All model outputs are probabilistic forecasts based on historical data, not deterministic predictions of the future.
-   **Stay Updated:** Use the time controls and refresh buttons to ensure you are viewing the most current data.

---

## 5. Troubleshooting & Support

-   **Slow Loading:** If a feature is slow to load, please wait a moment and refresh the page. The free Hugging Face Spaces servers may "sleep" during periods of inactivity and take a moment to wake up.
-   **Model Errors:** If you encounter a model error, it may be due to temporary backend issues. Please try your request again in a minute.
-   **Feedback & Bug Reports:** For any issues or feature suggestions, please open an issue on our [**GitHub repository**](https://github.com/zainafxal/DisasterInsight-AI).

---

## 6. Data, Licensing, and Responsible AI

-   **Data Sources:** Our models are trained on data from CrisesNLP, HumAID, EMDAT, and Kaggle. The live feed is from the USGS. All sources are used in accordance with their original licensing terms.
-   **Responsible Use:** This platform is a decision-support tool. Always combine its outputs with human judgment, official alerts, and local expertise.
-   **License:** The DisasterInsight AI platform source code is licensed under **Apache 2.0**.