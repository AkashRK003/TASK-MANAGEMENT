from sqlalchemy import Column, String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Contributor")
    avatar_url = Column(String, nullable=True)

    # Establish one-to-many relationship with tasks
    tasks = relationship("Task", back_populates="assigned_user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="Pending")  # 'Pending', 'In Progress', 'Completed'
    priority = Column(String, default="Medium")  # 'Low', 'Medium', 'High'
    due_date = Column(String, nullable=False)   # stored in YYYY-MM-DD
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Foreign Keys and relational mappings
    assigned_user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    assigned_user = relationship("User", back_populates="tasks")
