from fastapi import APIRouter

from app.api.v1.routes import (
    auth,
    tickets,
    users,
    companies,
    ai_config,
    categories,
    knowledge,
    plans,
    attachments,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tickets.router)
api_router.include_router(companies.router)
api_router.include_router(ai_config.router)
api_router.include_router(categories.router)
api_router.include_router(knowledge.router)
api_router.include_router(plans.router)
api_router.include_router(attachments.router)
