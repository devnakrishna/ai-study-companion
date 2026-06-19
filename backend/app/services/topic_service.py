from app.db.models import TopicPerformance
from datetime import datetime, timezone


def update_topic_performance(db, user_id, topic, normalized_score):

    record = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id,
        TopicPerformance.topic == topic
    ).first()

    if record:
        # update existing
        record.total_attempts += 1
        record.total_score += normalized_score
        record.avg_score = record.total_score / record.total_attempts
        record.last_score = normalized_score
        record.last_updated = datetime.now(timezone.utc)

    else:
        # create new
        record = TopicPerformance(
            user_id=user_id,
            topic=topic,
            total_attempts=1,
            total_score=normalized_score,
            avg_score=normalized_score,
            last_score=normalized_score,
            created_by="system"
        )

        db.add(record)