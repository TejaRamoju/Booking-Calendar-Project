from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Event, User
from ..extensions import db
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"msg": "Admins only"}), 403

    data = request.json or {}
    title, start, end = data.get("title"), data.get("start"), data.get("end")

    if not title or not start or not end:
        return jsonify({"msg": "title, start, and end are required"}), 400

    try:
        datetime.fromisoformat(start)
        datetime.fromisoformat(end)
    except ValueError:
        return jsonify({"msg": "start and end must be ISO datetime strings"}), 400

    event = Event(title=title, start=start, end=end)
    db.session.add(event)
    db.session.commit()

    return jsonify({"msg": "Event created successfully", "event": event.to_dict(True)}), 201


@admin_bp.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event_admin(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"msg": "Admins only"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()

    return jsonify({"msg": "Event deleted successfully"}), 200


@admin_bp.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event_admin(event_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"msg": "Admins only"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    data = request.json or {}

    if data.get("title"):
        event.title = data["title"]
    if data.get("start"):
        event.start = data["start"]
    if data.get("end"):
        event.end = data["end"]

    db.session.commit()
    return jsonify({"msg": "Event updated successfully", "event": event.to_dict(True)}), 200
