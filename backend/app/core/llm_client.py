"""
Thin wrapper around the Groq chat completion API.
Kept separate from agent logic so the LLM provider can be swapped
(OpenAI / Groq / local model) without touching the agent graph.
"""
import os
from groq import Groq

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to your .env file (see .env.example) or environment variables."
        )
    if _client is None or getattr(_client, "api_key", None) != api_key:
        _client = Groq(api_key=api_key)
    return _client


def chat(messages: list[dict], temperature: float = 0.2, max_tokens: int = 1500) -> str:
    """
    messages: list of {"role": "system"|"user"|"assistant", "content": str}
    Returns the assistant's text response.
    """
    client = get_client()
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise
