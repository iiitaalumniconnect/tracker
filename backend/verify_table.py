"""Verify tracking_status table was created"""
from app.core.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()

print("📋 Database Tables:")
for table in sorted(tables):
    print(f"  ✓ {table}")

if 'tracking_status' in tables:
    print("\n✅ tracking_status table found!")
    print("\n📊 Table Columns:")
    columns = inspector.get_columns('tracking_status')
    for col in columns:
        col_type = str(col['type'])
        nullable = "NULL" if col['nullable'] else "NOT NULL"
        print(f"  - {col['name']}: {col_type} ({nullable})")
    
    print("\n✨ Feature is ready to use!")
else:
    print("\n❌ tracking_status table NOT found!")
