from datetime import datetime, timedelta
from flask import abort
from .extensions import db
from .models import User, Event


def init_db():
    """Create tables and seed default events on first run."""
    db.create_all()
    seed_default_events()


def seed_default_events():
    """Seed default events only when events table is empty."""
    if Event.query.count() == 0:

        today = datetime.now().date()
        # Monday of the current week
        monday = today - timedelta(days=today.weekday())

        # 5 events for Mon → Fri
        event_list = [
            {
                "title": "Client Demo",
                "day": monday, 
                "start": "10:00:00",
                "end": "11:30:00"
            },
            {
                "title": "Team Standup",
                "day": monday + timedelta(days=1),
                "start": "09:30:00",
                "end": "11:00:00"
            },
            {
                "title": "Sprint Planning",
                "day": monday + timedelta(days=2),
                "start": "11:00:00",
                "end": "15:00:00"
            },
            {
                "title": "Project Retrospective",
                "day": monday + timedelta(days=5),
                "start": "11:00:00",
                "end": "15:00:00"
            }
        ]

        for ev in event_list:
            start_dt = f"{ev['day']}T{ev['start']}"
            end_dt = f"{ev['day']}T{ev['end']}"

            new_event = Event(
                title=ev["title"],
                start=start_dt,
                end=end_dt,
                booked_by_id=None
            )
            db.session.add(new_event)

        db.session.commit()
        print("✔ 5 weekly default events created!")


def parse_date(s):
    return datetime.strptime(s, '%Y-%m-%d').date()


def require_admin(user_id):
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        abort(403, description="Admin permission required")
