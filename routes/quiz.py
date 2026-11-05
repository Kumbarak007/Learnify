from flask import Blueprint, request, jsonify
import json

from services.ai_service import AIService
from services.quiz_prompt import build_quiz_prompt

quiz_bp = Blueprint("quiz", __name__)


@quiz_bp.route("/generate-quiz", methods=["POST"])
def generate_quiz():

    try:

        data = request.get_json()

        concept = data.get("concept", "")
        explanation = data.get("explanation", "")

        if not concept or not explanation:

            return jsonify({
                "error": "Concept and explanation are required."
            }), 400

        prompt = build_quiz_prompt(concept, explanation)

        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]

        ai_response = AIService.generate_response(messages)

        quiz_data = json.loads(ai_response)

        return jsonify(quiz_data)

    except json.JSONDecodeError:

        return jsonify({
            "error": "AI returned an invalid quiz format."
        }), 500

    except Exception as e:

        print(e)

        return jsonify({
            "error": "Unable to generate quiz."
        }), 500