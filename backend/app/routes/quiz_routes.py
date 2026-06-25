from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
import json

from app.schemas.quiz_schema import QuizRequest
from app.services.quiz_service import generate_quiz
from app.services.evaluation_service import evaluate_answers
from app.services.session_service import create_quiz_session, save_questions
from app.db.database import get_db
from app.db.models import UserAnswer, Question, QuizSession


router = APIRouter()


@router.post("/create-session")
def create_session(request: QuizRequest, db: Session = Depends(get_db)):
    
    level=request.level.lower()
  
    new_session = create_quiz_session(db,request.user_id, request.topic, level)
   
    questions = generate_quiz(request.topic, level)
 
    save_questions(db, new_session.id, questions)
   
    new_session.total_questions = len(questions)
    db.commit()
    db_questions = db.query(Question).filter(
        Question.session_id == new_session.id
    ).all()

    formatted = [
        {
            "id": q.id,
            "question": q.question_text,
            "type": q.question_type,
            "options": json.loads(q.options) if q.options else [],
        }
        for q in db_questions
    ]



    return {
        "message": "Session and questions created",
        "session_id": new_session.id,
        "questions": formatted
    }
@router.post("/submit/{session_id}")
def submit_quiz(session_id: int, submission: list = Body(...), db: Session = Depends(get_db)):

    for ans in submission:
        question_id = ans["question_id"]
        user_answer = ans["user_answer"]

        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            continue

        is_correct = None
        marks = 0

        if question.question_type.lower() in ["multiselect", "mcq", "multiplechoice"]:
            is_correct = (user_answer == question.correct_answer)
            marks = 1 if is_correct else 0

        new_answer = UserAnswer(
            session_id=session_id,
            question_id=question_id,
            user_answer=user_answer,
            is_correct=is_correct,
            marks_awarded=marks,
            created_by="system"
        )
        db.add(new_answer)

    db.commit()
    result = evaluate_answers(session_id, db)

    return result
