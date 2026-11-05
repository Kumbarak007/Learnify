import requests
from config import OPENROUTER_API_KEY, OPENROUTER_URL, MODEL_NAME


class AIService:

    @staticmethod
    def generate_response(messages):

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "ConceptCraft"
        }

        payload = {
            "model": MODEL_NAME,
            "messages": messages,
            "temperature": 0.6
        }

        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]