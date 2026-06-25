from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, QuizSession, TopicPerformance

router = APIRouter()


@router.get("/dashboard/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user_id
    ).all()

    topics = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id
    ).all()

    total_quizzes = len(sessions)

    avg_score = 0
    valid = [s for s in sessions if s.percentage is not None]
    if valid:
        avg_score = sum([s.percentage for s in valid]) / len(valid)

    strong = []
    weak = []

    for t in topics:
        if t.avg_score >= 0.7:
            strong.append(t.topic)
        elif t.avg_score <= 0.4:
            weak.append(t.topic)

    recent_sessions = [
        {
            "topic": s.topic,
            "score": s.percentage
        }
        for s in sessions[-5:]
    ]

    return {
        "name": user.name,
        "college": user.college,
        "department": user.department,

        "total_quizzes": total_quizzes,
        "average_score": round(avg_score, 2),

        "strong_topics": strong,
        "weak_topics": weak,

        "recent_sessions": recent_sessions
    }