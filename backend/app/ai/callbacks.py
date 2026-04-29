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


def get_openai_usage_details(payload: dict) -> dict:
    """
    Normalize OpenAI/OpenRouter token usage for Langfuse.

    Langfuse v2 accepts OpenAI-style usage keys and maps them to
    prompt/completion/total token columns.
    """
    usage = payload.get("usage") or {}
    usage_details = {}

    for key in ("prompt_tokens", "completion_tokens", "total_tokens"):
        value = usage.get(key)
        if isinstance(value, int):
            usage_details[key] = value

    return usage_details


def get_langfuse_model_usage(payload: dict) -> dict:
    """
    Convert OpenAI/OpenRouter usage to Langfuse SDK v2 ModelUsage.
    """
    usage = payload.get("usage") or {}
    model_usage = {}

    if isinstance(usage.get("prompt_tokens"), int):
        model_usage["input"] = usage["prompt_tokens"]
    if isinstance(usage.get("completion_tokens"), int):
        model_usage["output"] = usage["completion_tokens"]
    if isinstance(usage.get("total_tokens"), int):
        model_usage["total"] = usage["total_tokens"]

    if model_usage:
        model_usage["unit"] = "TOKENS"

    cost_details = usage.get("cost_details") or {}
    if isinstance(cost_details, dict):
        prompt_cost = cost_details.get("upstream_inference_prompt_cost")
        completion_cost = cost_details.get("upstream_inference_completions_cost")
        if isinstance(prompt_cost, (int, float)):
            model_usage["input_cost"] = float(prompt_cost)
        if isinstance(completion_cost, (int, float)):
            model_usage["output_cost"] = float(completion_cost)

    total_cost = usage.get("cost")
    if isinstance(total_cost, (int, float)):
        model_usage["total_cost"] = float(total_cost)

    return model_usage
