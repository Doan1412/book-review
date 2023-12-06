from datetime import datetime

from sqlalchemy import Column, String

from utils import get_db, unique_id

db = get_db()


class Category(db.Model):
    id = Column(String(100), primary_key=True)
    created_at = Column(String(100), nullable=True)
    updated_at = Column(String(100), nullable=True)
    deleted_at = Column(String(100), nullable=True)

    name = Column(String(255), nullable=False)

    def __repr__(self) -> str:
        return f"<Category {self.name}>"

    def __init__(self, name: str) -> None:
        self.id = unique_id()
        self.created_at = datetime.now()
        self.updated_at = None
        self.deleted_at = None

        self.name = name
