from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.evaluation_service import evaluate_answers
router = APIRouter()

@router.post("/evaluate/{session_id}")
def evaluate(session_id: int, db: Session = Depends(get_db)):
    return evaluate_answers(session_id, db)