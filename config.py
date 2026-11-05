import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# AI Model
MODEL_NAME = "openai/gpt-4o-mini"