import logging
import sys
from pathlib import Path

# Define the base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True) # Create logs directory if it doesn't exist

# --- Logging Configuration ---
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": sys.stdout,
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": LOGS_DIR / "api.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
            "encoding": "utf8",
        },
    },
    "loggers": {
        "app": {  # Logger for our application
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn": { # Logger for the server
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": { # Root logger
        "handlers": ["console", "file"],
        "level": "WARNING"
    }
}