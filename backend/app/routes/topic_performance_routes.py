from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import TopicPerformance

router = APIRouter()


@router.get("/topic-performance")
def get_topic_performance(db: Session = Depends(get_db)):

    records = db.query(TopicPerformance).all()

    return [
        {
            "topic": r.topic,
            "avg_score": round(r.avg_score * 100, 2),   # ✅ convert here
            "last_score": round(r.last_score * 100, 2),
            "attempts": r.total_attempts
        }
        for r in records
    ]