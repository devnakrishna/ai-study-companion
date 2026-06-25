from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import User

router = APIRouter()


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    print("EMAIL RECEIVED:", user.email)
    print("PASSWORD RECEIVED:", user.password)

    db_user = db.query(User).filter(User.email == user.email).first()

    print("DB USER:", db_user)

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    # 2. password mismatch
    if db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {
        "user_id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "college": db_user.college,
        "department": db_user.department
    }