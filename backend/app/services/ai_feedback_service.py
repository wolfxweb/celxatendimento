"""
AI Feedback Service

Handles feedback collection for AI responses to improve the model over time.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ticket_ai_response import TicketAIResponse
from app.models.ai_feedback_log import AIFeedbackLog


class AIFeedbackService:
    """Service for managing AI response feedback"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def submit_feedback(
        self,
        ticket_id: uuid.UUID,
        agent_id: uuid.UUID,
        rating: int,
        feedback_text: Optional[str] = None,
        is_example_good: bool = False,
        is_example_bad: bool = False,
    ) -> dict:
        """
        Submit feedback for an AI response.

        Args:
            ticket_id: UUID of the ticket
            agent_id: UUID of the agent providing feedback
            rating: 1-5 rating
            feedback_text: Optional textual feedback
            is_example_good: Mark as good training example
            is_example_bad: Mark as bad training example

        Returns:
            dict with status and updated response
        """

        # Get pending AI response for this ticket
        result = await self.db.execute(
            select(TicketAIResponse)
            .where(
                and_(
                    TicketAIResponse.ticket_id == ticket_id,
                    TicketAIResponse.status.in_(["pending", "approved", "edited"]),
                )
            )
            .order_by(TicketAIResponse.created_at.desc())
        )
        ai_response = result.scalar_one_or_none()

        if not ai_response:
            return {
                "status": "error",
                "message": "No AI response found for this ticket",
            }

        # Validate rating
        if not 1 <= rating <= 5:
            return {"status": "error", "message": "Rating must be between 1 and 5"}

        # Store previous state for log
        previous_state = {
            "ai_rating": ai_response.ai_rating,
            "ai_feedback": ai_response.ai_feedback,
            "is_example_good": ai_response.is_example_good,
            "is_example_bad": ai_response.is_example_bad,
        }

        # Update AI response with feedback
        ai_response.ai_rating = rating
        ai_response.ai_feedback = feedback_text
        ai_response.is_example_good = is_example_good
        ai_response.is_example_bad = is_example_bad

        # Create feedback log entry
        new_state = {
            "ai_rating": rating,
            "ai_feedback": feedback_text,
            "is_example_good": is_example_good,
            "is_example_bad": is_example_bad,
        }

        feedback_log = AIFeedbackLog(
            ticket_id=ticket_id,
            ai_response_id=ai_response.id,
            agent_id=agent_id,
            action="rated",
            previous_state=previous_state,
            new_state=new_state,
            rating=rating,
            feedback_text=feedback_text,
        )

        self.db.add(feedback_log)
        await self.db.commit()

        return {
            "status": "success",
            "message": "Feedback submitted successfully",
            "ai_response_id": ai_response.id,
        }

    async def mark_as_example(
        self,
        ticket_id: uuid.UUID,
        agent_id: uuid.UUID,
        is_good: bool,
        reason: Optional[str] = None,
    ) -> dict:
        """
        Mark an AI response as a good or bad example.

        Args:
            ticket_id: UUID of the ticket
            agent_id: UUID of the agent
            is_good: True for good example, False for bad
            reason: Optional reason for marking
        """

        result = await self.db.execute(
            select(TicketAIResponse)
            .where(
                and_(
                    TicketAIResponse.ticket_id == ticket_id,
                )
            )
            .order_by(TicketAIResponse.created_at.desc())
        )
        ai_response = result.scalar_one_or_none()

        if not ai_response:
            return {"status": "error", "message": "No AI response found"}

        action = "example_good" if is_good else "example_bad"

        # Update AI response
        if is_good:
            ai_response.is_example_good = True
            ai_response.is_example_bad = False
        else:
            ai_response.is_example_good = False
            ai_response.is_example_bad = True

        # Log the action
        feedback_log = AIFeedbackLog(
            ticket_id=ticket_id,
            ai_response_id=ai_response.id,
            agent_id=agent_id,
            action=action,
            feedback_text=reason,
        )

        self.db.add(feedback_log)
        await self.db.commit()

        return {
            "status": "success",
            "message": f"Marked as {'good' if is_good else 'bad'} example",
        }

    async def get_feedback_stats(
        self,
        company_id: int,
        days: int = 30,
    ) -> dict:
        """
        Get AI feedback statistics for a company.

        Args:
            company_id: UUID of the company
            days: Number of days to look back

        Returns:
            dict with statistics
        """
        from app.models.ticket import Ticket

        empty_stats = {
            "total_rated": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            "good_examples": 0,
            "bad_examples": 0,
        }

        try:
            # Get all AI responses for this company's tickets
            result = await self.db.execute(
                select(TicketAIResponse)
                .join(Ticket, Ticket.id == TicketAIResponse.ticket_id)
                .where(
                    and_(
                        Ticket.company_id == company_id,
                        TicketAIResponse.ai_rating.isnot(None),
                    )
                )
            )
        except SQLAlchemyError:
            await self.db.rollback()
            return empty_stats

        responses = result.scalars().all()

        if not responses:
            return empty_stats

        # Calculate statistics
        ratings = [r.ai_rating for r in responses if r.ai_rating]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0

        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            rating_distribution[r] = rating_distribution.get(r, 0) + 1

        good_examples = sum(1 for r in responses if r.is_example_good)
        bad_examples = sum(1 for r in responses if r.is_example_bad)

        return {
            "total_rated": len(responses),
            "average_rating": round(avg_rating, 2),
            "rating_distribution": rating_distribution,
            "good_examples": good_examples,
            "bad_examples": bad_examples,
        }

    async def get_training_examples(
        self,
        company_id: uuid.UUID,
        limit: int = 50,
    ) -> list[dict]:
        """
        Get AI responses marked as good examples for model training.

        Args:
            company_id: UUID of the company
            limit: Maximum number of examples to return

        Returns:
            list of good training examples
        """
        from app.models.ticket import Ticket

        result = await self.db.execute(
            select(TicketAIResponse)
            .join(Ticket, Ticket.id == TicketAIResponse.ticket_id)
            .where(
                and_(
                    Ticket.company_id == company_id,
                    TicketAIResponse.is_example_good == True,
                )
            )
            .order_by(TicketAIResponse.created_at.desc())
            .limit(limit)
        )
        responses = result.scalars().all()

        examples = []
        for r in responses:
            # Get ticket subject
            ticket_result = await self.db.execute(
                select(Ticket).where(Ticket.id == r.ticket_id)
            )
            ticket = ticket_result.scalar_one_or_none()

            examples.append(
                {
                    "id": r.id,
                    "ticket_subject": ticket.subject if ticket else None,
                    "ticket_description": ticket.description if ticket else None,
                    "response_text": r.response_text,
                    "context_used": r.context_used,
                    "rating": r.ai_rating,
                    "feedback": r.ai_feedback,
                    "created_at": r.created_at,
                }
            )

        return examples
