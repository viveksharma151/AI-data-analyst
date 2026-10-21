"""
Centralized configuration for the AI Data Analyst backend.
All secrets are read from environment variables -- nothing is hardcoded.
"""
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM configuration (Groq -- fast + free tier, OpenAI-compatible API)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # App
    APP_NAME: str = "AI Data Analyst"
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "50"))
    MAX_ROWS_PREVIEW: int = 20

    # Storage (defaults to temporary directory to support serverless/cloud/local seamlessly)
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "ai_analyst", "uploads"))
    SESSION_DIR: str = os.getenv("SESSION_DIR", os.path.join(tempfile.gettempdir(), "ai_analyst", "sessions"))

    # Cache
    ENABLE_CACHE: bool = os.getenv("ENABLE_CACHE", "true").lower() == "true"

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()

try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.SESSION_DIR, exist_ok=True)
except Exception:
    settings.UPLOAD_DIR = tempfile.mkdtemp()
    settings.SESSION_DIR = tempfile.mkdtemp()
