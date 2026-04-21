FROM python:3.10-slim

# Install system dependencies (needed for Prophet/XGBoost/ONNX)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install dependencies (no-cache-dir is MUST to save space)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# --- CRITICAL: Set Writable Dirs for Hugging Face ---
ENV MPLCONFIGDIR=/tmp/matplotlib
ENV TRANSFORMERS_CACHE=/tmp/hf_cache
ENV HF_HOME=/tmp/hf_home
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 7860

# Run with Uvicorn directly
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]