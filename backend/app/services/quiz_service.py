import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.ai.langchain_config import llm
from app.utils.validators.validator import validate_questions
from app.prompts.quiz_prompt import QUIZ_TEMPLATE

quiz_prompt = PromptTemplate(
    input_variables=["topic", "level"],
    template=QUIZ_TEMPLATE
)
parser = StrOutputParser()
quiz_chain = quiz_prompt | llm | parser


def generate_quiz(topic, level):

    response = quiz_chain.invoke({
        "topic": topic,
        "level": level
    })

    try:
        cleaned = response.strip().replace("```json", "").replace("```", "")
        questions = json.loads(cleaned)

        validate_questions(questions)

        with open("latest_quiz.json", "w") as f:
            json.dump(questions, f, indent=4)

        return questions

    except Exception:
        return {
            "error": "Failed to generate quiz"
        }