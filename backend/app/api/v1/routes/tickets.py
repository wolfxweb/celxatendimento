from datetime import datetime
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.ticket import Ticket
from app.models.ticket_message import TicketMessage
from app.models.ticket_ai_response import TicketAIResponse
from app.models.user import User
from app.models.category import Category
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
    TicketListResponse,
    TicketDetailResponse,
    MessageResponse,
    MessageCreate,
    TicketAssignmentRequest,
    TicketStatusUpdate,
    AIResponseApprove,
    AIResponseReject,
    AIResponseEdit,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new ticket with category and priority selection"""

    # Get user's company
    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    # Generate ticket number
    year = datetime.now().year
    month = datetime.now().month

    result = await db.execute(
        select(Ticket)
        .where(
            and_(
                Ticket.company_id == company_id,
            )
        )
        .order_by(Ticket.created_at.desc())
    )
    existing_tickets = result.scalars().all()
    count = len(
        [
            t
            for t in existing_tickets
            if t.created_at.year == year and t.created_at.month == month
        ]
    )

    ticket_number = f"TKT-{year}{month:02d}{(count + 1):06d}"

    # Calculate SLA based on priority
    sla_minutes = {"critical": 60, "high": 240, "medium": 1440, "low": 2880}.get(
        ticket_data.priority, 1440
    )

    # Check category SLA override
    if ticket_data.category_id:
        cat_result = await db.execute(
            select(Category).where(Category.id == ticket_data.category_id)
        )
        category = cat_result.scalar_one_or_none()
        if category and category.sla_minutes:
            sla_minutes = category.sla_minutes

    from datetime import timedelta

    sla_due_at = datetime.now() + timedelta(minutes=sla_minutes)

    ticket = Ticket(
        company_id=company_id,
        user_id=current_user.id,
        ticket_number=ticket_number,
        category_id=ticket_data.category_id,
        priority=ticket_data.priority,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status="open",
        sla_due_at=sla_due_at,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent") if request.headers else None,
    )

    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.get("/", response_model=list[TicketListResponse])
async def list_tickets(
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List tickets with filters - role-based results"""

    company_id = current_user.company_id

    # Build query based on role
    if current_user.role == "customer":
        # Customers see only their own tickets
        query = select(Ticket).where(
            and_(
                Ticket.user_id == current_user.id,
                Ticket.deleted_at.is_(None),
            )
        )
    else:
        # Agents and admins see all company tickets
        query = select(Ticket).where(
            and_(
                Ticket.company_id == company_id,
                Ticket.deleted_at.is_(None),
            )
        )

    # Apply filters
    if status:
        query = query.where(Ticket.status == status)
    if assigned_to:
        query = query.where(Ticket.assigned_to == uuid.UUID(assigned_to))

    query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)

    result = await db.execute(query)
    tickets = result.scalars().all()

    # Convert to response with related data
    response = []
    for ticket in tickets:
        # Get category name
        category_name = None
        if ticket.category_id:
            cat_result = await db.execute(
                select(Category.name).where(Category.id == ticket.category_id)
            )
            category_name = cat_result.scalar_one_or_none()

        # Get assignee name
        assignee_name = None
        if ticket.assigned_to:
            user_result = await db.execute(
                select(User.full_name).where(User.id == ticket.assigned_to)
            )
            assignee_name = user_result.scalar_one_or_none()

        response.append(
            TicketListResponse(
                id=ticket.id,
                ticket_number=ticket.ticket_number,
                subject=ticket.subject,
                status=ticket.status,
                priority=ticket.priority,
                category_name=category_name,
                assignee_name=assignee_name,
                created_at=ticket.created_at,
            )
        )

    return response


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get ticket details with messages"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Check access
    if current_user.role == "customer" and ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Get messages
    msg_result = await db.execute(
        select(TicketMessage)
        .where(TicketMessage.ticket_id == ticket.id)
        .order_by(TicketMessage.created_at.asc())
    )
    messages = msg_result.scalars().all()

    # Get user info
    user_result = await db.execute(select(User).where(User.id == ticket.user_id))
    ticket_user = user_result.scalar_one_or_none()

    # Get category name
    category_name = None
    if ticket.category_id:
        cat_result = await db.execute(
            select(Category.name).where(Category.id == ticket.category_id)
        )
        category_name = cat_result.scalar_one_or_none()

    # Get assignee name
    assignee_name = None
    if ticket.assigned_to:
        assignee_result = await db.execute(
            select(User.full_name).where(User.id == ticket.assigned_to)
        )
        assignee_name = assignee_result.scalar_one_or_none()

    # Build message responses
    message_responses = []
    for msg in messages:
        author_name = None
        author_role = None
        if msg.author_id:
            author_result = await db.execute(
                select(User.full_name, User.role).where(User.id == msg.author_id)
            )
            author_data = author_result.first()
            if author_data:
                author_name = author_data[0]
                author_role = author_data[1]

        message_responses.append(
            MessageResponse(
                id=msg.id,
                ticket_id=msg.ticket_id,
                author_id=msg.author_id,
                author_name=author_name,
                author_role=author_role,
                content=msg.content,
                message_type=msg.message_type,
                ai_response_id=msg.ai_response_id,
                was_edited=msg.was_edited,
                original_ai_text=msg.original_ai_text,
                is_internal=msg.is_internal,
                created_at=msg.created_at,
            )
        )

    return TicketDetailResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        subject=ticket.subject,
        description=ticket.description,
        priority=ticket.priority,
        category_id=ticket.category_id,
        status=ticket.status,
        company_id=ticket.company_id,
        user_id=ticket.user_id,
        assigned_to=ticket.assigned_to,
        first_response_at=ticket.first_response_at,
        resolved_at=ticket.resolved_at,
        closed_at=ticket.closed_at,
        sla_due_at=ticket.sla_due_at,
        sla_breached=ticket.sla_breached,
        rating=ticket.rating,
        rating_comment=ticket.rating_comment,
        rated_at=ticket.rated_at,
        channel=ticket.channel,
        ip_address=ticket.ip_address,
        user_agent=ticket.user_agent,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=message_responses,
        category_name=category_name,
        user_name=ticket_user.full_name if ticket_user else "Unknown",
        user_email=ticket_user.email if ticket_user else "",
        assignee_name=assignee_name,
    )


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update ticket fields"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Update fields
    update_data = ticket_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    # Handle status change timestamps
    if ticket_data.status:
        if ticket_data.status == "pending_agent" and not ticket.first_response_at:
            ticket.first_response_at = datetime.now()
        elif ticket_data.status in ["resolved", "closed"]:
            ticket.resolved_at = datetime.now()

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.post("/{ticket_id}/messages", response_model=MessageResponse)
async def add_message(
    ticket_id: str,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add a message to a ticket"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Determine message type based on user role
    message_type = "agent"
    if current_user.role == "customer":
        message_type = "customer"

    message = TicketMessage(
        ticket_id=ticket.id,
        author_id=current_user.id,
        content=message_data.content,
        message_type=message_type,
        is_internal=message_data.is_internal,
    )

    db.add(message)

    # Update ticket
    ticket.updated_at = datetime.now()

    # First response tracking
    if not ticket.first_response_at:
        ticket.first_response_at = datetime.now()

    await db.commit()
    await db.refresh(message)

    return MessageResponse(
        id=message.id,
        ticket_id=message.ticket_id,
        author_id=message.author_id,
        author_name=current_user.full_name,
        author_role=current_user.role,
        content=message.content,
        message_type=message.message_type,
        ai_response_id=message.ai_response_id,
        was_edited=message.was_edited,
        original_ai_text=message.original_ai_text,
        is_internal=message.is_internal,
        created_at=message.created_at,
    )


@router.post("/{ticket_id}/assign", response_model=TicketResponse)
async def assign_ticket(
    ticket_id: str,
    assignment: TicketAssignmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Assign ticket to an agent"""

    # Only agents and admins can assign
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can assign tickets",
        )

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Update assignment
    ticket.assigned_to = assignment.assigned_to

    # Create assignment log
    from app.models.ticket_assignment_log import TicketAssignmentLog

    assignment_log = TicketAssignmentLog(
        ticket_id=ticket.id,
        assigned_to=assignment.assigned_to,
        assigned_from=ticket.assigned_to,
        reason=assignment.reason,
        notes=assignment.notes,
        created_by=current_user.id,
    )
    db.add(assignment_log)

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.post("/{ticket_id}/ai/approve", response_model=TicketResponse)
async def approve_ai_response(
    ticket_id: str,
    approval: AIResponseApprove,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Approve AI response and send to customer"""

    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can approve AI responses",
        )

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get pending AI response
    ai_result = await db.execute(
        select(TicketAIResponse).where(
            and_(
                TicketAIResponse.ticket_id == ticket.id,
                TicketAIResponse.status == "pending",
            )
        )
    )
    ai_response = ai_result.scalar_one_or_none()

    if not ai_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending AI response found",
        )

    # Update AI response status
    ai_response.status = "approved"
    ai_response.reviewed_by = current_user.id
    ai_response.reviewed_at = datetime.now()
    ai_response.ai_rating = approval.rating
    ai_response.ai_feedback = approval.feedback

    # Add approved message to ticket
    message = TicketMessage(
        ticket_id=ticket.id,
        author_id=current_user.id,
        content=ai_response.response_text,
        message_type="ai_approved",
        ai_response_id=ai_response.id,
    )
    db.add(message)

    # Update ticket status
    ticket.status = "pending_agent"
    ticket.updated_at = datetime.now()

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.post("/{ticket_id}/ai/reject", response_model=TicketResponse)
async def reject_ai_response(
    ticket_id: str,
    rejection: AIResponseReject,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Reject AI response"""

    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can reject AI responses",
        )

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get pending AI response
    ai_result = await db.execute(
        select(TicketAIResponse).where(
            and_(
                TicketAIResponse.ticket_id == ticket.id,
                TicketAIResponse.status == "pending",
            )
        )
    )
    ai_response = ai_result.scalar_one_or_none()

    if not ai_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending AI response found",
        )

    # Update AI response status
    ai_response.status = "rejected"
    ai_response.reviewed_by = current_user.id
    ai_response.reviewed_at = datetime.now()
    ai_response.rejection_reason = rejection.rejection_reason
    ai_response.ai_rating = rejection.rating
    ai_response.ai_feedback = rejection.feedback

    # Create feedback log
    from app.models.ai_feedback_log import AIFeedbackLog

    feedback_log = AIFeedbackLog(
        ticket_id=ticket.id,
        ai_response_id=ai_response.id,
        agent_id=current_user.id,
        action="rejected",
        previous_state={"status": "pending"},
        new_state={"status": "rejected"},
        rejection_reason=rejection.rejection_reason,
    )
    db.add(feedback_log)

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.post("/{ticket_id}/ai/edit", response_model=TicketResponse)
async def edit_ai_response(
    ticket_id: str,
    edit: AIResponseEdit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Edit AI response before sending"""

    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can edit AI responses",
        )

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get pending AI response
    ai_result = await db.execute(
        select(TicketAIResponse).where(
            and_(
                TicketAIResponse.ticket_id == ticket.id,
                TicketAIResponse.status == "pending",
            )
        )
    )
    ai_response = ai_result.scalar_one_or_none()

    if not ai_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending AI response found",
        )

    # Store original text
    original_text = ai_response.response_text

    # Update AI response
    ai_response.status = "edited"
    ai_response.response_text = edit.edited_response
    ai_response.was_edited = True
    ai_response.reviewed_by = current_user.id
    ai_response.reviewed_at = datetime.now()
    ai_response.ai_rating = edit.rating
    ai_response.ai_feedback = edit.feedback

    # Add edited message to ticket
    message = TicketMessage(
        ticket_id=ticket.id,
        author_id=current_user.id,
        content=edit.edited_response,
        message_type="ai_approved",
        ai_response_id=ai_response.id,
        was_edited=True,
        original_ai_text=original_text,
    )
    db.add(message)

    # Update ticket status
    ticket.status = "pending_agent"
    ticket.updated_at = datetime.now()

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Soft delete a ticket"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Soft delete
    from datetime import datetime

    ticket.deleted_at = datetime.now()

    await db.commit()


@router.post("/{ticket_id}/ai/feedback", status_code=status.HTTP_200_OK)
async def submit_ai_feedback(
    ticket_id: str,
    rating: int,
    feedback: Optional[str] = None,
    is_example_good: bool = False,
    is_example_bad: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Submit feedback for an AI response.

    - rating: 1-5 star rating (required)
    - feedback: Optional textual feedback
    - is_example_good: Mark as good training example
    - is_example_bad: Mark as bad training example
    """

    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can submit AI feedback",
        )

    if not 1 <= rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5",
        )

    from app.services.ai_feedback_service import AIFeedbackService

    service = AIFeedbackService(db)
    result = await service.submit_feedback(
        ticket_id=uuid.UUID(ticket_id),
        agent_id=current_user.id,
        rating=rating,
        feedback_text=feedback,
        is_example_good=is_example_good,
        is_example_bad=is_example_bad,
    )

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"],
        )

    return result


@router.post("/{ticket_id}/ai/example", status_code=status.HTTP_200_OK)
async def mark_ai_as_example(
    ticket_id: str,
    is_good: bool,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Mark AI response as a good or bad training example.
    """

    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can mark AI examples",
        )

    from app.services.ai_feedback_service import AIFeedbackService

    service = AIFeedbackService(db)
    result = await service.mark_as_example(
        ticket_id=uuid.UUID(ticket_id),
        agent_id=current_user.id,
        is_good=is_good,
        reason=reason,
    )

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"],
        )

    return result


@router.get("/ai/stats", status_code=status.HTTP_200_OK)
async def get_ai_feedback_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get AI feedback statistics for the company.
    """

    if current_user.role not in ["agent", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    from app.services.ai_feedback_service import AIFeedbackService

    service = AIFeedbackService(db)
    stats = await service.get_feedback_stats(
        company_id=current_user.company_id,
        days=30,
    )

    return stats


@router.post("/{ticket_id}/rate", status_code=status.HTTP_200_OK)
async def rate_ticket(
    ticket_id: str,
    rating: int,
    comment: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Customer rates the ticket service.

    - rating: 1-5 stars (required)
    - comment: Optional feedback text
    """

    # Only customers can rate their own tickets
    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if str(ticket.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only rate your own tickets",
        )

    # Validate rating
    if not 1 <= rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5",
        )

    # Check if ticket is closable
    if ticket.status not in ["resolved", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate resolved or closed tickets",
        )

    # Update ticket with rating
    ticket.rating = rating
    ticket.rating_comment = comment
    ticket.rated_at = datetime.now()

    # Create audit log entry
    from app.models.ticket_audit_log import TicketAuditLog

    audit_log = TicketAuditLog(
        ticket_id=ticket.id,
        action_type="rating_added",
        user_id=current_user.id,
        user_role=current_user.role,
        new_values={"rating": rating, "comment": comment},
    )
    db.add(audit_log)

    await db.commit()

    return {"message": "Rating submitted successfully", "rating": rating}


@router.get("/{ticket_id}/relations", response_model=list)
async def get_ticket_relations(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all related tickets for a ticket"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get relations
    from app.models.ticket_relation import TicketRelation

    rel_result = await db.execute(
        select(TicketRelation).where(TicketRelation.ticket_id == uuid.UUID(ticket_id))
    )
    relations = rel_result.scalars().all()

    # Build response with related ticket info
    response = []
    for rel in relations:
        # Get related ticket info
        rel_ticket_result = await db.execute(
            select(Ticket).where(Ticket.id == rel.related_ticket_id)
        )
        rel_ticket = rel_ticket_result.scalar_one_or_none()

        if rel_ticket:
            response.append(
                {
                    "id": rel.id,
                    "relation_type": rel.relation_type,
                    "description": rel.description,
                    "related_ticket": {
                        "id": str(rel_ticket.id),
                        "ticket_number": rel_ticket.ticket_number,
                        "subject": rel_ticket.subject,
                        "status": rel_ticket.status,
                        "priority": rel_ticket.priority,
                    },
                    "created_at": rel.created_at,
                }
            )

    return response


@router.post("/{ticket_id}/relations", status_code=status.HTTP_201_CREATED)
async def create_ticket_relation(
    ticket_id: str,
    related_ticket_id: str,
    relation_type: str,
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a relation between two tickets.

    relation_type: duplicate, causes, caused_by, related, subtask, parent
    """

    # Validate relation type
    valid_types = ["duplicate", "causes", "caused_by", "related", "subtask", "parent"]
    if relation_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid relation type. Must be one of: {', '.join(valid_types)}",
        )

    # Get main ticket
    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get related ticket
    rel_result = await db.execute(
        select(Ticket).where(Ticket.id == uuid.UUID(related_ticket_id))
    )
    related_ticket = rel_result.scalar_one_or_none()

    if not related_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Related ticket not found",
        )

    # Check if relation already exists
    from app.models.ticket_relation import TicketRelation

    exists_result = await db.execute(
        select(TicketRelation).where(
            and_(
                TicketRelation.ticket_id == uuid.UUID(ticket_id),
                TicketRelation.related_ticket_id == uuid.UUID(related_ticket_id),
                TicketRelation.relation_type == relation_type,
            )
        )
    )
    if exists_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relation already exists",
        )

    # Create relation
    relation = TicketRelation(
        ticket_id=ticket.id,
        related_ticket_id=related_ticket.id,
        relation_type=relation_type,
        description=description,
        created_by=current_user.id,
    )
    db.add(relation)

    # Create audit log
    from app.models.ticket_audit_log import TicketAuditLog

    audit_log = TicketAuditLog(
        ticket_id=ticket.id,
        action_type="relation_added",
        user_id=current_user.id,
        user_role=current_user.role,
        new_values={
            "relation_type": relation_type,
            "related_ticket_id": related_ticket_id,
            "description": description,
        },
    )
    db.add(audit_log)

    await db.commit()

    return {"message": "Relation created successfully"}


@router.delete(
    "/{ticket_id}/relations/{relation_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_ticket_relation(
    ticket_id: str,
    relation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a ticket relation"""

    from app.models.ticket_relation import TicketRelation

    result = await db.execute(
        select(TicketRelation).where(
            and_(
                TicketRelation.id == relation_id,
                TicketRelation.ticket_id == uuid.UUID(ticket_id),
            )
        )
    )
    relation = result.scalar_one_or_none()

    if not relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relation not found",
        )

    # Delete relation
    await db.delete(relation)

    # Create audit log
    from app.models.ticket_audit_log import TicketAuditLog

    audit_log = TicketAuditLog(
        ticket_id=uuid.UUID(ticket_id),
        action_type="relation_removed",
        user_id=current_user.id,
        user_role=current_user.role,
        old_values={"relation_type": relation.relation_type},
    )
    db.add(audit_log)

    await db.commit()


@router.get("/{ticket_id}/audit-log", response_model=list)
async def get_ticket_audit_log(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get the audit log for a ticket (all changes)"""

    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Get audit logs
    from app.models.ticket_audit_log import TicketAuditLog

    log_result = await db.execute(
        select(TicketAuditLog)
        .where(TicketAuditLog.ticket_id == uuid.UUID(ticket_id))
        .order_by(TicketAuditLog.created_at.desc())
    )
    logs = log_result.scalars().all()

    return [
        {
            "id": log.id,
            "action_type": log.action_type,
            "user_id": str(log.user_id) if log.user_id else None,
            "user_role": log.user_role,
            "old_values": log.old_values,
            "new_values": log.new_values,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]


from typing import Optional
