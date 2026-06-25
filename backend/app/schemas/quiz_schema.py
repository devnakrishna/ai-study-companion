from pydantic import BaseModel

class QuizRequest(BaseModel):
    user_id: int
    topic: str
    level: str