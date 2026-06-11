from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.core_models import UploadedFile

# Create database engine
engine = create_engine("postgresql+psycopg://postgres:alpha123@localhost:5433/")
Session = sessionmaker(bind=engine)
db = Session()

try:
    files = db.query(UploadedFile).order_by(UploadedFile.id.desc()).all()
    for f in files:
        print(f"ID: {f.id}, Filename: {f.filename}, Status: {f.status}, Record Count: {f.record_count}")
finally:
    db.close()
