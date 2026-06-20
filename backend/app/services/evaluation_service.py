import json
from app.services.evaluators.descriptive_evaluator import evaluate_descriptive_batch
from app.db.models import UserAnswer, Question, QuizSession
from app.services.topic_service import update_topic_performance


def evaluate_answers(session_id, db):
    answers = db.query(UserAnswer).filter(
        UserAnswer.session_id == session_id
    ).all()

    if not answers:
        raise ValueError("No answers found")

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

    for i, res in enumerate(desc_results):
        score = res.get("score", 0)
        fb = res.get("feedback", "")

        total_desc += 1
        desc_score += score / 5

        ans_obj = desc_mapping[i]
        ans_obj.marks_awarded = score / 5
        ans_obj.ai_feedback = fb

        review_data.append({
            "type": "descriptive",
            "question": desc_inputs[i]["question"],
            "your_answer": desc_inputs[i]["user_answer"],
            "score": score,
            "feedback": fb
        })

        if score >= 3:
            strong_areas.append(desc_inputs[i]["topic"])
        else:
            weak_areas.append(desc_inputs[i]["topic"])

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
        user_id=1,
        topic=session.topic,
        normalized_score=normalized
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
        "strong_areas": strong_areas,
        "weak_areas": weak_areas
    }