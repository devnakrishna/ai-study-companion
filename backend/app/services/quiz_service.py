import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.ai.langchain_config import llm
from app.utils.validators.validator import validate_questions
from app.prompts.prompt import quiz_prompt

quiz_prompt = PromptTemplate(
    input_variables=["topic", "level"],
    template="""
You are a quiz generator.

Generate:
- 8 MCQ questions with correct answers
- 2 descriptive questions

Topic: {topic}
Difficulty: {level}

Return ONLY valid JSON:

{{
  "mcq": [
    {{
      "question": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "",
      "topic": ""
    }}
  ],
  "descriptive": [
    {{
      "question": "",
      "topic": ""
    }}
  ]
}}
"""
)


def get_chain():
    return quiz_prompt | llm | StrOutputParser()


def generate_quiz(request):
    try:
        chain = get_chain()

        raw_output = chain.invoke({
            "topic": request.topic,
            "level": request.level
        })

        print("RAW OUTPUT:", raw_output)

        cleaned = raw_output.replace("```json", "").replace("```", "").strip()

        # safer JSON extraction
        import re
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)

        if not match:
            raise Exception("No valid JSON found")

        parsed = json.loads(match.group())

        print("PARSED:", parsed)

        
        print("Validation skipped for stability")

        formatted_questions = []

        for q in parsed["mcq"]:
            formatted_questions.append({
                "type": "MultiSelect",
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q.get("correct_answer", ""),
                "topic": q.get("topic", "General"),
                "answer": ""
            })

        for q in parsed["descriptive"]:
            formatted_questions.append({
                "type": "Long Answer",
                "question": q["question"],
                "topic": q.get("topic", "General"),
                "answer": ""
            })

        with open("latest_quiz.json", "w") as f:
            json.dump(formatted_questions, f, indent=2)

        return formatted_questions

    except Exception as e:
        print("ERROR:", str(e))
        raise e