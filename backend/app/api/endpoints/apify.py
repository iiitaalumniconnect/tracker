from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.apify_service import apify_service
from app.services import alumni_service
from app.services.comparison_engine import comparison_engine
from app.models import core_models

router = APIRouter()


@router.get("/track-profile")
def track_profile(linkedin_url: str, db: Session = Depends(get_db)):
    result = apify_service.enrich_linkedin_profile(linkedin_url)

    if not result:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch profile data"
        )

    # Store or update the scraped profile in the database
    alumni = alumni_service.get_alumni_by_url(db, linkedin_url=linkedin_url)
    if alumni:
        # Update existing record and log changes in change_log and alumni_history
        comparison_engine.compare_and_update(db, alumni.id, result)
    else:
        # Create a new record with all scraped fields
        db_alumni = core_models.AlumniMaster(
            linkedin_url=result.get("linkedin_url", linkedin_url),
            full_name=result.get("full_name"),
            company=result.get("company"),
            designation=result.get("designation"),
            location=result.get("location"),
            experience=result.get("experience"),
            education=result.get("education"),
            skills=result.get("skills"),
            profile_picture=result.get("profile_picture"),
            summary=result.get("summary"),
            languages=result.get("languages"),
            certifications=result.get("certifications"),
            connection_count=result.get("connection_count"),
            follower_count=result.get("follower_count"),
            publications=result.get("publications"),
            organisations=result.get("organisations"),
            position_groups=result.get("position_groups")
        )
        db.add(db_alumni)
        db.commit()
        db.refresh(db_alumni)

    return result
