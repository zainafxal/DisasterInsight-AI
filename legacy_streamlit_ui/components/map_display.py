import streamlit as st
import pandas as pd
import plotly.express as px

def display_earthquake_map(df: pd.DataFrame):
    """Renders an interactive map of earthquake data."""
    if df.empty:
        st.info("No live earthquake data available to display on the map.")
        return

    st.subheader("Interactive Global Map (Last 7 Days)")
    
    fig = px.scatter_geo(
        df,
        lat='lat',
        lon='lon',
        size='magnitude',
        color='depth',
        hover_name='place',
        hover_data={'magnitude': True, 'depth': ':.2f', 'time': True, 'url': False},
        projection='natural earth',
        title='Significant Earthquakes (Magnitude 4.5+) in the Last Week',
        color_continuous_scale=px.colors.sequential.Plasma_r,
        size_max=15
    )
    fig.update_layout(margin={"r":0,"t":30,"l":0,"b":0})
    st.plotly_chart(fig, use_container_width=True)