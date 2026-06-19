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
    avg_score = sum([s.score for s in sessions]) / total_quizzes if total_quizzes else 0

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