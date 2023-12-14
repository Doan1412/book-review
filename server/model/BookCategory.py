from sqlalchemy import Column, String
from utils import get_db, unique_id
from datetime import datetime

db = get_db()

class BookCategory(db.Model):
    id = Column(String(100), primary_key=True)
    created_at = Column(String(100), nullable=True)
    updated_at = Column(String(100), nullable=True)
    deleted_at = Column(String(100), nullable=True)
    book_id = Column(String(100), nullable=False)
    category_id = Column(String(100), nullable=False)

    def __repr__(self) -> str:
        return f"<BookCategory {self.id}>"

    def __init__(self, book_id: str, category_id: str, name: str) -> None:
        self.id = unique_id()
        self.created_at = datetime.now()
        self.updated_at = None
        self.deleted_at = None
        self.book_id = book_id
        self.category_id = category_id
