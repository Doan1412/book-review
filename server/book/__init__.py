from flask import Blueprint

from utils import get_db

book_bp = Blueprint("book", __name__)
db = get_db()
