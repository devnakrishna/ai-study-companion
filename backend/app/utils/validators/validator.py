def validate_questions(data):
    if not isinstance(data, dict):
        return False

    if "mcq" not in data or "descriptive" not in data:
        return False

    if not isinstance(data["mcq"], list):
        return False

    if not isinstance(data["descriptive"], list):
        return False
    if len(data["mcq"]) != 8:
        return False

    if len(data["descriptive"]) != 2:
        return False
    # MCQ checks
    for item in data["mcq"]:
        if "question" not in item or "options" not in item:
            return False
        if "correct_answer" not in item:
            return False
        if item["correct_answer"] not in item["options"]:
            return False
        if len(item["options"]) != 4:
            return False
        
        for option in item["options"]:
            if not isinstance(option, str):
                return False
    # Descriptive checks
    for item in data["descriptive"]:
        if "question" not in item:
            return False

    return True