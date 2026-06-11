from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.core_models import Base, User
from app.core.security import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.email == "iit2023187@iiita.ac.in").first()
    if not admin:
        admin_user = User(
            email="iit2023187@iiita.ac.in",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created: iit2023187@iiita.ac.in / admin123")
    else:
        print("Admin user already exists")
        
    db.close()

if __name__ == "__main__":
    init_db()
