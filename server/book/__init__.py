import os
from datetime import datetime
from math import ceil
from uuid import uuid4

from flask import Blueprint, request
from sqlalchemy import asc

from model.Book import Book
from model.User import User
from utils import get_db, respond, respond_with_error

book_bp = Blueprint("book", __name__)
db = get_db()


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@book_bp.route("", methods=["POST"])
def store():
    try:
        if not "Authorization" in request.headers:
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        # Save image
        file = request.files["image"]
        if file.filename == "" or not allowed_file(file.filename):
            return respond_with_error()
        file_name = "{}.jpg".format(uuid4())
        folder_path = os.path.join(os.getcwd(), "static")
        if not os.path.isdir(folder_path):
            os.mkdir(folder_path)
        file.save(os.path.join(folder_path, file_name))

        book = Book(
            author=request.form.get("author"),  # type: ignore
            title=request.form.get("title"),  # type: ignore
            price=request.form.get("price"),  # type: ignore
            description=request.form.get("description"),  # type: ignore
            image_path=file_name,
        )
        db.session.add(book)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@book_bp.route("", methods=["GET"])
def index():
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    # Search params
    author = request.args.get("author", type=str, default="")
    title = request.args.get("title", type=str, default="")
    try:
        books = Book.query.filter_by(deleted_at=None).order_by(asc(Book.title))
        if author:
            books = books.filter(Book.author.ilike(f"%{author}%"))  # type: ignore
        if title:
            books = books.filter(Book.title.ilike(f"%{title}%"))  # type: ignore
        total = ceil(books.count() / per_page)
        books = books.paginate(page=page, per_page=per_page)
        return respond(
            data={
                "books": [
                    {
                        "id": book.id,
                        "created_at": book.created_at,
                        "updated_at": book.updated_at,
                        "author": book.author,
                        "title": book.title,
                        "image": book.image,
                    }
                    for book in books
                ],
                "total": total,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["GET"])
def show(id):
    try:
        book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        if not book:
            return respond_with_error()
        return respond(
            data={
                "id": book.id,
                "created_at": book.created_at,
                "updated_at": book.updated_at,
                "author": book.author,
                "title": book.title,
                "price": book.price,
                "description": book.description,
                "image": book.image,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["POST"])
def update(id):
    try:
        book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        if (not book) or (not "Authorization" in request.headers):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        # Save image
        file = request.files["image"]
        if file.filename == "" or not allowed_file(file.filename):
            return respond_with_error()
        file_name = "{}.jpg".format(uuid4())
        folder_path = os.path.join(os.getcwd(), "static")
        if not os.path.isdir(folder_path):
            os.mkdir(folder_path)
        file.save(os.path.join(folder_path, file_name))

        book.author = request.form.get("author")
        book.title = request.form.get("title")
        book.price = request.form.get("price")
        book.description = request.form.get("description")
        book.image = file_name
        db.session.add(book)
        db.session.commit()
        return respond()
    except Exception as error:
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["DELETE"])
def destroy(id):
    try:
        book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        if not book:
            return respond_with_error()
        book.deleted_at = datetime.now()
        db.session.add(book)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))
