def validate_questions(questions):

    if not isinstance(questions, list):
        return False

    if len(questions) != 10:
        return False

    mcq_count = 0
    descriptive_count = 0

    for q in questions:

        if "type" not in q:
            return False

        if "question" not in q:
            return False

        if not q["question"].strip():
            return False

        if "correct_answer" not in q:
            return False

        if q["type"] == "MultiSelect":

            mcq_count += 1

            if "options" not in q:
                return False

            if len(q["options"]) != 4:
                return False

            if q["correct_answer"] not in q["options"]:
                return False

        elif q["type"] == "Long Answer":

            descriptive_count += 1

        else:
            return False

    return (
        mcq_count == 8
        and descriptive_count == 2
    )