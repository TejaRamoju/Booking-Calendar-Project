import os
from flask import Flask
from .extensions import db, jwt, cors
from .config import Config
from .routes.auth_routes import auth_bp
from .routes.admin_routes import admin_bp
from .routes.event_routes import event_bp
from .utils import init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    cors.init_app(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    # Initialize DB and seed events
    with app.app_context():
        init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(event_bp, url_prefix="/")

    @app.route("/")
    def index():
        return {"msg": "Event booking backend. See README for endpoints."}

    return app
