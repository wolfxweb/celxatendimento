"""
Celery Configuration and Task Definitions

This module sets up Celery for background task processing,
specifically for AI response generation.
"""

import os
from celery import Celery

# Redis URL - change to your Redis instance
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "celx_atendimento",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.celery_tasks"],
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    # Task execution
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=300,  # 5 minutes max
    task_soft_time_limit=240,  # 4 minutes soft limit
    # Retry policy
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,
    # Worker
    worker_prefetch_multiplier=1,
    worker_concurrency=4,
    # Task routes
    task_routes={
        "app.tasks.celery_tasks.generate_ai_response": {"queue": "ai_tasks"},
        "app.tasks.celery_tasks.send_notification": {"queue": "notifications"},
    },
    # Beat schedule (for periodic tasks)
    beat_schedule={
        "cleanup-old-tickets": {
            "task": "app.tasks.celery_tasks.cleanup_old_tickets",
            "schedule": 3600.0,  # Every hour
        },
    },
)
