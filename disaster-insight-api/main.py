from fastapi import FastAPI
from app.api.v1 import endpoints
from logging.config import dictConfig
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging_config import LOGGING_CONFIG  # Import logging configuration
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env (only affects local runs)
load_dotenv()

# 1. Apply the logging configuration from our new file
dictConfig(LOGGING_CONFIG)

# 2. Get a specific logger for our application to use
logger = logging.getLogger("app")

# --- Initialize FastAPI App ---
app = FastAPI(
    title="Disaster Insight AI API",
    description="An API for detecting, analyzing, and forecasting disaster events using AI models.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include API Routes ---
app.include_router(endpoints.router, prefix="/api/v1", tags=["Predictions"])

# --- Define the Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    logger.info("Root endpoint was accessed by a client.") 
    return {"message": "Welcome to the Disaster Insight AI API. Go to /docs for the API documentation."}

# --- Define Health Check Endpoint ---
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

# --- Local Dev Entrypoint ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))  # Hugging Face sets PORT, fallback 7860 locally
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
