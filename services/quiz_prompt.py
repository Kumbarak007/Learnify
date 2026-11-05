def build_quiz_prompt(concept, explanation):

    return f"""
You are an expert teacher.

The student has already studied the following concept.

Concept:
{concept}

Explanation:
{explanation}

Generate exactly 5 multiple-choice questions.

Rules:

1. Each question must have exactly 4 options.
2. Only ONE option should be correct.
3. Return the index of the correct option (0-3), NOT the answer text.
4. After every question, explain why the correct answer is correct in 2-3 simple sentences.
5. Questions should test understanding, not memorization.

Return ONLY valid JSON.

{{
    "questions":[
        {{
            "question":"...",
            "options":[
                "...",
                "...",
                "...",
                "..."
            ],
            "correct_option":0,
            "explanation":"..."
        }}
    ]
}}

Do not include markdown.

Return only JSON.
"""