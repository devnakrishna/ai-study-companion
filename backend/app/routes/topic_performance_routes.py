from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicPerformance, QuizSession

router = APIRouter()


@router.get("/topic-performance")
def get_topic_performance(db: Session = Depends(get_db)):

    records = db.query(TopicPerformance).all()

    return [
        {
            "topic": r.topic,
            "avg_score": round(r.avg_score * 100, 2),   
            "last_score": round(r.last_score * 100, 2),
            "attempts": r.total_attempts
        }
        for r in records
    ]

@router.get("/topic-history/{topic}")
def get_topic_history(topic: str, db: Session = Depends(get_db)):

    sessions = db.query(QuizSession).filter(
        QuizSession.topic == topic,
        QuizSession.percentage != None   
    ).order_by(QuizSession.id.desc()).all()

    result = []

    for s in sessions:
        result.append({
            "id": s.id,
            "score": s.score,
            "percentage": s.percentage,
            "created_at": str(s.created_at)
        })

    return result