import streamlit as st
from config import settings
from api import client
from utils import helpers

def show_page():
    st.title("📈 Event Risk Scenario Planner")
    st.markdown("Use our XGBoost model (Model 2) to assess the static risk of a disaster event becoming a high-impact incident based on its characteristics.")

    with st.form("risk_form"):
        st.write("Enter the scenario details:")
        col1, col2 = st.columns(2)
        with col1:
            country = st.selectbox("Country", settings.VALID_COUNTRIES)
            region = st.selectbox("Region", settings.VALID_REGIONS)
            disaster_group = st.selectbox("Disaster Group", ["Natural", "Technological"])
            disaster_subgroup = st.text_input("Disaster Subgroup", "Hydrological")
        
        with col2:
            disaster_type = st.selectbox("Disaster Type", settings.VALID_DISASTER_TYPES)
            start_year = st.number_input("Start Year", min_value=2000, max_value=2050, value=2024)
            start_month = st.slider("Start Month", 1, 12, 1)

        submitted = st.form_submit_button("Assess Risk")

    if submitted:
        payload = {
            "disaster_group": disaster_group,
            "disaster_subgroup": disaster_subgroup,
            "disaster_type": disaster_type,
            "country": country,
            "region": region,
            "start_year": start_year,
            "start_month": start_month
        }
        with st.spinner("Calling the risk assessment model..."):
            result = client.predict_static_risk(payload)
            if result:
                st.subheader("Risk Assessment Result")
                score = result['high_risk_probability']
                formatted_score = helpers.format_risk_score(score)
                st.markdown(f"### Predicted Risk: {formatted_score}")
                st.progress(score)
    
    with st.expander("ℹ️ About This Model"):
        st.info(
            """
            - **Model:** XGBoost Classifier trained on the EMDAT global disaster database.
            - **Purpose:** To provide a historical, data-driven probability of an event becoming "high-impact" (defined as >10 fatalities).
            - **Limitations:** The model is based on historical patterns and cannot account for real-time factors like local preparedness or specific weather conditions.
            """
        )

# Call the function to run the page
show_page()