# routes/profile_upload.py

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import shutil
import os

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads/profile_pics"

# ensure folder exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/users/upload-profile-pic")
def upload_profile_pic(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = f"user_{current_user.id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Normalize backslashes to forward slashes for URLs
    url_filepath = filepath.replace("\\", "/")

    # save path in DB
    current_user.profile_pic = url_filepath
    db.commit()

    return {"profile_pic": url_filepath}
@router.delete("/users/remove-profile-pic")
def remove_profile_pic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.profile_pic:
        try:
            if os.path.exists(current_user.profile_pic):
                os.remove(current_user.profile_pic)
        except Exception as e:
            print("Error deleting file:", e)

    current_user.profile_pic = None
    db.commit()

    return {"message": "Profile picture removed"}