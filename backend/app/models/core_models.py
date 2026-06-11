from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

class AlumniMaster(Base):
    __tablename__ = "alumni_master"
    
    id = Column(Integer, primary_key=True, index=True)
    linkedin_url = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    company = Column(String)
    designation = Column(String)
    location = Column(String)
    experience = Column(JSON)
    education = Column(JSON)
    skills = Column(JSON)
    profile_picture = Column(String)
    summary = Column(Text)
    languages = Column(JSON)
    certifications = Column(JSON)
    connection_count = Column(Integer)
    follower_count = Column(Integer)
    extra_data = Column(JSON)
    publications = Column(JSON)
    organisations = Column(JSON)
    position_groups = Column(JSON)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AlumniHistory(Base):
    __tablename__ = "alumni_history"
    
    id = Column(Integer, primary_key=True, index=True)
    alumni_id = Column(Integer, ForeignKey("alumni_master.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    old_data = Column(JSON)
    new_data = Column(JSON)

class ChangeLog(Base):
    __tablename__ = "change_log"
    
    id = Column(Integer, primary_key=True, index=True)
    alumni_id = Column(Integer, ForeignKey("alumni_master.id"))
    field_changed = Column(String)
    old_value = Column(String)
    new_value = Column(String)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="completed")
    record_count = Column(Integer, default=0)

class UploadAlumni(Base):
    __tablename__ = "upload_alumni"
    
    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id"))
    alumni_id = Column(Integer, ForeignKey("alumni_master.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScrapingJob(Base):
    __tablename__ = "scraping_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="pending") # pending, in_progress, completed
    total_profiles = Column(Integer, default=0)
    processed_profiles = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrackingStatus(Base):
    __tablename__ = "tracking_status"
    
    id = Column(Integer, primary_key=True, index=True)
    alumni_id = Column(Integer, ForeignKey("alumni_master.id"), unique=True, index=True)
    is_tracking = Column(Boolean, default=True)
    tracking_paused_at = Column(DateTime(timezone=True), nullable=True)
    tracking_resumed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
