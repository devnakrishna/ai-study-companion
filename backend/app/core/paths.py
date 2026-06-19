from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"

QUIZ_FILE = DATA_DIR / "latest_quiz.json"
SUBMISSION_FILE = DATA_DIR / "submissions.json"