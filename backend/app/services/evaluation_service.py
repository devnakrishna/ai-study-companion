import json
from app.services.evaluators.descriptive_evaluator import evaluate_descriptive_batch
from app.db.models import UserAnswer, Question, QuizSession
from app.services.topic_service import update_topic_performance


def evaluate_answers(session_id, db):
    answers = db.query(UserAnswer).filter(
        UserAnswer.session_id == session_id
    ).all()

    if not answers:
        return {
            "scorecard": {
                "total_score": 0,
                "total_questions": 0,
                "percentage": 0,
                "mcq": {"score": 0, "total": 0},
                "descriptive": {"score": 0, "total": 0}
            },
            "review": [],
            "insights": {
                "strong_topics": [],
                "weak_topics": [],
                "skillset": "Beginner"
            }
            
    }

    mcq_score = 0
    total_mcq = 0
    desc_score = 0
    total_desc = 0

    review_data = []
    strong_areas = []
    weak_areas = []

    # STEP 1: collect descriptive questions
    desc_inputs = []
    desc_mapping = []

    for ans in answers:
        question = db.query(Question).filter(
            Question.id == ans.question_id
        ).first()

        if not question:
            continue

        # MCQ
        if question.question_type.lower() in ["multiselect", "mcq"]:
            total_mcq += 1

            if ans.is_correct:
                mcq_score += 1
                strong_areas.append(question.topic)
            else:
                weak_areas.append(question.topic)

            review_data.append({
                "type": "mcq",
                "question": question.question_text,
                "your_answer": ans.user_answer,
                "correct_answer": question.correct_answer,
                "is_correct": ans.is_correct
            })

        # Descriptive
        elif question.question_type.lower() == "long answer":
            desc_inputs.append({
                "question": question.question_text,
                "correct_answer": question.correct_answer,
                "user_answer": ans.user_answer,
                "topic": question.topic
            })
            desc_mapping.append(ans)

   
    desc_results = evaluate_descriptive_batch(desc_inputs)

    for res, ans_obj, input_obj in zip(desc_results, desc_mapping, desc_inputs):

        score = max(0, min(res.get("score", 0), 5))
        fb = res.get("feedback", "")

        total_desc += 1
        desc_score += score / 5

        ans_obj.marks_awarded = score
        ans_obj.ai_feedback = fb

        review_data.append({
            "type": "descriptive",
            "question": input_obj["question"],
            "your_answer": input_obj["user_answer"],
            "score": score,
            "feedback": fb
        })

        if score >= 3:
            strong_areas.append(input_obj["topic"])
        else:
            weak_areas.append(input_obj["topic"])
      

    # FINAL CALCULATIONS
    strong_areas = list(set(strong_areas))
    weak_areas = list(set(weak_areas))

    total_questions = total_mcq + total_desc
    total_score = mcq_score + desc_score
    percentage = (total_score / total_questions) * 100 if total_questions else 0

    session = db.query(QuizSession).filter(
        QuizSession.id == session_id
    ).first()
    

    if session:
        session.score = total_score
        session.percentage = percentage

    normalized = total_score / total_questions if total_questions else 0

    update_topic_performance(
        db,
        user_id=session.user_id,
        topic=session.topic,
        normalized_score=normalized,
        session_id=session_id 
    )

    db.commit()

    return {
    "scorecard": {
        "total_score": round(total_score, 2),
        "total_questions": total_questions,
        "percentage": round(percentage, 2),
        "mcq": {
            "score": mcq_score,
            "total": total_mcq
        },
        "descriptive": {
            "score": round(desc_score, 2),
            "total": total_desc
        }
    },
    "review": review_data,

    
    "insights": {
        "strong_topics": strong_areas,
        "weak_topics": weak_areas,
        "skillset": (
            "Advanced" if percentage >= 75 else
            "Intermediate" if percentage >= 50 else
            "Beginner"
        )
    }
}
      