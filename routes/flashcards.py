from flask import Blueprint, request, jsonify
import json

from services.ai_service import AIService
from services.prompt_builder import build_flashcard_prompt

flashcard_bp = Blueprint("flashcards", __name__)


@flashcard_bp.route("/generate-flashcards", methods=["POST"])
def generate_flashcards():

    data = request.get_json()

    concept = data["concept"]
    explanation = data["explanation"]

    prompt = build_flashcard_prompt(
        concept,
        explanation
    )

    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    ai_response = AIService.generate_response(messages)

    return jsonify(json.loads(ai_response))