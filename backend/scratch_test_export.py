import sys
import os

# Add the current directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.core_models import UploadedFile
from app.api.endpoints.alumni import export_alumni

engine = create_engine("postgresql+psycopg://postgres:alpha123@localhost:5433/")
Session = sessionmaker(bind=engine)
db = Session()

try:
    # 1. Test general export (upload_id = None)
    print("Testing general export (upload_id = None)...")
    try:
        response = export_alumni(upload_id=None, db=db)
        print("General export: SUCCESS. Response type:", type(response))
    except Exception as e:
        print("General export: FAILED")
        import traceback
        traceback.print_exc()
    
    # 2. Test each completed upload
    files = db.query(UploadedFile).filter(UploadedFile.status == 'completed').order_by(UploadedFile.id.desc()).all()
    print(f"\nFound {len(files)} completed uploads. Testing export for each...")
    for f in files:
        print(f"Testing export for ID {f.id} (Filename: {f.filename})...")
        try:
            response = export_alumni(upload_id=f.id, db=db)
            print(f"ID {f.id}: SUCCESS")
        except Exception as e:
            print(f"ID {f.id}: FAILED")
            import traceback
            traceback.print_exc()

finally:
    db.close()
