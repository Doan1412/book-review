import os
from datetime import datetime
from math import ceil
from uuid import uuid4

from flask import Blueprint, request
from sqlalchemy import asc

from model.Book import Book
from model.User import User
from model.Comment import Comment
from model.BookCategory import BookCategory
from model.Category import Category
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
        
        category_ids = request.form.getlist("category_ids")  
        print(category_ids)
        for category_id in category_ids:
            category = Category.query.get(category_id)
            if not category:
                db.session.rollback()
                return respond_with_error(message=f"Category with ID {category_id} not found")

            book_category = BookCategory(
                book_id=book.id,
                category_id=category_id
            )
            print(book_category)
            db.session.add(book_category)

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
        # books = Book.query.order_by(asc(Book.title))
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

@book_bp.route("/category/<id>", methods=["GET"])
def get_category(id):
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    try:
        category = Category.query.get(id)
        if not category:
            return respond_with_error(message="Category not found")

        # Khởi tạo danh sách books
        books = []

        # Lấy danh sách book_ids thuộc category
        book_ids = BookCategory.query.filter_by(category_id=id).all()

        # Lấy thông tin từng cuốn sách
        for book_id in book_ids:
            book = Book.query.filter_by(id=book_id.book_id).first()
            if book:
                books.append(book)

        # Phân trang danh sách books
        total = ceil(len(books) / per_page)
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        paginated_books = books[start_index:end_index]

        return respond(
            data={
                "category": {
                    "id": category.id,
                    "name": category.name,
                    # Thêm thông tin khác của category nếu cần
                },
                "books": [
                    {
                        "id": book.id,
                        "created_at": book.created_at,
                        "updated_at": book.updated_at,
                        "author": book.author,
                        "title": book.title,
                        "image": book.image,
                    }
                    for book in paginated_books
                ],
                "total": total,
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["GET"])
def show(id):
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    try:
        # book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        book = Book.query.filter(Book.id == id).first()
        if not book:
            return respond_with_error()
        comments = Comment.query.filter(Comment.book_id == id, Comment.deleted_at == None).order_by(Comment.created_at.desc()).paginate(page=page, per_page=per_page)
        comment_list = []
        for comment in comments.items:
            user_of_comment = User.query.filter_by(id=comment.user_id).first()
            if user_of_comment:
                username = user_of_comment.username
                user_full_name = f"{user_of_comment.first_name} {user_of_comment.last_name}"
            else:
                username = "Unknown"
                user_full_name = "Unknown"

            comment_data = {
                'id': comment.id,
                'fullname': user_full_name,
                'content': comment.content,
                'star': comment.star,
                'created_at': comment.created_at,
                'updated_at': comment.updated_at,
                'username' : username, 
            }
            comment_list.append(comment_data)
        book_categories = BookCategory.query.filter_by(book_id=book.id).all()
        categories = []
        for book_category in book_categories:
            category = Category.query.filter_by(id=book_category.category_id).first()
            if category:
                categories.append({
                    "id": category.id,
                    "name": category.name
                })
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
                "reviews": comment_list,
                "categories": categories
            }
        )
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["POST"])
def update(id):
    try:
        # book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        book = Book.query.filter(Book.id == id).first()
        if (not book) or (not "Authorization" in request.headers):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        print(user.role)
        if (not user) or (user.role == 0):
            return respond_with_error()
        # Save image
        if "image" in request.files :
            file = request.files["image"]
            if file.filename == "" or not allowed_file(file.filename):
                return respond_with_error()
            file_name = "{}.jpg".format(uuid4())
            folder_path = os.path.join(os.getcwd(), "static")
            if not os.path.isdir(folder_path):
                os.mkdir(folder_path)
            file.save(os.path.join(folder_path, file_name))
            book.image = file_name
        updated_category_ids = request.form.getlist("category_ids")
        print(updated_category_ids)
        BookCategory.query.filter_by(book_id=book.id).delete()
        print("check1")
        for category_id in updated_category_ids:
            category = Category.query.filter_by(id = category_id).first()
            print ( category.name)
            if not category:
                db.session.rollback()
                return respond_with_error(message=f"Category with ID {category_id} not found")

            book_category = BookCategory (
                book_id=book.id,
                category_id=category_id
            )
            print(book_category)
            db.session.add(book_category)
            
        book.author = request.form.get("author")
        book.title = request.form.get("title")
        book.price = request.form.get("price")
        book.description = request.form.get("description")
        db.session.add(book)
        db.session.commit()
        return respond()
    except Exception as error:
        return respond_with_error(error=str(error))


@book_bp.route("/<id>", methods=["DELETE"])
def destroy(id):
    try:
        if not "Authorization" in request.headers:
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        book = Book.query.filter_by(deleted_at=None).filter(Book.id == id).first()
        book_categories = BookCategory.query.filter(book.id == id).all()
        for category in book_categories:
            db.session.delete(category)
        if not book:
            return respond_with_error()
        book.deleted_at = datetime.now()
        db.session.add(book)
        db.session.delete(book)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))
