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


def get_langfuse_prompt(
    name: str,
    *,
    fallback: str,
    label: str = "production",
    cache_ttl_seconds: int = 60,
):
    """
    Fetch a production prompt from Langfuse Prompt Management.

    The SDK caches prompts client-side. On any Langfuse/network issue, callers can
    still use the provided fallback text.
    """
    langfuse = get_langfuse_client()
    if not langfuse:
        return None

    try:
        return langfuse.get_prompt(
            name,
            label=label,
            type="text",
            fallback=fallback,
            cache_ttl_seconds=cache_ttl_seconds,
        )
    except Exception as exc:
        print(f"Langfuse prompt fetch failed for {name}: {exc}")
        return None


def compile_langfuse_prompt(prompt_client, fallback: str, **variables) -> str:
    def compile_template(template: str) -> str:
        result = template or fallback
        for key, value in variables.items():
            result = result.replace(
                f"{{{{{key}}}}}",
                "" if value is None else str(value),
            )
        return result

    if not prompt_client:
        return compile_template(fallback)

    try:
        compiled = prompt_client.compile(**variables)
        if isinstance(compiled, str) and compiled.strip():
            return compiled
        return compile_template(getattr(prompt_client, "prompt", None) or fallback)
    except Exception as exc:
        print(f"Langfuse prompt compile failed: {exc}")
        return compile_template(getattr(prompt_client, "prompt", None) or fallback)


def confidence_to_score(confidence: str) -> float:
    return {
        "high": 0.9,
        "alta": 0.9,
        "medium": 0.6,
        "media": 0.6,
        "média": 0.6,
        "low": 0.3,
        "baixa": 0.3,
    }.get((confidence or "").lower(), 0.5)


def create_langfuse_score(
    *,
    trace_id: str,
    name: str,
    value,
    data_type: str = "NUMERIC",
    comment: str | None = None,
) -> None:
    langfuse = get_langfuse_client()
    if not langfuse:
        return

    try:
        langfuse.score(
            trace_id=trace_id,
            name=name,
            value=value,
            data_type=data_type,
            comment=comment,
        )
        langfuse.flush()
    except Exception as exc:
        print(f"Langfuse score failed for {name}: {exc}")
