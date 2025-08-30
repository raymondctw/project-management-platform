from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from passlib.hash import bcrypt

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="member")  # member, admin
    is_active = Column(Boolean, default=True)

    # Relationships
    projects = relationship("Project", back_populates="owner")
    assigned_tasks = relationship("Task", back_populates="assigned_to")

    def verify_password(self, password):
        return bcrypt.verify(password, self.hashed_password)
    
    @classmethod
    def hash_password(cls, password):
        return bcrypt.hash(password)
