from math import ceil

from flask import Blueprint, request
from model.User import User
from sqlalchemy import desc
from utils import get_db, respond, respond_with_error

user_bp = Blueprint("user", __name__)
db = get_db()


@user_bp.route("/all", methods=["GET"])
def all():
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    try:
        if not "Authorization" in request.headers:
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        users = User.query.filter_by(deleted_at=None).order_by(desc(User.role))  # type: ignore
        total = ceil(users.count() / per_page)
        users = users.paginate(page=page, per_page=per_page)
        return respond(
            data={
                "users": [
                    {
                        "id": user.id,
                        "created_at": user.created_at,
                        "updated_at": user.updated_at,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "username": user.username,
                        "role": user.role,
                    }
                    for user in users
                ],
                "total": total,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))

@user_bp.route("", methods=["GET"])
def index():
    try:
        if not "Authorization" in request.headers:
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user):
            return respond_with_error()
        return respond(
            data={
                "id": user.id,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "role": user.role,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))