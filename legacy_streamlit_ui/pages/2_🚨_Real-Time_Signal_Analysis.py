import streamlit as st
from api import client

def show_page():
    st.title("🚨 Real-Time Signal Analysis")
    st.markdown("This tool uses a fine-tuned DistilBERT model (Model 1) to classify unstructured text into one of 10 humanitarian categories.")

    text_input = st.text_area("Enter text to classify (e.g., a tweet or news snippet):", height=150, 
                              placeholder="Just felt a huge earthquake in Tokyo, so scary!")

    if st.button("Classify Text"):
        with st.spinner("Calling the AI model..."):
            result = client.classify_text(text_input)
            if result:
                st.subheader("Classification Result")
                label = result['label'].replace("_", " ").title()
                score = result['score']
                
                st.metric(label="Predicted Category", value=label, 
                          help=f"Confidence Score: {score:.2%}")

                st.progress(score)
    
    with st.expander("ℹ️ About This Model"):
        st.info(
            """
            - **Model:** Fine-tuned DistilBERT Transformer.
            - **Purpose:** To act as a "first-pass filter" for high-volume text data.
            - **Limitations:** Primarily trained on English text. It classifies the *topic* of the text and is not a "fake news" detector.
            """
        )

# Call the function to run the page
show_page()