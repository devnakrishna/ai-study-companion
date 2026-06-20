from app.db.models import TopicPerformance, QuizSession
from sqlalchemy.orm import Session

def generate_report(user_id: int, db: Session):

    topics = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id
    ).all()

    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user_id
    ).all()

    total_quizzes = len(sessions)
    valid_sessions = [s for s in sessions if s.percentage is not None]
    avg_score = (
        sum([s.percentage for s in valid_sessions]) / len(valid_sessions)
        if valid_sessions else 0
    )

    strong = []
    weak = []

    for t in topics:
        if t.avg_score >= 0.7:
            strong.append(t.topic)
        elif t.avg_score <= 0.4:
            weak.append(t.topic)

    return {
        "total_quizzes": total_quizzes,
        "average_score": round(avg_score, 2),
        "strong_topics": strong,
        "weak_topics": weak
    }