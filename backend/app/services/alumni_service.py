from sqlalchemy.orm import Session
from app.models.core_models import AlumniMaster
from app.schemas.core_schemas import AlumniCreate
from typing import List, Optional


def get_alumni(db: Session, alumni_id: int) -> Optional[AlumniMaster]:
    return db.query(AlumniMaster).filter(
        AlumniMaster.id == alumni_id
    ).first()


def get_alumni_by_url(
    db: Session,
    linkedin_url: str
) -> Optional[AlumniMaster]:
    return db.query(AlumniMaster).filter(
        AlumniMaster.linkedin_url == linkedin_url
    ).first()


def get_alumni_list(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    query: Optional[str] = None,
    company: Optional[str] = None,
    location: Optional[str] = None
) -> List[AlumniMaster]:

    q = db.query(AlumniMaster)

    if query:
        q = q.filter(
            (AlumniMaster.full_name.ilike(f"%{query}%"))
            | (AlumniMaster.company.ilike(f"%{query}%"))
            | (AlumniMaster.designation.ilike(f"%{query}%"))
            | (AlumniMaster.location.ilike(f"%{query}%"))
        )

    if company:
        q = q.filter(
            AlumniMaster.company.ilike(f"%{company}%")
        )

    if location:
        q = q.filter(
            AlumniMaster.location.ilike(f"%{location}%")
        )

    return (
        q.order_by(AlumniMaster.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_alumni(
    db: Session,
    alumni: AlumniCreate
) -> AlumniMaster:

    db_alumni = AlumniMaster(
        linkedin_url=alumni.linkedin_url,
        full_name=alumni.full_name,
        company=alumni.company,
        designation=alumni.designation,
        location=alumni.location,
        education=alumni.education,
        extra_data=alumni.extra_data
    )

    db.add(db_alumni)

    try:
        db.commit()
        db.refresh(db_alumni)
        return db_alumni

    except Exception as e:
        db.rollback()
        print(f"Error creating alumni: {e}")
        raise


def update_alumni(
    db: Session,
    alumni_id: int,
    alumni_update: dict
) -> Optional[AlumniMaster]:

    db_alumni = get_alumni(db, alumni_id)

    if not db_alumni:
        return None

    for key, value in alumni_update.items():
        if hasattr(db_alumni, key):
            setattr(db_alumni, key, value)

    try:
        db.commit()
        db.refresh(db_alumni)
        return db_alumni

    except Exception as e:
        db.rollback()
        print(f"Error updating alumni: {e}")
        raise


def delete_alumni(
    db: Session,
    alumni_id: int
) -> bool:

    db_alumni = get_alumni(db, alumni_id)

    if not db_alumni:
        return False

    try:
        db.delete(db_alumni)
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print(f"Error deleting alumni: {e}")
        raise