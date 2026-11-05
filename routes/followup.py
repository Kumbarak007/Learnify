from flask import Blueprint, request, jsonify

from services.ai_service import AIService
from services.prompt_builder import build_chat_prompt

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    concept = data.get("concept")
    explanation = data.get("explanation")
    question = data.get("question")

    prompt = build_chat_prompt(
        concept,
        explanation,
        question
    )

    try:

        response = AIService.generate_response(prompt)

        return jsonify({
            "reply": response
        })

    except Exception:

        return jsonify({
            "error": "Unable to generate response."
        }), 500