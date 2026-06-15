import json
from app.services.evaluators.mcq_evaluator import evaluate_mcq
from app.services.evaluators.descriptive_evaluator import evaluate_descriptive
from app.prompts.evaluation_prompt import evaluation_prompt

def evaluate_answers():

    with open("submissions.json", "r") as f:
        submissions = json.load(f)

    latest_submission = submissions[-1]

    with open("latest_quiz.json", "r") as f:
        quiz = json.load(f)

    # MCQ evaluation
    mcq_score, total_mcq = evaluate_mcq(quiz, latest_submission)

    # Descriptive evaluation
    desc_score = 0
    total_desc = 0
    feedback = []

    # Review data 
    review_data = []
    strong_areas = []
    weak_areas = []
    

    for q, ans in zip(quiz, latest_submission):

        if q["type"] == "Long Answer":
            total_desc += 1

            result = evaluate_descriptive(q["question"], ans["answer"])

            desc_score += result["score"] / 5
           
            feedback.append({
                "question": q["question"],
                "score": result["score"],
                "feedback": result["feedback"],
                
})

            review_data.append({
                "type": "desc",
                "question": q["question"],
                "your_answer": ans["answer"]
            })
            if result["score"] >= 3:
                strong_areas.append(q.get("topic", "General"))
            else:
                weak_areas.append(q.get("topic", "General"))

        elif q["type"] == "MultiSelect":
            is_correct = ans["answer"] == q["correct_answer"]

            review_data.append({
                "type": "mcq",
                "question": q["question"],
                "your_answer": ans["answer"],
                "correct_answer": q["correct_answer"],
                "is_correct": is_correct
            })
            if is_correct:
                strong_areas.append(q.get("topic", "General"))
            else:
                weak_areas.append(q.get("topic", "General"))
    recommendations = []
    for topic in weak_areas:
        search_query = topic.replace(" ", "+")
        youtube_url = f"https://www.youtube.com/results?search_query={search_query}"
        recommendations.append({
            "topic": topic,
            "youtube": youtube_url
        })
    strong_areas = list(set(strong_areas))
    weak_areas = list(set(weak_areas))
    total_questions = total_mcq + total_desc
    total_score = mcq_score + desc_score
    percentage = (total_score / total_questions) * 100 if total_questions > 0 else 0
    scorecard = {
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
}
   
    return {
    "scorecard": scorecard,
    "feedback": feedback,
    "review": review_data,
    "strong_areas": strong_areas,
    "weak_areas": weak_areas,
    
}