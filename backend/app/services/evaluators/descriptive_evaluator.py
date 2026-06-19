import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.ai.langchain_config import llm
from app.prompts.evaluation_prompt import EVALUATION_TEMPLATE

prompt = PromptTemplate(
    input_variables=["questions"],
    template=EVALUATION_TEMPLATE
)

parser = StrOutputParser()
evaluation_chain = prompt | llm | parser


def evaluate_descriptive_batch(inputs):
    try:
        result = evaluation_chain.invoke({
            "questions": json.dumps(inputs, indent=2)
        })

        cleaned = result.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned)

    except Exception as e:
        print("EVALUATION ERROR:", e)

        return [
            {"score": 0, "feedback": "Evaluation failed"}
            for _ in inputs
        ]