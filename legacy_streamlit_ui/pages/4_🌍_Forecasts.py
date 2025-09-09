import streamlit as st
from api import client
import plotly.graph_objects as go

def show_page():
    st.title("🌍 Global & Regional Forecasts")

    # --- Global Forecast ---
    st.header("Strategic Global Forecast (Model 3)")
    st.markdown("This Prophet model forecasts the expected global frequency of significant earthquakes (Magnitude 6.0+) per month. It provides a strategic baseline to identify anomalies.")
    
    forecast_df = client.get_global_forecast()
    
    if not forecast_df.empty:
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=forecast_df['ds'], y=forecast_df['yhat_upper'], fill=None, mode='lines', line_color='lightgrey', name='Upper Bound'))
        fig.add_trace(go.Scatter(x=forecast_df['ds'], y=forecast_df['yhat_lower'], fill='tonexty', mode='lines', line_color='lightgrey', name='Lower Bound'))
        fig.add_trace(go.Scatter(x=forecast_df['ds'], y=forecast_df['yhat'], mode='lines', line_color='blue', name='Forecast'))
        fig.update_layout(title="Global Forecast of Significant Earthquakes per Month",
                          xaxis_title="Date", yaxis_title="Predicted Count")
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("Could not retrieve global forecast data from the API.")
        
    with st.expander("ℹ️ About This Global Model"):
        st.info(
            """
            - **Model:** Prophet Time-Series Model.
            - **Purpose:** To provide a strategic global baseline for seismic activity.
            - **Limitations:** This forecast is **global, not local**. It cannot predict the risk for any specific country. It was trained on post-1970 data.
            """
        )
        
    st.divider()

    # --- Regional Forecast ---
    st.header("Tactical Regional Forecast (Model 4)")
    st.markdown("This XGBoost model provides a tactical forecast of the probability of a fatal earthquake in the **next quarter** for specific, high-risk countries.")
    
    with st.form("regional_form"):
        st.write("Enter the current quarter's seismic summary for a region:")
        event_count = st.number_input("Number of Earthquakes This Quarter", min_value=0, value=5)
        max_mag = st.slider("Max Magnitude This Quarter", 0.0, 10.0, 6.8, 0.1)
        avg_mag = st.slider("Average Magnitude This Quarter", 0.0, 10.0, 5.5, 0.1)
        
        submitted = st.form_submit_button("Forecast Next-Quarter Impact")

    if submitted:
        payload = {
            "event_count": event_count,
            "max_magnitude": max_mag,
            "avg_magnitude": avg_mag
        }
        with st.spinner("Calling the regional forecast model..."):
            result = client.predict_regional_impact(payload)
            if result:
                st.subheader("Next-Quarter Impact Forecast")
                score = result['high_impact_probability']
                st.metric(label="Probability of a Fatal Event Next Quarter", value=f"{score:.2%}")
                st.progress(score)

    with st.expander("ℹ️ About This Regional Model"):
        st.error(
            """
            **⚠️ CRITICAL LIMITATION**
            - **Geographic Scope:** This model is a proof-of-concept and is **ONLY VALID** for **China, India, Indonesia, and the Philippines**.
            - **Performance:** It is a high-precision but low-recall model. An alert is a strong signal, but a 'safe' prediction does not guarantee safety.
            """
        )

# Call the function to run the page
show_page()