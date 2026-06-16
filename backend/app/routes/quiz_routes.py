from fastapi import APIRouter
from app.schemas.quiz_schema import QuizRequest
from app.services.quiz_service import generate_quiz
from app.services.evaluation_service import evaluate_answers

import json
from pathlib import Path
from fastapi import Body

router = APIRouter()

@router.post("/generate")
def generate(request: QuizRequest):
    return generate_quiz(request.topic,request.level)

@router.post("/submit")
def  submit_quiz(submission: list=Body(...)):

    file_path = Path("submissions.json")

    if file_path.exists():
        with open(file_path, "r") as f:
            data = json.load(f)
    else:
        data = []

    data.append(submission)

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

    return {"message": "Submission saved",
            "submission": submission
    }