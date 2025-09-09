import streamlit as st
from api import client
from utils import helpers
from components import map_display

def show_page():
    st.title("📡 Live Global Earthquake Data (USGS)")
    st.markdown("This page displays real-time data for significant earthquakes (Magnitude 4.5+) from the last 7 days, powered by the USGS API.")

    raw_data = client.get_live_usgs_data()
    
    if raw_data:
        df = helpers.process_usgs_data(raw_data)
        
        # Display map
        map_display.display_earthquake_map(df)
        
        # Display data table
        st.subheader("Raw Data (Last 7 Days)")
        st.dataframe(df[['time', 'place', 'magnitude', 'depth', 'url']], use_container_width=True)

# Call the function to run the page
show_page()