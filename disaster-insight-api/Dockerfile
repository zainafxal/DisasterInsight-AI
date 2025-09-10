FROM python:3.10-slim

# Install system dependencies for Prophet/XGBoost
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libopenblas-dev \
    libblas-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all code
COPY . .

# Expose port (Hugging Face sets PORT automatically)
EXPOSE 7860

# Set writable cache dirs
ENV MPLCONFIGDIR=/tmp/matplotlib
ENV TRANSFORMERS_CACHE=/tmp/hf_cache

# Run app (main.py will pick up $PORT from env)
CMD ["python", "main.py"]