import json
from app.services.evaluators.descriptive_evaluator import evaluate_descriptive_batch
from app.db.models import UserAnswer, Question, QuizSession
from app.services.topic_service import update_topic_performance


def evaluate_answers(session_id, db):
    session = db.query(QuizSession).filter(
        QuizSession.id == session_id
    ).first()
    if session and session.percentage is not None:
        return get_session_results(session_id, db)

    # Retrieve all questions for this session
    questions = db.query(Question).filter(
        Question.session_id == session_id
    ).all()

    if not questions:
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

    answers = db.query(UserAnswer).filter(
        UserAnswer.session_id == session_id
    ).all()
    answer_map = {ans.question_id: ans for ans in answers}

    mcq_score = 0
    total_mcq = 0
    desc_score = 0
    total_desc = 0
    correct_desc_count = 0

    review_data = []
    strong_areas = []
    weak_areas = []

    # STEP 1: collect descriptive questions
    desc_inputs = []
    desc_mapping = []

    for question in questions:
        ans = answer_map.get(question.id)

        # If UserAnswer does not exist, it was unattempted. Create a default record.
        if not ans:
            is_correct = False if question.question_type.lower() in ["multiselect", "mcq", "multiplechoice"] else None
            ans = UserAnswer(
                session_id=session_id,
                question_id=question.id,
                user_answer="",
                is_correct=is_correct,
                marks_awarded=0,
                created_by="system"
            )
            db.add(ans)
            answer_map[question.id] = ans

        # MCQ
        if question.question_type.lower() in ["multiselect", "mcq", "multiplechoice"]:
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
            # If the user left it blank/unattempted, evaluate immediately with 0 score
            if not ans.user_answer or not ans.user_answer.strip():
                total_desc += 1
                ans.marks_awarded = 0
                ans.ai_feedback = question.correct_answer or "Not attempted"
                review_data.append({
                    "type": "descriptive",
                    "question": question.question_text,
                    "your_answer": "",
                    "score": 0,
                    "feedback": question.correct_answer or "Not attempted"
                })
                weak_areas.append(question.topic)
            else:
                desc_inputs.append({
                    "question": question.question_text,
                    "correct_answer": question.correct_answer,
                    "user_answer": ans.user_answer,
                    "topic": question.topic
                })
                desc_mapping.append(ans)

    if desc_inputs:
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
                correct_desc_count += 1
            else:
                weak_areas.append(input_obj["topic"])

    # FINAL CALCULATIONS
    strong_areas = list(set(strong_areas))
    weak_areas = list(set(weak_areas))

    total_questions = total_mcq + total_desc
    total_score = mcq_score + correct_desc_count
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
            "total_score": total_score,
            "total_questions": total_questions,
            "percentage": round(percentage, 2),
            "mcq": {
                "score": mcq_score,
                "total": total_mcq
            },
            "descriptive": {
                "score": correct_desc_count,
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


def get_session_results(session_id: int, db):
    session = db.query(QuizSession).filter(QuizSession.id == session_id).first()
    if not session:
        return None

    questions = db.query(Question).filter(Question.session_id == session_id).all()
    answers = db.query(UserAnswer).filter(UserAnswer.session_id == session_id).all()
    answer_map = {ans.question_id: ans for ans in answers}

    mcq_score = 0
    total_mcq = 0
    desc_score = 0
    total_desc = 0
    correct_desc_count = 0

    review_data = []
    strong_areas = []
    weak_areas = []

    for question in questions:
        ans = answer_map.get(question.id)

        # MCQ
        if question.question_type.lower() in ["multiselect", "mcq", "multiplechoice"]:
            total_mcq += 1
            is_correct = ans.is_correct if ans else False
            if is_correct:
                mcq_score += 1
                strong_areas.append(question.topic)
            else:
                weak_areas.append(question.topic)

            review_data.append({
                "type": "mcq",
                "question": question.question_text,
                "your_answer": ans.user_answer if ans else "",
                "correct_answer": question.correct_answer,
                "is_correct": is_correct
            })

        # Descriptive
        elif question.question_type.lower() == "long answer":
            total_desc += 1
            score = ans.marks_awarded if ans else 0
            desc_score += score / 5
            fb = (ans.ai_feedback if (ans and ans.ai_feedback and ans.ai_feedback != "Not attempted") else question.correct_answer) or "Not attempted"

            review_data.append({
                "type": "descriptive",
                "question": question.question_text,
                "your_answer": ans.user_answer if ans else "",
                "score": score,
                "feedback": fb
            })

            if score >= 3:
                strong_areas.append(question.topic)
                correct_desc_count += 1
            else:
                weak_areas.append(question.topic)

    strong_areas = list(set(strong_areas))
    weak_areas = list(set(weak_areas))

    total_questions = total_mcq + total_desc
    total_score = mcq_score + correct_desc_count
    percentage = session.percentage if session.percentage is not None else ((total_score / total_questions) * 100 if total_questions else 0)

    return {
        "scorecard": {
            "total_score": total_score,
            "total_questions": total_questions,
            "percentage": round(percentage, 2),
            "mcq": {
                "score": mcq_score,
                "total": total_mcq
            },
            "descriptive": {
                "score": correct_desc_count,
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
      