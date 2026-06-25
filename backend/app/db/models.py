from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    CheckConstraint,
    Float
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


# 🟢 USERS
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    college = Column(String(150))
    password_hash = Column(String(255))
    department = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)

    # relationships
    sessions = relationship("QuizSession", back_populates="user")


# 🟢 QUIZ SESSION
class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    topic = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False)

    total_questions = Column(Integer, default=0)
    score = Column(Integer, default=0)
    percentage = Column(Float)
     
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "level IN ('beginner', 'intermediate', 'advanced')",
            name="check_quiz_level"
        ),
    )

    # relationships
    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session", cascade="all, delete")
    answers = relationship("UserAnswer", back_populates="session", cascade="all, delete")


# 🟢 QUESTIONS
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("quiz_sessions.id"), nullable=False)

    question_text = Column(Text, nullable=False)

    question_type = Column(String(50), nullable=False)  
    # MCQ / DESCRIPTIVE

    options = Column(Text, nullable=True)  # JSON string for MCQ
    correct_answer = Column(Text, nullable=True)

    topic = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)

    # relationships
    session = relationship("QuizSession", back_populates="questions")
    answers = relationship("UserAnswer", back_populates="question", cascade="all, delete")


# 🟢 USER ANSWERS
class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("quiz_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    user_answer = Column(Text, nullable=False)

    is_correct = Column(Boolean, nullable=True)   # MCQ = True/False, descriptive = None initially
    marks_awarded = Column(Integer, default=0)
    ai_feedback = Column(Text,nullable=True)   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(50), default="system")

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(50), nullable=True)

    # relationships
    session = relationship("QuizSession", back_populates="answers")
    question = relationship("Question", back_populates="answers")


# 🟢 TOPIC PERFORMANCE (analytics)
class TopicPerformance(Base):
    __tablename__ = "topic_performance"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    topic = Column(String(100), nullable=False)

    total_attempts = Column(Integer, default=0)
    total_score = Column(Integer, default=0)

    avg_score = Column(Float, default=0.0)
    last_score = Column(Float, default=0.0)

    last_updated = Column(DateTime(timezone=True), server_default=func.now())

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)