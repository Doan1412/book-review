import os
from datetime import datetime
from math import ceil
from uuid import uuid4

from flask import Blueprint, request
from sqlalchemy import asc

from model.Book import Book
from model.User import User
from model.Comment import Comment
from utils import *

comment_bp = Blueprint("comment", __name__)
db = get_db()

@comment_bp.route('', methods=['POST'])
def store():
    requires = ["book_id","user_id","content", "star"]
    try:
        if (not valid_request(request, requires)) or (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) :
            return respond_with_error()
        req = request.get_json()
        new_comment = Comment(book_id=req["book_id"], user_id=req["user_id"], content=req["content"], star=req["star"])
        db.session.add(new_comment)
        db.session.commit()
        return respond()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


# Lấy thông tin của một bình luận dựa trên ID
@comment_bp.route('/<comment_id>', methods=['GET'])
def get_comment(comment_id):
    try:
        if ( 
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) :
            return respond_with_error()
        comment = Comment.query(Comment).filter(Comment.id == comment_id).first()

        return respond(data={
            'id': comment.id,
            'book_id': comment.book_id,
            'user_id': comment.user_id,
            'content': comment.content,
            'star': comment.star,
            'created_at': comment.created_at,
            'updated_at': comment.updated_at,
            'deleted_at': comment.deleted_at
        })
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))


# Cập nhật thông tin của một bình luận dựa trên ID
@comment_bp.route('/<comment_id>', methods=['PUT'])
def update_comment(comment_id):
    requires = ["content", "star"]
    try:
        if (not valid_request(request, requires)) or (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) :
            return respond_with_error()
        comment = Comment.query(Comment).filter(Comment.id == comment_id).first()

        if comment:
            data = request.json
            comment.content = data.get('content', comment.content)
            comment.star = data.get('star', comment.star)
            comment.updated_at = datetime.now()

            db.session.commit()
            db.session.close()

            return respond()
        else:
            return respond_with_error()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))

# Xóa một bình luận dựa trên ID
@comment_bp.route('/<comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        if (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) :
            return respond_with_error()
        session = db.session()
        comment = Comment.query.filter(Comment.id == comment_id).first()

        if comment:
            comment.deleted_at = datetime.now()
            session.commit()
            session.close()

            return respond()
        else:
            return respond_with_error()
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))
    

@comment_bp.route('/book/<book_id>', methods=['DELETE'])
def get_by_book_id(book_id):
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    try:
        if (
            not "Authorization" in request.headers
        ):
            return respond_with_error()
        user = User.query.filter_by(token=request.headers.get("Authorization")).first()
        if (not user) or (user.role == 0):
            return respond_with_error()
        comments = Comment.query.filter_by(Comment.book_id == book_id).order_by(Comment.created_at.desc()).all()
        comments = comments.paginate(page=page, per_page=per_page)
        comment_list = []
        for comment in comments.items:
            user_of_comment = User.query.filter_by(id=comment.user_id).first()
            if user_of_comment:
                user_full_name = f"{user_of_comment.first_name} {user_of_comment.last_name}"
            else:
                user_full_name = "Unknown"

            comment_data = {
                'id': comment.id,
                'book_id': comment.book_id,
                'user_name': user_full_name,
                'content': comment.content,
                'star': comment.star,
                'created_at': comment.created_at,
                'updated_at': comment.updated_at,
            }
            comment_list.append(comment_data)

        return respond(data=comment_list)
    except Exception as error:
        db.session.rollback()
        return respond_with_error(error=str(error))