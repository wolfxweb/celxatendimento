import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TicketBase(BaseModel):
    subject: str = Field(..., max_length=200)
    description: str = Field(..., max_length=5000)
    priority: str = "medium"
    category_id: Optional[int] = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    subject: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = None
    priority: Optional[str] = None
    category_id: Optional[int] = None
    assigned_to: Optional[uuid.UUID] = None


class TicketResponse(TicketBase):
    id: uuid.UUID
    ticket_number: str
    status: str
    company_id: uuid.UUID
    user_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None

    # Timestamps
    first_response_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    # SLA
    sla_due_at: Optional[datetime] = None
    sla_breached: bool = False

    # Rating
    rating: Optional[int] = None
    rating_comment: Optional[str] = None
    rated_at: Optional[datetime] = None

    # Metadata
    channel: str = "website"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: uuid.UUID
    ticket_number: str
    subject: str
    status: str
    priority: str
    category_name: Optional[str] = None
    assignee_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    is_internal: bool = False


class MessageResponse(MessageBase):
    id: int
    ticket_id: uuid.UUID
    author_id: Optional[uuid.UUID] = None
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    message_type: str
    ai_response_id: Optional[int] = None
    was_edited: bool = False
    original_ai_text: Optional[str] = None
    is_internal: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TicketDetailResponse(TicketResponse):
    messages: list[MessageResponse] = []
    category_name: Optional[str] = None
    user_name: str
    user_email: str
    assignee_name: Optional[str] = None

    class Config:
        from_attributes = True


class AIResponseAction(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None
    rejection_reason: Optional[str] = None


class AIResponseApprove(AIResponseAction):
    pass


class AIResponseReject(AIResponseAction):
    rejection_reason: str


class AIResponseEdit(BaseModel):
    edited_response: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None


class TicketAssignmentRequest(BaseModel):
    assigned_to: uuid.UUID
    reason: str = "manual"
    notes: Optional[str] = None


class TicketStatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = None


# Category schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    sla_minutes: int = 1440
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    company_id: int
    is_active: bool
    is_default: bool
    require_approval: bool
    parent_category_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
