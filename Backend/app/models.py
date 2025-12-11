import re
from datetime import datetime
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    preferred_categories = db.Column(db.String(255), default='')
    bookings = db.relationship('Event', back_populates='booked_by', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def prefs_list(self):
        if not self.preferred_categories:
            return []
        return [c for c in self.preferred_categories.split(',') if c]

    def set_prefs(self, prefs_list):
        self.preferred_categories = ','.join(prefs_list)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start = db.Column(db.String(50), nullable=False)
    end = db.Column(db.String(50), nullable=False)
    booked_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    booked_by = db.relationship('User', back_populates='bookings')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, is_admin=False):
        data = {
            "id": self.id,
            "title": self.title,
            "start": self.start,
            "end": self.end,
            "booked": bool(self.booked_by_id),
            "bookedById": self.booked_by_id
        }
        if is_admin and self.booked_by:
            data["user"] = self.booked_by.username or self.booked_by.email
        return data
