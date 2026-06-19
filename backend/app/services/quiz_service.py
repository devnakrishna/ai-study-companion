import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.ai.langchain_config import llm
from app.utils.validators.validator import validate_questions
from app.prompts.quiz_prompt import QUIZ_TEMPLATE
from app.core.paths import QUIZ_FILE

from pathlib import Path

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
        cleaned = (
            response.strip()
            .replace("```json", "")
            .replace("```", "")
        )
        questions = json.loads(cleaned)

        if not validate_questions(questions):
            raise ValueError("Generated quiz failed validation")

        

        return questions

    except Exception as e:
         raise Exception(f"Quiz generation failed: {str(e)}")
       
