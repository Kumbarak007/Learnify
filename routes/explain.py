from flask import Blueprint, request, jsonify
import json

from services.ai_service import AIService
from services.prompt_builder import build_explanation_prompt
import traceback
explain_bp = Blueprint("explain", __name__)


@explain_bp.route("/explain", methods=["POST"])
def explain():

    try:
        data = request.get_json()

        subject = data.get("subject", "General")
        grade = data.get("grade", "General")
        concept = data.get("concept", "").strip()

        if not concept:
            return jsonify({"error": "Please enter a concept."}), 400

        # Build the AI prompt
        prompt = build_explanation_prompt(subject, grade, concept)

        # Get AI response
        messages = [
         {
            "role": "user",
            "content": prompt
          }
        ]

        ai_response = AIService.generate_response(messages)

        # Convert JSON string to Python dictionary
        response_data = json.loads(ai_response)

        return jsonify(response_data)

    except json.JSONDecodeError:
        return jsonify({
            "error": "AI returned an invalid response. Please try again."
        }), 500

    except Exception as e:
        traceback.print_exc()

        return jsonify({
            "error": "Something went wrong. Please try again."
        }), 500