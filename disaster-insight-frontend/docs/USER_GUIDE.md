# DisasterInsight AI – Dashboard User Guide

**Version:** 1.0  
**Last Updated:** 2026

---

## 1. Introduction

Welcome to the **DisasterInsight AI** platform. This guide will help you navigate the dashboard and leverage its powerful AI-driven tools for global disaster intelligence.

The platform unifies **5 distinct AI capabilities** into a single interface:
1.  **AI Chat Assistant (Agentic RAG)**
2.  **Visual Damage Assessment (Computer Vision)**
3.  **Real-Time Signal Analysis (NLP)**
4.  **Risk & Forecasting Models (ML)**
5.  **Live Global Monitoring**

---

## 2. Feature Walkthrough

### 2.1 The Multimodal AI Chat Assistant (New!)

The floating chat bubble in the bottom-right corner is your gateway to the **AI Agent**.

**Capabilities:**
*   **Ask Questions:** Ask about safety protocols (e.g., "What should I do during an earthquake?"). The agent searches verified PDF documents (RAG) to give you accurate answers.
*   **Analyze Images:** Click the **Camera/Upload Icon** inside the chat to upload a photo of a disaster scene. The agent will use Computer Vision to detect the damage type and provide specific advice.
*   **Data Queries:** You can ask "What is the global earthquake forecast?" and the agent will call the backend Prophet model to fetch the data for you.

---

### 2.2 Visual Damage Assessment (New!)

Located in the **"Damage Assessment"** tab, this tool automates the triage of disaster imagery.

**How to Use:**
1.  **Upload:** Drag & drop an image (Drone shot, CCTV, or smartphone photo) into the drop zone.
2.  **Analyze:** Click "Run Damage Analysis".
3.  **Results:** The AI (MobileNetV2) will detect the event type (e.g., *Flood Water*, *Fire/Smoke*, *Building Collapse*).
4.  **Triage:** The system automatically assigns a **Priority Level** (Red, Orange, Green) and recommends an action (e.g., "Dispatch Rescue Team").

---

### 2.3 Live Global Earthquake Feed

This module provides a near real-time view of global seismic activity, powered by the USGS.

*   **Auto-Refresh:** Data updates every 60 seconds.
*   **Map & Table:** View events on the interactive map or sort them in the table below.
*   **Download:** You can export the current data view as CSV or JSON for offline analysis.

---

### 2.4 Real-Time Signal Analysis (NLP)

Triage unstructured text to identify critical humanitarian information.

**How to Use:**
1.  Enter text (e.g., a tweet, news headline, or field report) into the input box.
2.  Click "Analyze".
3.  The **DistilBERT** model classifies the text into one of 10 categories (e.g., *Medical Help*, *Shelter*, *Infrastructure Damage*).

---

### 2.5 Event Risk Scenario Planner

Assess the historical risk of a hypothetical disaster event.

**How to Use:**
1.  Use the **Stepper Form** to define a scenario: Select Location, Disaster Type, and Time Period.
2.  Click "Assess Risk".
3.  The **XGBoost** model returns a probability score and risk level based on 50 years of historical data.

---

### 2.6 Forecasts: Global & Regional

*   **Global Forecast:** View the long-term trend of earthquake frequency. The chart includes confidence intervals (shaded areas) to show the range of uncertainty.
*   **Regional Impact:** A tactical tool for **China, India, Indonesia, and Philippines**. Adjust the sliders for current seismic activity to predict the probability of a high-fatality event in the next quarter.

---

## 3. Best Practices

*   **Use the Agent:** If you are unsure where to find information, simply ask the Chat Assistant. It connects all parts of the platform.
*   **Combine Tools:** Use the *Visual Assessment* to confirm damage reports found via *Signal Analysis*.
*   **Verify:** While the AI is highly accurate, always cross-reference critical alerts with official local authorities.

---

## 4. Troubleshooting

*   **Model Loading:** The first time you run an analysis after starting the server, it might take a few seconds to load the model into memory. Subsequent requests will be instant.
*   **Chat Errors:** If the chat agent says "I cannot connect," ensure your `GOOGLE_API_KEY` is correctly set in the backend `.env` file.

---

## 5. Responsible AI

*   **Data Privacy:** Images uploaded for analysis are processed locally (or on the server) and are not stored permanently for training.
*   **Limitations:** The Regional Forecaster is valid *only* for the 4 specific countries mentioned. Do not use it for other regions.