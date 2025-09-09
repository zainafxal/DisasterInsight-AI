from fastapi import FastAPI
from app.api.v1 import endpoints
from logging.config import dictConfig
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging_config import LOGGING_CONFIG # Import the logging configuration
import logging

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
# This links the endpoints defined in app/api/v1/endpoints.py
app.include_router(endpoints.router, prefix="/api/v1", tags=["Predictions"])



# --- Define the Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    # 3. Example of how to use the logger
    logger.info("Root endpoint was accessed by a client.") 
    return {"message": "Welcome to the Disaster Insight AI API. Go to /docs for the API documentation."}