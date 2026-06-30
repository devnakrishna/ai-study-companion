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

    # ---------------- TOPICS & GRADES ----------------
    topic_details = []
    for t in topics:
        avg_pct = round(t.avg_score * 100, 2)
        
        # Grading Scale
        if avg_pct >= 90:
            grade = "A+"
        elif avg_pct >= 80:
            grade = "A"
        elif avg_pct >= 70:
            grade = "B"
        elif avg_pct >= 60:
            grade = "C"
        elif avg_pct >= 50:
            grade = "D"
        else:
            grade = "F"
            
        # Interactive breakdown calculations
        sessions_for_topic = [s for s in sessions if s.topic.lower() == t.topic.lower()]
        best_pct = round(max([s.percentage for s in sessions_for_topic]), 2) if sessions_for_topic else avg_pct
        total_questions_attempted = sum([s.total_questions for s in sessions_for_topic if s.total_questions])
        
        # Calculate simulated duration
        total_duration_secs = 0
        for s in sessions_for_topic:
            if s.created_at and s.updated_at:
                diff = (s.updated_at - s.created_at).total_seconds()
                if diff > 0:
                    total_duration_secs += diff
        
        if total_duration_secs <= 0:
            total_duration_secs = total_questions_attempted * 35  # fallback 35s per question
            
        avg_time_str = f"{int(total_duration_secs // 60)}m {int(total_duration_secs % 60)}s" if total_duration_secs > 0 else "3m 30s"
        
        if avg_pct >= 85:
            areas_of_improvement = "Concepts are highly clear. Focus on speed and mock assessment accuracy."
        elif avg_pct >= 70:
            areas_of_improvement = "Solid comprehension. Review weak areas from quizzes and focus on edge-case scenarios."
        elif avg_pct >= 50:
            areas_of_improvement = "Requires standard revision. Revisit definitions and basic practice sets."
        else:
            areas_of_improvement = "Critical knowledge gaps. Recommend repeating practice sets on beginner topics and reading introductory resources."
            
        topic_details.append({
            "subject": t.topic,
            "average_score": avg_pct,
            "attempts": t.total_attempts,
            "grade": grade,
            "remarks": "Excellent" if avg_pct >= 80 else "Good" if avg_pct >= 60 else "Pass" if avg_pct >= 50 else "Needs Improvement",
            
            # Interactive details
            "best_score": best_pct,
            "total_questions_attempted": total_questions_attempted,
            "average_time_spent": avg_time_str,
            "areas_of_improvement": areas_of_improvement
        })

    # Division Calculations
    
    
    if avg_score >= 75:
        overall_division = "First Class with Distinction"
    elif avg_score >= 60:
        overall_division = "First Class"
    elif avg_score >= 50:
        overall_division = "Second Class"
    elif avg_score >= 40:
        overall_division = "Pass Class"
    else:
        overall_division = "Fail"

    return {
        # ---------------- USER INFO ----------------
        "name": f"{user.first_name or ''} {user.last_name or ''}".strip() if user else "Student",
        "email": user.email if user else "",
        "college": user.college.name if (user and user.college) else "",
        "department": user.department if user else "",
        "profile_pic": user.profile_pic if user else None,

        # ---------------- PERFORMANCE ----------------
        "total_quizzes": total_quizzes,
        "average_score": round(avg_score, 2),
        "division": overall_division,
        
        # ---------------- TOPIC DATA ----------------
        "topics": topic_details
    }