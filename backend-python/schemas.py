from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = "Contributor"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    status: str = "Pending"  # "Pending", "In Progress", "Completed"
    priority: str = "Medium" # "Low", "Medium", "High"
    due_date: str            # YYYY-MM-DD

class TaskCreate(TaskBase):
    assigned_user_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    assigned_user_id: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime
    assigned_user_id: Optional[str] = None
    assigned_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
