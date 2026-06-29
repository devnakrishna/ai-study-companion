from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import User, College
from app.core.security import create_access_token, get_current_user

router = APIRouter()
class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    college_id: int
    department: str
    contact_no: str
    address: str


@router.get("/users/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    college = db.query(College).filter(College.id == current_user.college_id).first()
    return {
        "user_id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "college_id": current_user.college_id,
        "college": college.name if college else None,
        "department": current_user.department,
        "contact_no": current_user.contact_no,
        "address": current_user.address,
        "role": current_user.role
    }


@router.put("/users/profile")
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Email uniqueness
    if profile_data.email.strip().lower() != current_user.email:
        existing = db.query(User).filter(User.email == profile_data.email.strip().lower()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    # ✅ FIX: check college by ID
    college = db.query(College).filter(College.id == profile_data.college_id).first()
    if not college:
        raise HTTPException(status_code=400, detail="Invalid college selected")

    # ✅ Update user
    current_user.first_name = profile_data.first_name.strip()
    current_user.last_name = profile_data.last_name.strip()
    current_user.email = profile_data.email.strip().lower()
    current_user.college_id = profile_data.college_id.strip()
    current_user.department = profile_data.department.strip()
    current_user.contact_no = profile_data.contact_no.strip()
    current_user.address = profile_data.address.strip()

    db.commit()
    db.refresh(current_user)

    token = create_access_token({
        "sub": current_user.email,
        "user_id": current_user.id,
        "role": current_user.role
    })

    return {
        "access_token": token,
        "user_id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "college_id": current_user.college_id,
        "college": college.name,
        "department": current_user.department,
        "contact_no": current_user.contact_no,
        "address": current_user.address,
        "role": current_user.role
    }
class ChangePassword(BaseModel):
    current_password: str
    new_password: str

@router.put("/users/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if not data.current_password or not data.new_password:
        raise HTTPException(status_code=400, detail="Both password fields required")
    if current_user.password_hash.strip() != data.current_password.strip():
        raise HTTPException(status_code=400, detail="Incorrect current password")
    if current_user.password_hash.strip() == data.new_password.strip():
        raise HTTPException(status_code=400, detail="New password cannot be the same as current password")

    current_user.password_hash = data.new_password.strip()
    db.commit()

    return {"message": "Password updated successfully"}
@router.get("/colleges")
def get_all_colleges(db: Session = Depends(get_db)):
    colleges = db.query(College).all()

    return [
        {
            "id": c.id,
            "name": c.name
        }
        for c in colleges
    ]