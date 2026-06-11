from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.core_models import AlumniMaster

# Create database engine
engine = create_engine("postgresql+psycopg://postgres:alpha123@localhost:5433/")
Session = sessionmaker(bind=engine)
db = Session()

try:
    alumni = db.query(AlumniMaster).filter(AlumniMaster.linkedin_url.like("%adityaupreti%")).first()
    if alumni:
        print("Alumni found:")
        print("Name:", alumni.full_name)
        print("Company:", alumni.company)
        print("Designation:", alumni.designation)
        print("Location:", alumni.location)
        print("Education:", alumni.education)
    else:
        print("Alumni not found")
finally:
    db.close()
