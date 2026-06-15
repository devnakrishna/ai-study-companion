import os
from dotenv import load_dotenv
from typing import List
import google.generativeai as genai

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

settings = Settings()

def configure_gemini():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.GEMINI_API_KEY)