from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..models import User
from ..extensions import db
import re

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    is_admin = data.get('is_admin', False)

    if not email or not password:
        return jsonify({'msg': 'email and password required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'email already exists'}), 400

    if not username:
        local = email.split('@')[0]
        local = re.sub(r'\d+', '', local)
        username = re.sub(r'[._]+', ' ', local).title()

    user = User(email=email, username=username, is_admin=is_admin)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'msg': 'Profile Created Successfully',
        'user': {'id': user.id, 'email': user.email, 'username': user.username}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'msg': 'email and password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'invalid credentials'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin
        }
    })
