from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import User, TopicPerformance, College, Specialization, QuizSession
from app.core.security import get_current_admin

router = APIRouter()

# ---------------- SCHEMAS ----------------

class CollegeCreate(BaseModel):
    name: str
    email: Optional[str] = None
    location: Optional[str] = None
    contact_no: Optional[str] = None
    point_of_contact: Optional[str] = None

class CollegeUpdate(BaseModel):
    name: str
    email: Optional[str] = None
    location: Optional[str] = None
    contact_no: Optional[str] = None
    point_of_contact: Optional[str] = None

class SpecializationCreate(BaseModel):
    name: str
    college_id: int

class StudentCreate(BaseModel):
    name: str
    email: str
    password: str
    college: str
    department: Optional[str] = None


@router.post("/admin/create-student")
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = db.query(User).filter(User.email == student.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    college_obj = db.query(College).filter(College.name == student.college.strip()).first()
    if not college_obj:
        college_obj = College(name=student.college.strip())
        db.add(college_obj)
        db.commit()
        db.refresh(college_obj)

    parts = student.name.strip().split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=student.email.strip().lower(),
        password_hash=student.password,
        college_id=college_obj.id,
        department=student.department,
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Student created"}


# ---------------- USER RANKING (FIXED & ENHANCED) ----------------

@router.get("/admin/users-ranking")
def get_ranked_users(
    college: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    score: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(User).filter(User.role != "admin")

    if college:
        query = query.join(College, User.college_id == College.id).filter(College.name.ilike(f"%{college.strip()}%"))

    if department:
        query = query.filter(User.department.ilike(f"%{department.strip()}%"))

    users = query.all()
    result = []

    for user in users:
        user_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email
        user_college = user.college.name if user.college else "N/A"

        if topic:
            topic_perf = db.query(TopicPerformance).filter(
                TopicPerformance.user_id == user.id,
                TopicPerformance.topic.ilike(f"%{topic.strip()}%")
            ).first()

            if not topic_perf:
                continue

            topic_score = round(topic_perf.avg_score * 100, 2)
            if score is not None and topic_score < score:
                continue

            result.append({
                "user_id": user.id,
                "name": user_name,
                "college": user_college,
                "department": user.department,
                "skill_score": topic_score,
                "topics_count": 1,
                "topic": topic_perf.topic,
                "attempts": topic_perf.total_attempts
            })
        else:
            topics = db.query(TopicPerformance).filter(
                TopicPerformance.user_id == user.id
            ).all()

            avg_skill = sum(t.avg_score for t in topics) / len(topics) if topics else 0.0
            overall_score = round(avg_skill * 100, 2)

            if score is not None and overall_score < score:
                continue

            result.append({
                "user_id": user.id,
                "name": user_name,
                "college": user_college,
                "department": user.department,
                "skill_score": overall_score,
                "topics_count": len(topics),
                "topic": None,
                "attempts": sum(t.total_attempts for t in topics)
            })

    result.sort(key=lambda x: x["skill_score"], reverse=True)

    for i, r in enumerate(result, start=1):
        r["rank"] = i

    return result


# ---------------- COLLEGE-WISE RANKINGS ----------------

@router.get("/admin/college-rankings")
def get_college_rankings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    colleges = db.query(College).all()
    result = []

    for c in colleges:
        users = db.query(User).filter(User.college_id == c.id, User.role != "admin").all()
        ranked_users = []

        for u in users:
            topics = db.query(TopicPerformance).filter(
                TopicPerformance.user_id == u.id
            ).all()

            if topics:
                avg_skill = sum(t.avg_score for t in topics) / len(topics)
            else:
                avg_skill = 0

            ranked_users.append({
                "user_id": u.id,
                "name": f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
                "department": u.department,
                "skill_score": round(avg_skill * 100, 2)
            })

        ranked_users.sort(key=lambda x: x["skill_score"], reverse=True)

        for i, u in enumerate(ranked_users, start=1):
            u["rank"] = i

        result.append({
            "college_id": c.id,
            "college_name": c.name,
            "students": ranked_users,
            "topper": ranked_users[0] if ranked_users else None
        })

    return result


# ---------------- COLLEGES DIRECTORY ----------------

@router.get("/admin/colleges")
def get_colleges(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    colleges = db.query(College).all()
    result = []

    for c in colleges:
        students = db.query(User).filter(
            User.college_id == c.id,
            User.role != "admin"
        ).all()

        specializations = [{"id": s.id, "name": s.name} for s in c.specializations]

        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "location": c.address,
            "contact_no": c.contact_no,
            "point_of_contact": c.point_of_contact,
            "students_count": len(students),
            "specializations": specializations
        })

    return result


@router.post("/admin/colleges")
def create_college(
    college_data: CollegeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = db.query(College).filter(College.name == college_data.name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="College name already exists")

    new_col = College(
        name=college_data.name.strip(),
        email=college_data.email.strip() if college_data.email else None,
        address=college_data.location.strip() if college_data.location else None,
        contact_no=college_data.contact_no.strip() if college_data.contact_no else None,
        point_of_contact=college_data.point_of_contact.strip() if college_data.point_of_contact else None
    )
    db.add(new_col)
    db.commit()
    db.refresh(new_col)

    # Automatically add CSE/ECE default specializations
    spec1 = Specialization(name="CSE", college_id=new_col.id)
    spec2 = Specialization(name="ECE", college_id=new_col.id)
    db.add(spec1)
    db.add(spec2)
    db.commit()
    db.refresh(new_col)

    return {
        "id": new_col.id,
        "name": new_col.name,
        "email": new_col.email,
        "location": new_col.address,
        "contact_no": new_col.contact_no,
        "point_of_contact": new_col.point_of_contact,
        "students_count": 0,
        "specializations": [{"id": spec1.id, "name": spec1.name}, {"id": spec2.id, "name": spec2.name}]
    }


@router.put("/admin/colleges/{college_id}")
def update_college(
    college_id: int,
    college_data: CollegeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    if college.name != college_data.name.strip():
        existing = db.query(College).filter(College.name == college_data.name.strip()).first()
        if existing:
            raise HTTPException(status_code=400, detail="College name already exists")

    college.name = college_data.name.strip()
    college.email = college_data.email.strip() if college_data.email else None
    college.address = college_data.location.strip() if college_data.location else None
    college.contact_no = college_data.contact_no.strip() if college_data.contact_no else None
    college.point_of_contact = college_data.point_of_contact.strip() if college_data.point_of_contact else None

    db.commit()
    db.refresh(college)

    students_count = db.query(User).filter(User.college_id == college.id, User.role != "admin").count()
    specializations = [{"id": s.id, "name": s.name} for s in college.specializations]

    return {
        "id": college.id,
        "name": college.name,
        "email": college.email,
        "location": college.address,
        "contact_no": college.contact_no,
        "point_of_contact": college.point_of_contact,
        "students_count": students_count,
        "specializations": specializations
    }


@router.post("/admin/specializations")
def create_specialization(
    spec_data: SpecializationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    college = db.query(College).filter(College.id == spec_data.college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    new_spec = Specialization(
        name=spec_data.name.strip(),
        college_id=spec_data.college_id
    )
    db.add(new_spec)
    db.commit()
    db.refresh(new_spec)

    return {
        "id": new_spec.id,
        "name": new_spec.name
    }


@router.delete("/admin/specializations/{spec_id}")
def delete_specialization(
    spec_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    spec = db.query(Specialization).filter(Specialization.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    db.delete(spec)
    db.commit()
    return {"message": "Specialization deleted successfully"}


@router.get("/admin/colleges/{college_id}/metrics")
def get_college_metrics(
    college_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    users = db.query(User).filter(User.college_id == college_id, User.role != "admin").all()

    total_users = len(users)
    total_quizzes = 0
    all_percentages = []

    users_data = []
    for u in users:
        sessions = db.query(QuizSession).filter(QuizSession.user_id == u.id, QuizSession.percentage.isnot(None)).all()
        quizzes_count = len(sessions)
        total_quizzes += quizzes_count

        user_pcts = [s.percentage for s in sessions if s.percentage is not None]
        all_percentages.extend(user_pcts)

        avg_pct = round(sum(user_pcts) / len(user_pcts), 2) if user_pcts else 0.0

        quizzes_list = [
            {
                "topic": s.topic,
                "level": s.level,
                "score": s.score,
                "total_questions": s.total_questions,
                "percentage": round(s.percentage, 2) if s.percentage is not None else 0.0,
                "date": s.created_at.isoformat() if s.created_at else None
            }
            for s in sessions
        ]

        users_data.append({
            "user_id": u.id,
            "name": f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
            "email": u.email,
            "department": u.department,
            "quizzes_count": quizzes_count,
            "average_score": avg_pct,
            "quizzes": quizzes_list
        })

    average_score = round(sum(all_percentages) / len(all_percentages), 2) if all_percentages else 0.0

    return {
        "college_name": college.name,
        "email": college.email,
        "location": college.address,
        "contact_no": college.contact_no,
        "point_of_contact": college.point_of_contact,
        "total_users": total_users,
        "total_quizzes": total_quizzes,
        "average_score": average_score,
        "users": users_data
    }