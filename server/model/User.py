from datetime import datetime

from sqlalchemy import Column, Integer, String
from werkzeug.security import generate_password_hash

from utils import get_db, unique_id

db = get_db()


class User(db.Model):
    id = Column(String(100), primary_key=True)
    created_at = Column(String(100), nullable=True)
    updated_at = Column(String(100), nullable=True)
    deleted_at = Column(String(100), nullable=True)

    name = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    token = Column(String(255), nullable=False)
    role = Column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<User {self.first_name}>"

    def __init__(
        self,
        name: str,
        username: str,
        password: str,
        role: int = 0,
    ) -> None:
        self.id = unique_id()
        self.created_at = datetime.now()
        self.updated_at = None
        self.deleted_at = None

        self.name = name
        self.username = username
        self.password = generate_password_hash(password)
        self.token = unique_id()
        self.role = role
