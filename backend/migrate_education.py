"""
Migration script to move "Course completed from IIITA (Highest Degree)" 
from extra_data to education field for existing alumni records
"""
from app.core.database import SessionLocal
from app.models.core_models import AlumniMaster
import json

def migrate_education_data():
    db = SessionLocal()
    try:
        # Query all alumni records
        alumni_list = db.query(AlumniMaster).all()
        migrated_count = 0
        
        for alumni in alumni_list:
            # Check if extra_data has the degree field
            if not alumni.extra_data:
                continue
            
            # Handle extra_data as dict or string
            extra_data = alumni.extra_data
            if isinstance(extra_data, str):
                try:
                    extra_data = json.loads(extra_data)
                except:
                    continue
            
            if not isinstance(extra_data, dict):
                continue
            
            # Look for the degree field (case-insensitive)
            degree_value = None
            degree_key = None
            
            for key, value in extra_data.items():
                if key.lower().replace(" ", "").replace("_", "") == "coursecompletedfromiitahighestdegree":
                    degree_value = value
                    degree_key = key
                    break
                elif key.lower() in ["highest_degree", "highestdegree", "degree"]:
                    degree_value = value
                    degree_key = key
                    break
            
            if not degree_value or (isinstance(degree_value, str) and degree_value.lower() in ["nan", "none", ""]):
                continue
            
            # Create education entry if it doesn't exist
            education = alumni.education
            if isinstance(education, str):
                try:
                    education = json.loads(education)
                except:
                    education = []
            
            if not isinstance(education, list):
                education = []
            
            # Check if we already have IIIT Allahabad entry
            has_iiit_entry = any(
                isinstance(edu, dict) and (
                    edu.get("schoolName", "").lower() == "iiit allahabad" or
                    edu.get("school", "").lower() == "iiit allahabad"
                )
                for edu in education
            )
            
            if not has_iiit_entry:
                # Add education entry
                education.append({
                    "schoolName": "IIIT Allahabad",
                    "degree": str(degree_value).strip()
                })
                
                # Update the alumni record
                alumni.education = education
                
                # Remove from extra_data if needed (optional)
                if degree_key and degree_key in extra_data:
                    del extra_data[degree_key]
                    alumni.extra_data = extra_data
                
                db.add(alumni)
                migrated_count += 1
        
        # Commit all changes
        db.commit()
        print(f"✅ Migration completed successfully!")
        print(f"   Migrated {migrated_count} alumni records")
        print(f"   Moved 'Course completed from IIITA (Highest Degree)' to education field")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_education_data()
