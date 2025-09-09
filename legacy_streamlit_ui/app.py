import streamlit as st

# --- Page Configuration ---
st.set_page_config(
    page_title="Disaster Insight AI - Home", # Give it a unique title
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Sidebar Content ---
st.sidebar.title("Disaster Insight AI")
st.sidebar.markdown(
    """
    **A Global, Real-Time Disaster Detection and Crisis Support Dashboard.**
    
    Select a tool from the navigation menu to begin.
    """
)
st.sidebar.divider()

# --- Main Home Page Content ---
st.title("Welcome to Disaster Insight AI 🌍")
st.markdown(
    """
    This platform leverages a suite of AI and Machine Learning models to transform massive, 
    unstructured data streams into actionable intelligence for emergency responders, NGOs, 
    and government planners.
    
    ---
    """
)

st.subheader("Platform Capabilities")

cols = st.columns(3)
with cols[0]:
    st.info("🚨 **Real-Time Detection**")
    st.write("Analyze social media posts or news snippets in real-time to classify them into specific humanitarian categories using our fine-tuned NLP model.")

with cols[1]:
    st.success("📈 **Risk Assessment & Forecasting**")
    st.write("Utilize historical data to assess the static risk of a disaster event or forecast future seismic activity on both a global and regional scale.")

with cols[2]:
    st.warning("📡 **Live Data Integration**")
    st.write("Monitor real-time global earthquake events directly from the USGS to maintain situational awareness.")

st.markdown(
    """
    ---
    ***Select a page from the sidebar to explore these tools.***
    """
)