def evaluate_mcq(quiz, submission):

    score = 0
    total = 0

    for q, ans in zip(quiz, submission):

        if q["type"] == "MultiSelect":
            total += 1

            if ans["answer"] == q["correct_answer"]:
                score += 1

    return score, total