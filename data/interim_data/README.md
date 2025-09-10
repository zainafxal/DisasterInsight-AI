# Project Datasets

This directory provides instructions on how to obtain the datasets required to run the notebooks and train the models for the DisasterInsight AI project.

**IMPORTANT:** The raw data files are **not included** in this repository. You must download them from their original sources as listed below. Each dataset is subject to its own unique license, which you must adhere to.

## Instructions for Setup

1.  Download the datasets from the links provided in the table below.
2.  Place the required files into the `/data/interim_data/` directory. For example, place `public_emdat_2025-08-18.xlsx` directly inside `interim_data`.
3.  Once all files are in place, you can run the Jupyter notebooks in the `/notebooks` directory sequentially.

---

## 📚 Dataset Sources & Licenses

| Dataset Name                       | Required For                                     | Source Link                                                    | License                                |
| ---------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------- |
| CrisisBench                        | Model 1: NLP Tweet Classification (Benchmark)    | [crisisnlp.qcri.org](https://crisisnlp.qcri.org/crisis_datasets_benchmarks) | CC BY-NC-SA 4.0                        |
| CrisisNLP / LREC2016               | Model 1: NLP Tweet Classification (Training)     | [crisisnlp.qcri.org](https://crisisnlp.qcri.org/lrec2016/lrec2016.html) | Non-commercial, restricted use         |
| HumAID Dataset                     | Model 1: NLP Tweet Classification (Training)     | [crisisnlp.qcri.org](https://crisisnlp.qcri.org/humaid_dataset)   | CC BY-NC-SA 4.0 (assumed)              |
| EM-DAT: Intl. Disaster Database    | Model 2 & 4: Risk & Regional Forecasting         | [public.emdat.be/data](https://public.emdat.be/data)           | Free public use with attribution       |
| USGS Earthquake DB (Kaggle)        | Model 3: Global Frequency Forecasting            | [kaggle.com](https://www.kaggle.com/datasets/usgs/earthquake-database) | Kaggle Dataset License                 |

## 📡 Live API Data

The live data feed in the frontend UI uses a separate, real-time API.

| API Name                   | Used For                                  | API Endpoint Documentation                                         | License                                |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| USGS Earthquake API        | Real-time Feed in Frontend UI             | [earthquake.usgs.gov](https://earthquake.usgs.gov/fdsnws/event/1/) | Public Domain (U.S. Govt. work)        |