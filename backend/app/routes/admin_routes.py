from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, TopicPerformance

router = APIRouter()


@router.get("/admin/users-ranking")
def get_ranked_users(
    college: str = Query(None),
    department: str = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(User)

    if college:
        query = query.filter(User.college == college)

    if department:
        query = query.filter(User.department == department)

    users = query.all()

    result = []

    for user in users:
        topics = db.query(TopicPerformance).filter(
            TopicPerformance.user_id == user.id
        ).all()

        if not topics:
            continue

        avg_skill = sum(t.avg_score for t in topics) / len(topics)

        result.append({
            "user_id": user.id,
            "name": user.name,
            "college": user.college,
            "department": user.department,
            "skill_score": round(avg_skill, 2),
            "topics_count": len(topics)
        })

    # rank users
    result.sort(key=lambda x: x["skill_score"], reverse=True)

    # add rank
    for i, r in enumerate(result, start=1):
        r["rank"] = i

    return result