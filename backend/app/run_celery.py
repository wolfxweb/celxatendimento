#!/usr/bin/env python
"""
Celery Worker Startup Script

Run with:
    celery -A app.celery_app worker --loglevel=info

Or use this script:
    python -m app.run_celery worker --loglevel=info
"""

import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.celery_app import celery_app

if __name__ == "__main__":
    # Start worker
    celery_app.start()
