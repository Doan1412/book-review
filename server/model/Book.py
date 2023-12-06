from datetime import datetime

from sqlalchemy import Column, Integer, String

from utils import get_db, unique_id

db = get_db()


class Book(db.Model):
    id = Column(String(100), primary_key=True)
    created_at = Column(String(100), nullable=True)
    updated_at = Column(String(100), nullable=True)
    deleted_at = Column(String(100), nullable=True)

    author = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(String(1000), nullable=False)
    image = Column(String(255), nullable=False)

    def __repr__(self) -> str:
        return f"<Book {self.title}>"

    def __init__(
        self, author: str, title: str, price: int, description: str, image_path: str
    ) -> None:
        self.id = unique_id()
        self.created_at = datetime.now()
        self.updated_at = None
        self.deleted_at = None

        self.author = author
        self.title = title
        self.price = price
        self.description = description
        self.image = image_path
