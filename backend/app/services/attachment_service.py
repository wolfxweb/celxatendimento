"""
Attachment Service

Handles file uploads and attachments for tickets and messages.
"""

import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ticket_attachment import TicketAttachment


class AttachmentService:
    """Service for managing ticket attachments"""

    # Allowed file extensions to MIME types mapping
    ALLOWED_EXTENSIONS = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".txt": "text/plain",
        ".zip": "application/zip",
    }

    # Max file size: 10MB
    MAX_FILE_SIZE = 10 * 1024 * 1024

    def __init__(self, db: AsyncSession):
        self.db = db

    def validate_file(
        self, filename: str, file_size: int
    ) -> Tuple[bool, str]:
        """Validate a file for upload. Returns (is_valid, error_message)."""

        # Check file size
        if file_size > self.MAX_FILE_SIZE:
            max_mb = self.MAX_FILE_SIZE / 1024 / 1024
            return (
                False,
                f"Arquivo {filename} excede limite de {max_mb}MB",
            )

        # Check file extension
        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in self.ALLOWED_EXTENSIONS:
            allowed = ", ".join(self.ALLOWED_EXTENSIONS.keys())
            return (
                False,
                f"Extensão {ext} não permitida. Permitidas: {allowed}",
            )

        # Check filename length
        if len(filename) > 255:
            return False, f"Nome do arquivo {filename} muito longo (max 255 caracteres)"

        return True, ""

    async def _save_locally(
        self,
        content: bytes,
        company_id: int,
        ticket_id: int,
        filename: str,
    ) -> str:
        """Save file to local storage with company/ticket structure."""

        # Create directory structure: ./uploads/{company_id}/tickets/{ticket_id}/
        upload_dir = os.path.join(
            os.getenv("ATTACHMENTS_UPLOAD_PATH", "./uploads"),
            str(company_id),
            "tickets",
            str(ticket_id),
        )
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join(upload_dir, filename)

        with open(filepath, "wb") as f:
            f.write(content)

        return filepath

    async def upload_attachments_batch(
        self,
        ticket_id: int,
        company_id: int,
        files: List[Tuple[str, bytes, str]],  # List of (filename, content, content_type)
        uploaded_by: int,
        message_id: Optional[int] = None,
    ) -> List[TicketAttachment]:
        """
        Upload multiple files in a single transaction.
        If any file fails validation, all files are rolled back.

        Args:
            ticket_id: ID of the ticket
            company_id: ID of the company
            files: List of tuples (filename, file_content, content_type)
            uploaded_by: ID of the user uploading
            message_id: Optional message ID if attachments are for a message

        Returns:
            List of created TicketAttachment records

        Raises:
            ValueError: If any file fails validation
        """
        created_attachments: List[TicketAttachment] = []
        file_paths_to_rollback: List[str] = []

        try:
            for filename, file_content, content_type in files:
                file_size = len(file_content)

                # Validate
                is_valid, error = self.validate_file(filename, file_size)
                if not is_valid:
                    raise ValueError(error)

                # Get extension and determine storage path
                ext = "." + filename.split(".")[-1].lower()
                mime_type = self.ALLOWED_EXTENSIONS.get(ext, content_type)

                # Generate unique filename
                unique_filename = f"{uuid.uuid4()}{ext}"

                # Save file locally
                storage_path = await self._save_locally(
                    file_content,
                    company_id,
                    ticket_id,
                    unique_filename,
                )
                file_paths_to_rollback.append(storage_path)

                # Create attachment record
                attachment = TicketAttachment(
                    ticket_id=ticket_id,
                    message_id=message_id,
                    filename=unique_filename,
                    original_filename=filename,
                    mime_type=mime_type,
                    file_size=file_size,
                    storage_provider="local",
                    storage_path=storage_path,
                    storage_url=f"/uploads/{company_id}/tickets/{ticket_id}/{unique_filename}",
                    uploaded_by=uploaded_by,
                    is_active=True,
                )

                self.db.add(attachment)
                created_attachments.append(attachment)

            # Update ticket timestamp
            from app.models.ticket import Ticket

            ticket_result = await self.db.execute(
                select(Ticket).where(Ticket.id == ticket_id)
            )
            ticket = ticket_result.scalar_one_or_none()
            if ticket:
                ticket.updated_at = datetime.utcnow()

            await self.db.commit()

            # Refresh all attachments
            for attachment in created_attachments:
                await self.db.refresh(attachment)

            return created_attachments

        except Exception as e:
            # Rollback transaction
            await self.db.rollback()

            # Delete any files that were saved
            for file_path in file_paths_to_rollback:
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except OSError:
                    pass

            raise e

    async def upload_attachment(
        self,
        ticket_id: int,
        file_content: bytes,
        filename: str,
        content_type: str,
        uploaded_by: int,
        company_id: int,
        message_id: Optional[int] = None,
    ) -> TicketAttachment:
        """
        Upload and save a single file attachment.

        Args:
            ticket_id: ID of the ticket
            file_content: Raw bytes of the file
            filename: Original filename
            content_type: MIME type
            uploaded_by: ID of the user uploading
            company_id: ID of the company
            message_id: Optional message ID if attachment is for a message

        Returns:
            Created TicketAttachment record

        Raises:
            ValueError: If file validation fails
        """
        file_size = len(file_content)

        # Validate
        is_valid, error = self.validate_file(filename, file_size)
        if not is_valid:
            raise ValueError(error)

        # Get extension
        ext = "." + filename.split(".")[-1].lower()
        mime_type = self.ALLOWED_EXTENSIONS.get(ext, content_type)

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{ext}"

        # Save locally
        storage_path = await self._save_locally(
            file_content,
            company_id,
            ticket_id,
            unique_filename,
        )

        # Create attachment record
        attachment = TicketAttachment(
            ticket_id=ticket_id,
            message_id=message_id,
            filename=unique_filename,
            original_filename=filename,
            mime_type=mime_type,
            file_size=file_size,
            storage_provider="local",
            storage_path=storage_path,
            storage_url=f"/uploads/{company_id}/tickets/{ticket_id}/{unique_filename}",
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
            ticket.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(attachment)

        return attachment

    async def get_attachment(self, attachment_id: int) -> Optional[TicketAttachment]:
        """Get attachment by ID"""
        result = await self.db.execute(
            select(TicketAttachment).where(TicketAttachment.id == attachment_id)
        )
        return result.scalar_one_or_none()

    async def get_ticket_attachments(
        self,
        ticket_id: int,
        message_id: Optional[int] = None,
    ) -> List[TicketAttachment]:
        """Get all active attachments for a ticket or message"""

        query = select(TicketAttachment).where(
            and_(
                TicketAttachment.ticket_id == ticket_id,
                TicketAttachment.is_active == True,
            )
        )

        if message_id:
            query = query.where(TicketAttachment.message_id == message_id)

        query = query.order_by(TicketAttachment.created_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def delete_attachment(self, attachment_id: int) -> bool:
        """Soft delete an attachment and remove physical file"""

        attachment = await self.get_attachment(attachment_id)
        if not attachment:
            return False

        # Soft delete
        attachment.is_active = False
        attachment.deleted_at = datetime.utcnow()

        await self.db.commit()

        # Remove physical file
        try:
            if os.path.exists(attachment.storage_path):
                os.remove(attachment.storage_path)
        except OSError:
            pass

        return True

    async def hard_delete_attachment(self, attachment_id: int) -> bool:
        """Hard delete an attachment (for cleanup)"""
        attachment = await self.get_attachment(attachment_id)
        if not attachment:
            return False

        # Remove physical file
        try:
            if os.path.exists(attachment.storage_path):
                os.remove(attachment.storage_path)
        except OSError:
            pass

        await self.db.delete(attachment)
        await self.db.commit()
        return True

    async def get_attachment_stats(self, ticket_id: int) -> dict:
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
