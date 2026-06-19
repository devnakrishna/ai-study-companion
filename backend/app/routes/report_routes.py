from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import generate_report

router = APIRouter()
@router.get("/report/{user_id}")
def get_report(db: Session = Depends(get_db)):
    return generate_report(user_id=1, db=db)