from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import re

from app.db.database import get_db
from app.db.models import User, College, Specialization
from app.core.security import create_access_token, get_current_user

router = APIRouter()


class UserLogin(BaseModel):
    email: str
    password: str


class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    college_id: int
    department: str
    contact_no: str
    address: str



@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    

    db_user = db.query(User).filter(User.email == user.email).first()

    print("DB USER:", db_user)

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    # 2. password mismatch
    if db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token = create_access_token(data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email,
        "college_id": db_user.college_id,
        "college": db_user.college.name if db_user.college else None,
        "department": db_user.department,
        "contact_no": db_user.contact_no,
        "address": db_user.address,
        "role": db_user.role,
        "profile_pic": db_user.profile_pic
    }



@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):

    email = user.email.strip().lower()
    password = user.password.strip()
    contact = user.contact_no.strip() if user.contact_no else None

    # ---------------- EMAIL FORMAT VALIDATION ----------------
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # ---------------- EMAIL ALREADY EXISTS ----------------
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ---------------- PASSWORD CHECK ----------------
    if password == email:
        raise HTTPException(status_code=400, detail="Password cannot be same as email")

    if len(password) < 4:
        raise HTTPException(status_code=400, detail="Password too short")

    # ---------------- CONTACT VALIDATION ----------------
    if contact:
        if not contact.isdigit():
            raise HTTPException(status_code=400, detail="Contact number must contain only digits")

        if len(contact) != 10:
            raise HTTPException(status_code=400, detail="Invalid contact number")

    # ---------------- COLLEGE VALIDATION ----------------
    college = db.query(College).filter(College.id == user.college_id).first()
    if not college:
        raise HTTPException(status_code=400, detail="Invalid college selected")
    # ---------------- DEPARTMENT VALIDATION ----------------
    spec = db.query(Specialization).filter(
        Specialization.name == user.department.strip(),
        Specialization.college_id == user.college_id
        ).first()

    if not spec:
        raise HTTPException(
            status_code=400,
            detail="Invalid department for selected college"
    )

    # ---------------- EMAIL DOMAIN MATCH (STRICT) ----------------
    if not college.email or "@" not in college.email:
        raise HTTPException(status_code=400, detail="College email domain not configured")

    college_domain = college.email.split("@")[1].lower()
    user_domain = email.split("@")[1].lower()

    if user_domain != college_domain:
        raise HTTPException(
            status_code=400,
            detail=f"Use your official college email (must end with @{college_domain})"
        )

    # ---------------- CREATE USER ----------------
    new_user = User(
        first_name=user.first_name.strip(),
        last_name=user.last_name.strip(),
        email=email,
        password_hash=password,  # ⚠️ hash later
        college_id=user.college_id,
        department=user.department.strip(),
        contact_no=contact,
        address=user.address.strip() if user.address else None,
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Signup successful"}