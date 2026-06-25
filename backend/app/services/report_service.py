from app.db.models import TopicPerformance, QuizSession, User
from sqlalchemy.orm import Session


def generate_report(user_id: int, db: Session):

    # ---------------- USER INFO ----------------
    user = db.query(User).filter(User.id == user_id).first()

    # ---------------- TOPIC DATA ----------------
    topics = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id
    ).all()

    # ---------------- QUIZ SESSIONS ----------------
    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user_id,
        QuizSession.percentage.isnot(None)
    ).all()

    total_quizzes = len(sessions)

    valid_sessions = [s for s in sessions if s.percentage is not None]

    avg_score = (
        sum([s.percentage for s in valid_sessions]) / len(valid_sessions)
        if valid_sessions else 0
    )

    # ---------------- LAST QUIZ DATE ----------------
    last_attempt_date = None
    if valid_sessions:
        last_attempt_date = max(s.created_at for s in valid_sessions)

    # ---------------- STRONG / WEAK ----------------
    strong = []
    weak = []

    for t in topics:
        if t.avg_score >= 0.7:
            strong.append(t.topic)
        elif t.avg_score <= 0.4:
            weak.append(t.topic)

    # ---------------- AI INSIGHT (OPTIONAL BUT RECOMMENDED) ----------------
    ai_insight = "Keep practicing consistently."

    if strong and weak:
        ai_insight = (
            f"You are strong in {strong[0]} but need improvement in {weak[0]}."
        )

    return {
        # ---------------- USER INFO ----------------
        "name": user.name if user else "Student",
        "email": user.email if user else "",
        "college": user.college if user else "",
        "department": user.department if user else "",

        # ---------------- PERFORMANCE ----------------
        "total_quizzes": total_quizzes,
        "average_score": round(avg_score, 2),
        "last_taken": last_attempt_date,

        # ---------------- INSIGHTS ----------------
        "strong_topics": strong,
        "weak_topics": weak,
        "ai_insight": ai_insight
    }