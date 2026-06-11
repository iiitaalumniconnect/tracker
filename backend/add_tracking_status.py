"""
Database Migration Script: Add Tracking Status Table

Run this script in the backend directory to add the new tracking_status table.

Usage:
    cd backend
    python add_tracking_status.py
"""

from app.core.database import engine, Base
from app.models.core_models import TrackingStatus

def migrate():
    """Create the tracking_status table"""
    print("🔄 Creating tracking_status table...")
    
    try:
        # Create table using SQLAlchemy
        Base.metadata.create_all(bind=engine, tables=[TrackingStatus.__table__])
        print("✅ Successfully created tracking_status table!")
        print("\n📊 Table Details:")
        print("  - Columns: id, alumni_id, is_tracking, tracking_paused_at, tracking_resumed_at, created_at, updated_at")
        print("  - Foreign Key: alumni_id -> alumni_master.id")
        print("  - Default Values: is_tracking = True (tracking enabled by default)")
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        return False
    
    return True

if __name__ == "__main__":
    migrate()
