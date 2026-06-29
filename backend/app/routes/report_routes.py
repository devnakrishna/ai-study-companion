#
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import generate_report
from app.core.security import get_current_user

router = APIRouter()
@router.get("/report/{user_id}")
def get_report(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return generate_report(user_id=user_id, db=db)