from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicPerformance, QuizSession

router = APIRouter()


@router.get("/topic-performance/{user_id}")
def get_topic_performance(user_id: int, db: Session = Depends(get_db)):
    

    records = db.query(TopicPerformance).filter(
    TopicPerformance.user_id == user_id
).all()

    return [
        {
            "topic": r.topic,
            "avg_score": round(r.avg_score * 100, 2),   
            "last_score": round(r.last_score * 100, 2),
            "attempts": r.total_attempts
        }
        for r in records
    ]

@router.get("/topic-history/{user_id}/{topic}")
def get_topic_history(user_id: int, topic: str, db: Session = Depends(get_db)):

    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user_id,   # 🔥 CRITICAL FIX
        QuizSession.topic == topic,
        QuizSession.percentage != None
    ).order_by(QuizSession.id.desc()).all()

    return [
        {
            "id": s.id,
            "score": s.score,
            "percentage": s.percentage,
            "created_at": str(s.created_at)
        }
        for s in sessions
    ]
  
  