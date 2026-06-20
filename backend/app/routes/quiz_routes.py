from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
import json

from app.schemas.quiz_schema import QuizRequest
from app.services.quiz_service import generate_quiz
from app.services.session_service import create_quiz_session, save_questions
from app.db.database import get_db
from app.db.models import UserAnswer, Question, QuizSession


router = APIRouter()


@router.post("/create-session")
def create_session(request: QuizRequest, db: Session = Depends(get_db)):
    
    level=request.level.lower()
  
    new_session = create_quiz_session(db, request.topic, level)
   
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

    total_score = 0

    for ans in submission:

        question_id = ans["question_id"]
        user_answer = ans["user_answer"]

        question = db.query(Question).filter(Question.id == question_id).first()

        if not question:
            continue
        is_correct = None
        marks = 0
        

        if question.question_type.lower() in["multiselect", "mcq","multiplechoice"]:
            if user_answer == question.correct_answer:
                is_correct = True
                marks = 1
            else:
                is_correct = False
                marks = 0

       
        new_answer = UserAnswer(
            session_id=session_id,
            question_id=question_id,
            user_answer=user_answer,
            is_correct=is_correct,
            marks_awarded=marks,
            created_by="system"
        )
        db.add(new_answer)

        total_score += marks

    db.commit()
    session = db.query(QuizSession).filter(QuizSession.id == session_id).first()

    if session:
        session.score = total_score
        db.commit()
    return {
        "message": "Answers submitted successfully",
        "score": total_score
    }