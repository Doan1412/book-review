from datetime import datetime
from math import ceil

from flask import Blueprint, request
from sqlalchemy import asc

from model.Category import Category
from model.User import User
from utils import get_db, respond, respond_with_error, valid_request

category_bp = Blueprint("category", __name__)
db = get_db()


@category_bp.route("", methods=["POST"])
def store():
    requires = ["name"]
    try:
        if (not valid_request(request, requires)) or (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        req = request.get_json()
        category = Category(name=req["name"])
        db.session.add(category)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@category_bp.route("", methods=["GET"])
def index():
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    name = request.args.get("name", type=str, default="")
    try:
        categories = Category.query.filter_by(deleted_at=None).order_by(
            asc(Category.name)
        )
        if name:
            categories = categories.filter_by(name=name)
        total = ceil(categories.count() / per_page)
        categories = categories.paginate(page=page, per_page=per_page)
        return respond(
            data={
                "categories": [
                    {
                        "id": category.id,
                        "name": category.name,
                        "created_at": category.created_at,
                        "updated_at": category.updated_at,
                    }
                    for category in categories
                ],
                "total": total,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@category_bp.route("/<id>", methods=["DELETE"])
def destroy(id):
    try:
        if not "Authorization" in request.headers:
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        category = Category.query.filter(Category.id == id).first()
        if (not user) or (user.role == 0) or (not category):
            return respond_with_error()
        category.deleted_at = datetime.now()
        db.session.add(category)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@category_bp.route("/<id>", methods=["PUT"])
def update(id):
    requires = ["name"]
    try:
        if (not valid_request(request, requires)) or (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        category = Category.query.filter(Category.id == id).first()
        if (not user) or (user.role == 0) or (not category):
            return respond_with_error()
        req = request.get_json()
        category.name = req["name"]
        category.updated_at = datetime.now()
        db.session.add(category)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))
