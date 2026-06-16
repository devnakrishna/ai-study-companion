from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.ai.langchain_config import llm
from app.prompts.evaluation_prompt import EVALUATION_TEMPLATE
# Prompt Template
evaluation_prompt = PromptTemplate(
    input_variables=["question", "correct_answer", "user_answer"],
    template=EVALUATION_TEMPLATE
)

# Output Parser
parser = JsonOutputParser()

# Chain
evaluation_chain = evaluation_prompt | llm | parser


def evaluate_descriptive(question, correct_answer, user_answer):
    try:
        result = evaluation_chain.invoke({
            "question": question,
            "correct_answer": correct_answer,
            "user_answer": user_answer
        })
        return result

    except Exception as e:
        print("EVALUATION ERROR:", e)
    return {
        "score": 0,
        "feedback": "Evaluation failed"
    }
