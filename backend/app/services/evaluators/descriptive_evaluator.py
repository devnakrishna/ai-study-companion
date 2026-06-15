import json
import google.generativeai as genai
from app.prompts.evaluation_prompt import get_descriptive_prompt

model = genai.GenerativeModel("gemini-3.1-flash-lite")


def evaluate_descriptive(question, user_answer):

    prompt = get_descriptive_prompt(question, user_answer)

    response = model.generate_content(prompt)

    try:
        cleaned = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)

    except:
        return {
            "score": 0,
            "feedback": "Could not evaluate answer",
            "strengths": "",
            "mistakes": "",
            "improvement": ""
        }