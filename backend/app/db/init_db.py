# pyrefly: ignore [missing-import]
from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.db.models import Base, User, College, Specialization

def init_db():
    # Dynamically alter table to add role column to users table if not present
    with engine.connect() as conn:
        try:
            # Check if role column exists in mysql
            result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'role'")).fetchone()
            if not result:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'"))
                conn.commit()
                print("Role column added to users table")
        except Exception as e:
            # Fallback for SQLite or other systems if show columns is not supported
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'student'"))
                conn.commit()
                print("Role column added to users table (fallback)")
            except Exception as ex:
                print("Could not add role column (it might already exist):", ex)

        # Alter total_score column in topic_performance to FLOAT
        try:
            conn.execute(text("ALTER TABLE topic_performance MODIFY COLUMN total_score FLOAT DEFAULT 0.0"))
            conn.commit()
            print("Altered topic_performance total_score to FLOAT")
        except Exception as e:
            print("Could not alter topic_performance total_score (it might already be FLOAT or SQLite):", e)

        # Alter colleges to add created_by, updated_at, updated_by if missing
        for col_name, col_type in [("created_by", "VARCHAR(100)"), ("updated_at", "DATETIME"), ("updated_by", "VARCHAR(100)")]:
            try:
                conn.execute(text(f"ALTER TABLE colleges ADD COLUMN {col_name} {col_type}"))
                conn.commit()
                print(f"Added {col_name} to colleges table")
            except Exception as e:
                print(f"Could not add {col_name} to colleges (it might already exist):", e)

    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

    # Seed admin user if it does not exist
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@college.edu").first()
        if not admin:
            new_admin = User(
                first_name="System",
                last_name="Admin",
                email="admin@college.edu",
                password_hash="admin123",
                role="admin",
                college_id=None,
                department=None,
                contact_no="9999999999",
                address="System HQ"
            )
            db.add(new_admin)
            db.commit()
            print("Admin user seeded successfully")
        else:
            if admin.college_id is not None or admin.department is not None:
                admin.college_id = None
                admin.department = None
                db.commit()
                print("Admin user updated to standalone profile")

        # Seed default college if it does not exist
        default_col = db.query(College).filter(College.name == "VIT University").first()
        if not default_col:
            new_col = College(
                name="VIT University",
                email="admin@vit.edu",
                contact_no="0416-2202020",
                point_of_contact="Admissions Office",
                address="VIT Campus, Katpadi Road, Vellore, TN"
            )
            db.add(new_col)
            db.commit()
            db.refresh(new_col)

            spec1 = Specialization(name="CSE", college_id=new_col.id)
            spec2 = Specialization(name="ECE", college_id=new_col.id)
            db.add(spec1)
            db.add(spec2)
            db.commit()
            print("Default college and specializations seeded successfully")

        # Seed default specializations (CSE, ECE) for every college if it has none
        all_colleges = db.query(College).all()
        for col in all_colleges:
            if not col.specializations:
                spec1 = Specialization(name="CSE", college_id=col.id)
                spec2 = Specialization(name="ECE", college_id=col.id)
                db.add(spec1)
                db.add(spec2)
        db.commit()
        print("Ensured all colleges have CSE/ECE specializations seeded.")

        # Merge duplicate TopicPerformance records case-insensitively
        performances = db.query(TopicPerformance).all()
        user_topic_map = {}
        for p in performances:
            key = (p.user_id, p.topic.strip().title())
            if key not in user_topic_map:
                user_topic_map[key] = p
                p.topic = p.topic.strip().title()
            else:
                existing = user_topic_map[key]
                existing.total_attempts += p.total_attempts
                existing.total_score += p.total_score
                existing.avg_score = existing.total_score / existing.total_attempts
                existing.last_score = p.last_score
                db.delete(p)
        db.commit()
        print("Merged any duplicate TopicPerformance entries.")
    except Exception as e:
        print("Error during database seeding:", e)
    finally:
        db.close()