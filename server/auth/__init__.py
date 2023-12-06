from datetime import datetime

from flask import Blueprint, request
from werkzeug.security import check_password_hash, generate_password_hash

from model.User import User
from utils import get_db, respond, respond_with_error, unique_id, valid_request

auth_bp = Blueprint("auth", __name__)
db = get_db()


@auth_bp.route("", methods=["POST"])
def register():
    requires = ["first_name", "last_name", "username", "password"]
    try:
        if not valid_request(request, requires):
            return respond_with_error()
        req = request.get_json()
        user = User.query.filter_by(username=req["username"]).first()
        if user:
            return respond_with_error()
        user = User(
            first_name=req["first_name"],
            last_name=req["last_name"],
            username=req["username"],
            password=req["password"],
        )
        db.session.add(user)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@auth_bp.route("/login", methods=["POST"])
def login():
    requires = ["username", "password"]
    try:
        if not valid_request(request, requires):
            return respond_with_error()
        req = request.get_json()
        user = User.query.filter(User.username == req["username"]).first()
        if (not user) or (not check_password_hash(user.password, req["password"])):
            return respond_with_error()
        token = unique_id()
        user.token = token
        user.updated_at = datetime.now()
        db.session.add(user)
        db.session.commit()
        return respond(data={"token": token})
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    requires = ["old_password", "new_password"]
    try:
        if (not valid_request(request, requires)) or (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        req = request.get_json()
        if (not user) or (not check_password_hash(user.password, req["old_password"])):
            return respond_with_error()
        token = unique_id()
        user.password = generate_password_hash(req["new_password"])
        user.token = token
        user.updated_at = datetime.now()
        db.session.add(user)
        db.session.commit()
        return respond(data={"token": token})
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))
