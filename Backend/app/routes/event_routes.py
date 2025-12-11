from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Event, User
from ..extensions import db

event_bp = Blueprint("events", __name__)

@event_bp.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    user = User.query.get(get_jwt_identity())
    events = Event.query.order_by(Event.start.asc()).all()

    result = []
    for e in events:
        data = {
            "id": e.id,
            "title": e.title,
            "start": e.start,
            "end": e.end,
            "bookedById": e.booked_by_id
        }
        data["user"] = e.booked_by.username if user.is_admin and e.booked_by else None
        if not user.is_admin:
            data["booked"] = bool(e.booked_by)
        result.append(data)

    return jsonify(result)


@event_bp.route("/events/<int:event_id>/book", methods=["POST"])
@jwt_required()
def book_event(event_id):
    user = User.query.get(get_jwt_identity())
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"msg": "Event not found"}), 404
    if event.booked_by_id:
        return jsonify({"msg": "Event already booked"}), 400

    event.booked_by_id = user.id
    db.session.commit()

    return jsonify({"msg": "Event Signed Up successfully", "event": event.to_dict(True)})


@event_bp.route("/events/<int:event_id>/unbook", methods=["POST"])
@jwt_required()
def unbook_event(event_id):
    user = User.query.get(get_jwt_identity())
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"msg": "Event not found"}), 404
    if not event.booked_by_id:
        return jsonify({"msg": "Event is not booked"}), 400
    if event.booked_by_id != user.id and not user.is_admin:
        return jsonify({"msg": "Not allowed to unbook this event"}), 403

    event.booked_by_id = None
    db.session.commit()

    return jsonify({"msg": "Event Unsubscribed successfully", "event": event.to_dict(user.is_admin)})
