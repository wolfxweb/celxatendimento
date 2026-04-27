"""
Attachment Routes

Handles file uploads for tickets - supports multiple file uploads.
"""

import os
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.ticket import Ticket
from app.services.attachment_service import AttachmentService
from app.services.ticket_ai_service import generate_pending_ai_response_background
from app.schemas.ticket import AttachmentResponse, AttachmentListResponse, AttachmentsUploadResponse

router = APIRouter(prefix="/tickets", tags=["attachments"])


# Allowed file extensions (shared with service)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip"}

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024


def _validate_extension(filename: str) -> tuple[bool, str]:
    """Validate file extension"""
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        return False, f"Extensão {ext} não permitida. Permitidas: {allowed}"
    return True, ""


def _validate_file_size(size: int, filename: str) -> tuple[bool, str]:
    """Validate file size"""
    if size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / 1024 / 1024
        return False, f"Arquivo {filename} excede limite de {max_mb}MB"
    return True, ""


@router.post("/{ticket_id}/attachments", response_model=AttachmentsUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachments(
    ticket_id: str,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload multiple file attachments to a ticket.

    - No limit on number of files
    - Max 10MB per file
    - Allowed types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt, zip

    If any file fails validation, no files are uploaded (transaction).
    """

    # Validate ticket exists and belongs to user's company
    result = await db.execute(select(Ticket).where(Ticket.id == int(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    # Check company access
    if ticket.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    # Validate all files before uploading
    files_data: List[tuple] = []
    errors: List[str] = []

    for file in files:
        # Validate extension
        is_valid, error = _validate_extension(file.filename)
        if not is_valid:
            errors.append(error)
            continue

        # Read content and validate size
        content = await file.read()
        is_valid, error = _validate_file_size(len(content), file.filename)
        if not is_valid:
            errors.append(error)
            continue

        files_data.append((file.filename, content, file.content_type or "application/octet-stream"))

    # If any errors, return 400 with all errors
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Erro na validação dos arquivos", "errors": errors},
        )

    # Upload all files in batch
    service = AttachmentService(db)

    try:
        attachments = await service.upload_attachments_batch(
            ticket_id=ticket.id,
            company_id=ticket.company_id,
            files=files_data,
            uploaded_by=current_user.id,
        )
        background_tasks.add_task(
            generate_pending_ai_response_background,
            ticket.id,
            True,
        )

        return AttachmentsUploadResponse(
            attachments=[
                AttachmentResponse(
                    id=att.id,
                    filename=att.original_filename,
                    file_size=att.file_size,
                    mime_type=att.mime_type,
                )
                for att in attachments
            ]
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao salvar anexo: {str(e)}",
        )


@router.get("/{ticket_id}/attachments", response_model=dict)
async def list_attachments(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all attachments for a ticket"""

    # Validate ticket belongs to user
    result = await db.execute(select(Ticket).where(Ticket.id == int(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    # Check company access
    if ticket.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    service = AttachmentService(db)
    attachments = await service.get_ticket_attachments(int(ticket_id))

    # Get uploader names
    attachments_data = []
    for att in attachments:
        # Get uploader info
        uploader_name = "Usuário"
        if att.uploaded_by:
            user_result = await db.execute(
                select(User).where(User.id == att.uploaded_by)
            )
            user = user_result.scalar_one_or_none()
            if user:
                uploader_name = user.full_name or user.email or "Usuário"

        attachments_data.append(
            AttachmentListResponse(
                id=att.id,
                filename=att.original_filename,
                file_size=att.file_size,
                mime_type=att.mime_type,
                uploaded_by={"id": att.uploaded_by, "name": uploader_name} if att.uploaded_by else None,
                created_at=att.created_at,
                storage_url=f"/uploads/{ticket.company_id}/tickets/{ticket.id}/{os.path.basename(att.storage_path)}",
            )
        )

    return {"attachments": attachments_data}


@router.delete("/{ticket_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    ticket_id: str,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an attachment"""

    # Validate ticket belongs to user
    result = await db.execute(select(Ticket).where(Ticket.id == int(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    # Check company access
    if ticket.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    service = AttachmentService(db)
    attachment = await service.get_attachment(attachment_id)

    if not attachment or attachment.ticket_id != int(ticket_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anexo não encontrado",
        )

    # Check if user has permission (is uploader or admin/superadmin)
    is_owner = attachment.uploaded_by == current_user.id
    is_admin = current_user.role in ["admin", "superadmin"]

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar este anexo",
        )

    success = await service.delete_attachment(attachment_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anexo não encontrado",
        )


@router.get("/{ticket_id}/attachments/stats")
async def get_attachment_stats(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get attachment statistics for a ticket"""

    # Validate ticket belongs to user
    result = await db.execute(select(Ticket).where(Ticket.id == int(ticket_id)))
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    # Check company access
    if ticket.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket não encontrado",
        )

    service = AttachmentService(db)
    stats = await service.get_attachment_stats(int(ticket_id))

    return stats
