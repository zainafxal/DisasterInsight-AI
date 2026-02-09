# main.py

from dotenv import load_dotenv
import os

# 1️⃣ Load environment variables FIRST, before importing other modules
load_dotenv()

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.v1 import endpoints  # safe to import now
from logging.config import dictConfig
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging_config import LOGGING_CONFIG
import logging

# Import the smart startup function from your service
from app.services.rag_service import initialize_rag_on_startup

# 2️⃣ Apply logging configuration
dictConfig(LOGGING_CONFIG)

# 3️⃣ Get a logger
logger = logging.getLogger("app")

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs before the API starts receiving requests.
    Perfect place to initialize models or ingest data.
    """
    try:
        logger.info("🚀 API Startup: Checking RAG Knowledge Base...")
        initialize_rag_on_startup()
    except Exception as e:
        logger.error(f"⚠️ RAG Initialization failed: {e}")
    
    yield  # the API runs here
    
    # Cleanup after shutdown
    logger.info("🛑 API Shutdown.")

# --- Initialize FastAPI App ---
app = FastAPI(
    title="Disaster Insight AI API",
    description="An API for detecting, analyzing, and forecasting disaster events using AI models.",
    version="1.0.0",
    lifespan=lifespan  # attach lifespan
)

# --- Add CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include API Routes ---
app.include_router(endpoints.router, prefix="/api/v1", tags=["Predictions"])

# --- Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    logger.info("Root endpoint was accessed by a client.") 
    return {"message": "Welcome to the Disaster Insight AI API. Go to /docs for the API documentation."}

# --- Health Check Endpoint ---
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

# --- Local Dev Entrypoint ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
