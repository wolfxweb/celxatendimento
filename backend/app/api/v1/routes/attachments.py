"""
Attachment Routes

Handles file uploads for tickets.
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.ticket import Ticket
from app.services.attachment_service import AttachmentService

router = APIRouter(prefix="/tickets", tags=["attachments"])


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".txt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
}

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB


@router.post("/{ticket_id}/attachments")
async def upload_attachment(
    ticket_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload a file attachment to a ticket.

    Supported types: pdf, png, jpg, txt, doc, docx, xls, xlsx
    Max size: 25MB
    """

    # Validate ticket exists and user has access
    result = await db.execute(select(Ticket).where(Ticket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    # Check file extension
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB",
        )

    # Upload
    service = AttachmentService(db)

    try:
        attachment = await service.upload_attachment(
            ticket_id=ticket.id,
            file_content=content,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            uploaded_by=current_user.id,
        )

        return {
            "id": attachment.id,
            "filename": attachment.original_filename,
            "url": attachment.storage_url,
            "size": attachment.file_size,
            "mime_type": attachment.mime_type,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{ticket_id}/attachments")
async def list_attachments(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all attachments for a ticket"""

    service = AttachmentService(db)
    attachments = await service.get_ticket_attachments(uuid.UUID(ticket_id))

    return [
        {
            "id": att.id,
            "filename": att.original_filename,
            "url": att.storage_url,
            "size": att.file_size,
            "mime_type": att.mime_type,
            "uploaded_at": att.uploaded_at,
        }
        for att in attachments
    ]


@router.delete(
    "/{ticket_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_attachment(
    ticket_id: str,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an attachment"""

    service = AttachmentService(db)
    success = await service.delete_attachment(attachment_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )


@router.get("/{ticket_id}/attachments/stats")
async def get_attachment_stats(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get attachment statistics for a ticket"""

    service = AttachmentService(db)
    stats = await service.get_attachment_stats(uuid.UUID(ticket_id))

    return stats
