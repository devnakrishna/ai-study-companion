from fastapi import APIRouter
from app.services.evaluation_service import evaluate_answers

router = APIRouter()

@router.post("/evaluate")
def evaluate():
    return evaluate_answers()