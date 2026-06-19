from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import QuizSession

router = APIRouter()

@router.get("/history")
def get_history(db: Session = Depends(get_db)):

    sessions = db.query(QuizSession).order_by(
        QuizSession.created_at.desc()
    ).all()

    return [
        {
            "id": s.id,
            "topic": s.topic,
            "score": s.score,
            "percentage": round((s.score / s.total_questions) * 100, 2)
            if s.total_questions else 0,
            "date": s.created_at
        }
        for s in sessions
    ]