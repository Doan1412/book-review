from datetime import datetime

from sqlalchemy import Column, Integer, String

from utils import get_db, unique_id

db = get_db()


class Comment(db.Model):
    id = Column(String(100), primary_key=True)
    created_at = Column(String(100), nullable=True)
    updated_at = Column(String(100), nullable=True)
    deleted_at = Column(String(100), nullable=True)

    book_id = Column(String(100), nullable=False)
    user_id = Column(String(100), nullable=False)
    content = Column(String(1000), nullable=False)
    star = Column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<Comment {self.id}>"

    def __init__(self, book_id: str, user_id: str, content: str, star: int) -> None:
        self.id = unique_id()
        self.created_at = datetime.now()
        self.updated_at = None
        self.deleted_at = None

        self.book_id = book_id
        self.user_id = user_id
        self.content = content
        self.star = star
