"""
Script to populate 'Higher Qualification' field from education data
This runs against the PostgreSQL database used by the backend
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
from datetime import datetime

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg://postgres:alpha123@localhost:5433/postgres')

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Import models
import sys
sys.path.insert(0, './app')
from models.core_models import AlumniMaster, ChangeLog, AlumniHistory

def format_education_for_qualification(education_items):
    """Format education items into a readable qualification string"""
    if not education_items:
        return ""
    
    if not isinstance(education_items, list):
        education_items = [education_items]
    
    qualifications = []
    for edu in education_items:
        if isinstance(edu, dict):
            school = edu.get('school_name') or edu.get('schoolName') or 'Unknown Institution'
            degree = edu.get('degree') or edu.get('fieldOfStudy') or 'Degree'
            qual_str = f"{degree} from {school}"
            qualifications.append(qual_str)
    
    return " | ".join(qualifications) if qualifications else ""

# Main process
db = SessionLocal()

try:
    print("=" * 100)
    print("POPULATE 'HIGHER QUALIFICATION' FROM EDUCATION DATA")
    print("=" * 100)
    
    alumni_records = db.query(AlumniMaster).all()
    print(f"\nProcessing {len(alumni_records)} alumni record(s)...\n")
    
    updated_count = 0
    
    for alumni in alumni_records:
        extra_data = alumni.extra_data or {}
        current_higher_qual = extra_data.get('Higher Qualification', '')
        
        # If higher_qual is not set, try to fill from education data
        if not current_higher_qual and alumni.education:
            try:
                education_list = alumni.education
                if isinstance(education_list, str):
                    education_list = json.loads(education_list)
                
                new_higher_qual = format_education_for_qualification(education_list)
                
                if new_higher_qual:
                    print(f"{'='*100}")
                    print(f"Record {alumni.id}: {alumni.full_name}")
                    print(f"{'='*100}")
                    print(f"📚 Education data found: {type(education_list)}")
                    print(f"✅ Updating 'Higher Qualification'...")
                    print(f"   Value: {new_higher_qual}")
                    
                    # Store old state
                    old_extra_data_copy = json.dumps(extra_data)
                    
                    # Update extra_data
                    extra_data['Higher Qualification'] = new_higher_qual
                    alumni.extra_data = extra_data
                    alumni.last_updated = datetime.utcnow()
                    
                    # Log the change
                    change_log = ChangeLog(
                        alumni_id=alumni.id,
                        field_changed='extra_data → Higher Qualification',
                        old_value=current_higher_qual,
                        new_value=new_higher_qual,
                        detected_at=datetime.utcnow()
                    )
                    db.add(change_log)
                    
                    # Store in history
                    history = AlumniHistory(
                        alumni_id=alumni.id,
                        timestamp=datetime.utcnow(),
                        old_data=json.loads(old_extra_data_copy),
                        new_data=extra_data
                    )
                    db.add(history)
                    
                    updated_count += 1
                    print()
            except Exception as e:
                print(f"❌ Error processing Record {alumni.id}: {e}")
        elif current_higher_qual:
            print(f"Record {alumni.id} ({alumni.full_name}): Already has value - {current_higher_qual[:50]}...")
        else:
            print(f"Record {alumni.id} ({alumni.full_name}): No education data")
    
    # Commit all changes
    db.commit()
    
    print(f"\n{'='*100}")
    print(f"✅ SUMMARY: {updated_count} records updated")
    print(f"{'='*100}\n")
    
finally:
    db.close()

print("✅ Process completed!")
