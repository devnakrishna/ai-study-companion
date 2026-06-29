from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import QuizSession
from app.services.evaluation_service import get_session_results
from app.core.security import get_current_user

router = APIRouter()


@router.get("/history/{user_id}")
def get_full_history(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):

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


@router.get("/history/session/{session_id}")
def get_session_history(session_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    results = get_session_results(session_id, db)
    if not results:
        raise HTTPException(status_code=404, detail="Session not found")
    return results