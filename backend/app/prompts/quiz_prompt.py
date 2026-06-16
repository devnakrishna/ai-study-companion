QUIZ_TEMPLATE = """
You are an AI quiz generator.

Generate:
- 8 MCQ questions (with 4 options and correct answer)
- 2 descriptive questions

Topic: {topic}
Difficulty: {level}

Requirements:
- Questions must match the topic and difficulty level
- Avoid repetition
- Ensure clarity and correctness
- Do NOT include explanations
- Return ONLY valid JSON

Return ONLY valid JSON in this format:

[
  {{
    "type": "MultiSelect",
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "string",
    "topic": "string"
  }},
  {{
    "type": "Long Answer",
    "question": "string",
    "correct_answer": "string",
    "topic": "string"
  }}
]
"""