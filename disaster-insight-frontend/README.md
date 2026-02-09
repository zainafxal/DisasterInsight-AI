<p align="center">
  <picture>
    <source srcset="./src/assets/logos/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <img src="./src/assets/logos/logo-light.svg" alt="DisasterInsight AI Logo" width="150">
  </picture>
</p>




<h1 align="center">DisasterInsight AI - Frontend Interface</h1>

<p align="center">
  <strong>The official web interface for the DisasterInsight AI Platform.</strong>
  <br />
  A responsive, production-grade web application built with React, designed to transform complex AI-driven predictions into intuitive, actionable insights.
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Framework-React-blue?style=for-the-badge&logo=react" alt="React Badge"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" alt="FastAPI Badge"/>
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge" alt="License Badge"/>
</p>

---

## 📖 Documentation

For a detailed walkthrough of all dashboard features and best practices for using the platform, please see our comprehensive guide.

> ➡️ **[View the Dashboard User Guide](./docs/USER_GUIDE.md)**

---

## ✨ Key Features

This application connects to the backend API to provide a unified disaster intelligence dashboard:

*   **🤖 Multimodal AI Agent:** A chat interface where users can upload images for analysis or ask questions. The agent uses **RAG** to retrieve verified safety protocols.
*   **👁️ Visual Damage Assessment:** Upload drone/satellite imagery to detect damage type (Fire, Flood, Collapse) and get automated triage priorities.
*   **🌐 Real-Time Tweet Analysis:** Classify social media posts into 10 distinct humanitarian categories.
*   **📈 Predictive Risk Planner:** interactive forms to assess the potential severity of hypothetical disaster events.
*   **📊 Interactive Forecasts:** Visualize global seismic trends with confidence intervals using Recharts.
*   **📡 Live Global Monitoring:** Real-time earthquake feed via USGS integration with map visualization.

---

## 🏗️ Architecture: A Decoupled System

DisasterInsight AI operates on a modern, decoupled three-tier architecture. This frontend is the presentation layer, communicating with a dedicated backend service that handles all complex processing.

```text
+----------------+      +---------------------------+      +-----------------------+
|                |      |                           |      |                       |
|   React User   | ---> |     FastAPI Backend       | ---> |  AI Models / Ai Agents|
|   Interface    |      |    (Local: Port 8000)     |      |  (Gemini, ONNX, etc.) |
|                |      |                           |      |                       |
+----------------+      +---------------------------+      +-----------------------+
This decoupled approach ensures scalability and maintainability. The frontend handles all user interactions and data visualization, while the backend manages the heavy lifting of AI model inference.
```

---

## 🛠️ Getting Started: Running Locally

Follow these instructions to get the frontend up and running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or newer)
*   `npm` or `yarn` package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zainafzal/disaster-insight-frontend.git
    cd disaster-insight-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    This application needs to know the URL of the backend API. Create a new file in the root directory named `.env`.

    ```bash
    # Points to your local FastAPI server
    VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1

    # USGS Feed (External)
    VITE_USGS_API_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson
    ```

4.  **Run the application:**
    ```bash
    npm start
    # or
    yarn start
    ```

The application should now be running at `http://localhost:3000`.

---

## 💻 Tech Stack

### Frontend
*   **Framework:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS / Material-UI / etc.]
*   **Data Visualization:** [Chart.js / D3.js / etc.]
*   **API Client:** [Axios / Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### Backend
*   The backend is a separate [FastAPI](https://fastapi.tiangolo.com/) service.

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

## 📜 License

This project is licensed under the **Apache License 2.0**.

Please see the **LICENSE** file in the root project repository for the full text. This is a permissive license that allows for both commercial and non-commercial use, modification, and distribution.

**Note on Data:** The datasets used to train the models are subject to their own original licenses. Please see the `data/README.md` file in the main project repository for detailed information on data sources and their respective terms of use.