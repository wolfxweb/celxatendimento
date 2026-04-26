"""
Enum types matching PostgreSQL enums for SQLAlchemy models.
"""
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"


class TicketStatus(str, Enum):
    OPEN = "open"
    PENDING_AI = "pending_ai"
    PENDING_AGENT = "pending_agent"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REJECTED = "rejected"


class TicketPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AIResponseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"


class AIProviderName(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    OPENROUTER = "openrouter"
    LOCAL = "local"


class AIModelType(str, Enum):
    LLM = "llm"
    EMBEDDING = "embedding"


class SourceType(str, Enum):
    PDF = "pdf"
    TEXT = "text"
    URL = "url"


class TicketRelationType(str, Enum):
    DUPLICATE = "duplicate"
    CAUSES = "causes"
    CAUSED_BY = "caused_by"
    RELATED = "related"
    SUBTICKET = "subticket"
    PARENT = "parent"


class CompanyStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"


class AutonomyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
