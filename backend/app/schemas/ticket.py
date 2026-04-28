from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, IPvAnyAddress


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
    assigned_to: Optional[int] = None


class TicketResponse(TicketBase):
    id: int
    ticket_number: str
    status: str
    company_id: int
    user_id: int
    assigned_to: Optional[int] = None

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
    ip_address: Optional[IPvAnyAddress] = None
    user_agent: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: int
    ticket_number: str
    subject: str
    description: Optional[str] = None
    status: str
    priority: str
    customer_name: Optional[str] = None
    category_name: Optional[str] = None
    assignee_name: Optional[str] = None
    ai_response: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketListPaginatedResponse(BaseModel):
    tickets: list[TicketListResponse]
    total: int
    limit: int
    offset: int


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    is_internal: bool = False


class MessageResponse(MessageBase):
    id: int
    ticket_id: int
    author_id: Optional[int] = None
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
    assigned_to: int
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
    require_approval: bool = False


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


class CategoryActiveResponse(BaseModel):
    """Schema minimal para combo de seleção"""
    id: int
    name: str


class CategoryListResponse(BaseModel):
    """Schema para listagem admin com contagem de tickets"""
    id: int
    name: str
    description: Optional[str] = None
    sla_minutes: int = 1440
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool
    is_default: bool
    require_approval: bool
    ticket_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryUpdate(BaseModel):
    """Schema para atualização de categoria"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    sla_minutes: Optional[int] = Field(None, ge=1)
    icon: Optional[str] = None
    color: Optional[str] = None
    require_approval: Optional[bool] = None
    is_active: Optional[bool] = None


class CategoryWithCountResponse(BaseModel):
    """Response com categoria e contagem de tickets"""
    id: int
    company_id: int
    name: str
    description: Optional[str] = None
    sla_minutes: int
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool
    is_default: bool
    require_approval: bool
    parent_category_id: Optional[int] = None
    ticket_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# Attachment schemas
class AttachmentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    mime_type: str


class AttachmentListResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    mime_type: str
    uploaded_by: Optional[dict] = None  # {"id": 1, "name": "João Silva"}
    created_at: datetime
    storage_url: Optional[str] = None

    class Config:
        from_attributes = True


class AttachmentsUploadResponse(BaseModel):
    attachments: list[AttachmentResponse]
