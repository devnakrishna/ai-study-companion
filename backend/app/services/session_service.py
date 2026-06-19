import json
from app.db.models import QuizSession, Question


def create_quiz_session(db, topic, level):
    new_session = QuizSession(
        user_id=1,
        topic=topic,
        level=level,
        total_questions=0,
        score=0,
        created_by="system"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


def save_questions(db, session_id, questions):
    for q in questions:
        new_question = Question(
            session_id=session_id,
            question_text=q["question"],
            question_type=q["type"],
            options=json.dumps(q.get("options")) if q.get("options") else None,
            correct_answer=q["correct_answer"],
            topic=q["topic"],
            created_by="system"
        )

        db.add(new_question)

    db.commit()