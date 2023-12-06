import os
from uuid import uuid4

from flask import Flask, Request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = None
db = None
basedir = os.path.abspath(os.path.dirname(__file__))


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
        basedir, "database.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app)
    return app


def get_app() -> Flask:
    global app
    if app:
        return app
    app = create_app()
    return app


def get_db() -> SQLAlchemy:
    global db
    if db:
        return db
    db = SQLAlchemy(get_app())
    return db


def unique_id() -> str:
    return str(uuid4())


def valid_request(request: Request, requires: list[str]) -> bool:
    req = request.get_json()
    for require in requires:
        if require not in req:
            return False
    return True


def respond(data={}, msg: str = "Success", success: bool = True):
    return jsonify({"message": msg, "success": success, "data": data}), 200


def respond_with_error(msg: str = "Oops! Something went wrong", error: str = ""):
    return jsonify({"message": msg, "success": False, "error": error}), 400
