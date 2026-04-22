"""
Attachment Service

Handles file uploads and attachments for tickets and messages.
"""

import os
import uuid
import aiofiles
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ticket_attachment import TicketAttachment


class AttachmentService:
    """Service for managing ticket attachments"""

    # Allowed file types
    ALLOWED_MIME_TYPES = {
        "application/pdf": ".pdf",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpeg": ".jpeg",
        "text/plain": ".txt",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    }

    # Max file size: 25MB
    MAX_FILE_SIZE = 25 * 1024 * 1024

    def __init__(self, db: AsyncSession):
        self.db = db

    def validate_file(
        self, filename: str, file_size: int, content_type: str
    ) -> tuple[bool, str]:
        """Validate a file for upload"""

        # Check file size
        if file_size > self.MAX_FILE_SIZE:
            return (
                False,
                f"File size exceeds maximum of {self.MAX_FILE_SIZE / 1024 / 1024}MB",
            )

        # Check file type
        if content_type not in self.ALLOWED_MIME_TYPES:
            return (
                False,
                f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_MIME_TYPES.keys())}",
            )

        # Check filename length
        if len(filename) > 255:
            return False, "Filename too long (max 255 characters)"

        return True, ""

    async def upload_attachment(
        self,
        ticket_id: uuid.UUID,
        file_content: bytes,
        filename: str,
        content_type: str,
        uploaded_by: uuid.UUID,
        message_id: Optional[int] = None,
    ) -> TicketAttachment:
        """
        Upload and save a file attachment.

        In production, this would upload to S3/GCS.
        For now, saves to local storage.
        """

        file_size = len(file_content)

        # Validate
        is_valid, error = self.validate_file(filename, file_size, content_type)
        if not is_valid:
            raise ValueError(error)

        # Generate unique filename
        ext = self.ALLOWED_MIME_TYPES.get(content_type, ".bin")
        unique_filename = f"{uuid.uuid4()}{ext}"

        # In production, upload to cloud storage
        # For now, save locally
        storage_path = await self._save_locally(unique_filename, file_content)

        # Create attachment record
        attachment = TicketAttachment(
            ticket_id=ticket_id,
            message_id=message_id,
            filename=unique_filename,
            original_filename=filename,
            mime_type=content_type,
            file_size=file_size,
            storage_provider="local",
            storage_path=storage_path,
            storage_url=f"/uploads/{unique_filename}",
            uploaded_by=uploaded_by,
            is_active=True,
        )

        self.db.add(attachment)

        # Update ticket timestamp
        from app.models.ticket import Ticket

        ticket_result = await self.db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = ticket_result.scalar_one_or_none()
        if ticket:
            ticket.updated_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(attachment)

        return attachment

    async def _save_locally(self, filename: str, content: bytes) -> str:
        """Save file to local storage"""

        upload_dir = os.getenv("UPLOAD_DIR", "/tmp/celx-uploads")
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join(upload_dir, filename)

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)

        return filepath

    async def get_attachment(self, attachment_id: int) -> Optional[TicketAttachment]:
        """Get attachment by ID"""
        result = await self.db.execute(
            select(TicketAttachment).where(TicketAttachment.id == attachment_id)
        )
        return result.scalar_one_or_none()

    async def get_ticket_attachments(
        self,
        ticket_id: uuid.UUID,
        message_id: Optional[int] = None,
    ) -> List[TicketAttachment]:
        """Get all attachments for a ticket or message"""

        query = select(TicketAttachment).where(
            and_(
                TicketAttachment.ticket_id == ticket_id,
                TicketAttachment.is_active == True,
            )
        )

        if message_id:
            query = query.where(TicketAttachment.message_id == message_id)

        query = query.order_by(TicketAttachment.uploaded_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def delete_attachment(self, attachment_id: int) -> bool:
        """Soft delete an attachment"""

        attachment = await self.get_attachment(attachment_id)
        if not attachment:
            return False

        attachment.is_active = False
        attachment.deleted_at = datetime.now()

        await self.db.commit()
        return True

    async def get_attachment_stats(self, ticket_id: uuid.UUID) -> dict:
        """Get attachment statistics for a ticket"""

        attachments = await self.get_ticket_attachments(ticket_id)

        total_size = sum(a.file_size for a in attachments)
        by_type = {}

        for att in attachments:
            ext = os.path.splitext(att.original_filename)[1].lower()
            if ext not in by_type:
                by_type[ext] = {"count": 0, "total_size": 0}
            by_type[ext]["count"] += 1
            by_type[ext]["total_size"] += att.file_size

        return {
            "total_attachments": len(attachments),
            "total_size_bytes": total_size,
            "total_size_formatted": self._format_size(total_size),
            "by_type": by_type,
        }

    def _format_size(self, size_bytes: int) -> str:
        """Format bytes to human readable string"""
        for unit in ["B", "KB", "MB", "GB"]:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"
