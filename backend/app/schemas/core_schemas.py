from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AlumniBase(BaseModel):
    linkedin_url: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None

class AlumniCreate(AlumniBase):
    education: Optional[List[Any]] = None
    extra_data: Optional[Any] = None

class Alumni(AlumniBase):
    id: int
    experience: Optional[Any] = None
    education: Optional[Any] = None
    skills: Optional[Any] = None
    profile_picture: Optional[str] = None
    summary: Optional[str] = None
    languages: Optional[Any] = None
    certifications: Optional[Any] = None
    connection_count: Optional[int] = None
    follower_count: Optional[int] = None
    extra_data: Optional[Any] = None
    publications: Optional[Any] = None
    organisations: Optional[Any] = None
    position_groups: Optional[Any] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True

class UploadedFileSchema(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    status: str
    record_count: int

    class Config:
        from_attributes = True