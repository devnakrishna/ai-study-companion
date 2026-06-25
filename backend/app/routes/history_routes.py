from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicPerformance, QuizSession

router = APIRouter()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicPerformance, QuizSession

router = APIRouter()

@router.get("/history/{user_id}")
def get_full_history(user_id: int, db: Session = Depends(get_db)):

    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user_id,
        QuizSession.percentage != None
    ).order_by(QuizSession.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "topic": s.topic,
            "level": s.level,
            "score": s.score,
            "percentage": s.percentage,
            "total_questions": s.total_questions,
            "created_at": str(s.created_at)
        }
        for s in sessions
    ]