"""
Langfuse callback handler for LangChain tracing
"""

from typing import Optional
from langfuse.callback import CallbackHandler
from langfuse import Langfuse
import os


def get_langfuse_handler() -> Optional[CallbackHandler]:
    """
    Retorna callback handler para Langfuse tracing.

    Returns None se LANGFUSE_ENABLE=false ou se as chaves não estão configuradas.
    """
    if os.getenv("LANGFUSE_ENABLE", "true").lower() != "true":
        return None

    public_key = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY", "")

    if not public_key or not secret_key:
        return None

    return CallbackHandler(
        public_key=public_key,
        secret_key=secret_key,
        host=os.getenv("LANGFUSE_HOST", "http://langfuse:3000"),
    )


def get_langfuse_callbacks() -> list:
    """
    Retorna lista de callbacks para passar para LangChain.
    Se Langfuse não estiver configurado, retorna lista vazia.
    """
    handler = get_langfuse_handler()
    return [handler] if handler else []


def get_langfuse_client() -> Optional[Langfuse]:
    """
    Retorna cliente Langfuse para rastrear chamadas feitas fora do LangChain.
    """
    if os.getenv("LANGFUSE_ENABLE", "true").lower() != "true":
        return None

    public_key = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY", "")

    if not public_key or not secret_key:
        return None

    return Langfuse(
        public_key=public_key,
        secret_key=secret_key,
        host=os.getenv("LANGFUSE_HOST", "http://langfuse:3000"),
    )
