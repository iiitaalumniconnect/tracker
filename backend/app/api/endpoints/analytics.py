from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.core_models import AlumniMaster, UploadedFile, ChangeLog

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_alumni = db.query(AlumniMaster).count()
    total_uploads = db.query(UploadedFile).count()
    total_changes_detected = db.query(ChangeLog).count()
    
    # Calculate some mock basic stats
    return {
        "total_alumni": total_alumni,
        "total_uploads": total_uploads,
        "total_changes": total_changes_detected
    }

@router.get("/country-distribution")
def get_country_distribution(db: Session = Depends(get_db)):
    from sqlalchemy import func, case
    
    results = db.query(AlumniMaster.location).filter(
        AlumniMaster.location.isnot(None)
    ).all()
    
    country_counts = {}
    for (location,) in results:
        if location:
            country = location.split(',')[-1].strip() if ',' in location else location
            country_counts[country] = country_counts.get(country, 0) + 1
    
    distribution = [
        {"country": country, "count": count}
        for country, count in sorted(country_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return distribution

@router.get("/company-distribution")
def get_company_distribution(db: Session = Depends(get_db)):
    results = db.query(AlumniMaster.company).filter(
        AlumniMaster.company.isnot(None),
        AlumniMaster.company != ""
    ).all()
    
    company_counts = {}
    for (company,) in results:
        if company:
            clean_company = company.strip()
            if clean_company and clean_company.lower() not in ('nan', 'none', 'null', ''):
                # Standardize capitalization if necessary, but preserving original is usually best
                company_counts[clean_company] = company_counts.get(clean_company, 0) + 1
                
    distribution = [
        {"company": company, "count": count}
        for company, count in sorted(company_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return distribution

@router.get("/changelog")
def get_changelog(db: Session = Depends(get_db)):
    from app.models.core_models import TrackingStatus
    
    results = db.query(ChangeLog, AlumniMaster.full_name, AlumniMaster.linkedin_url, TrackingStatus.is_tracking)\
        .join(AlumniMaster, ChangeLog.alumni_id == AlumniMaster.id)\
        .outerjoin(TrackingStatus, ChangeLog.alumni_id == TrackingStatus.alumni_id)\
        .order_by(ChangeLog.detected_at.desc())\
        .limit(100)\
        .all()
    
    return [
        {
            "id": c.ChangeLog.id,
            "alumni_id": c.ChangeLog.alumni_id,
            "full_name": c.full_name,
            "linkedin_url": c.linkedin_url,
            "field_changed": c.ChangeLog.field_changed,
            "old_value": c.ChangeLog.old_value,
            "new_value": c.ChangeLog.new_value,
            "detected_at": c.ChangeLog.detected_at,
            "is_tracking": c.is_tracking if c.is_tracking is not None else True
        } for c in results
    ]

@router.post("/tracking/stop/{alumni_id}")
def stop_tracking(alumni_id: int, db: Session = Depends(get_db)):
    from app.models.core_models import TrackingStatus
    
    # Check if alumni exists
    alumni = db.query(AlumniMaster).filter(AlumniMaster.id == alumni_id).first()
    if not alumni:
        return {"success": False, "message": "Alumni not found"}
    
    # Get or create tracking status
    tracking = db.query(TrackingStatus).filter(TrackingStatus.alumni_id == alumni_id).first()
    if not tracking:
        tracking = TrackingStatus(alumni_id=alumni_id, is_tracking=False, tracking_paused_at=func.now())
    else:
        tracking.is_tracking = False
        tracking.tracking_paused_at = func.now()
    
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    
    return {
        "success": True,
        "message": f"Tracking stopped for {alumni.full_name}",
        "alumni_id": alumni_id,
        "alumni_name": alumni.full_name,
        "tracking_paused_at": tracking.tracking_paused_at
    }

@router.post("/tracking/resume/{alumni_id}")
def resume_tracking(alumni_id: int, db: Session = Depends(get_db)):
    from app.models.core_models import TrackingStatus
    
    # Check if alumni exists
    alumni = db.query(AlumniMaster).filter(AlumniMaster.id == alumni_id).first()
    if not alumni:
        return {"success": False, "message": "Alumni not found"}
    
    # Get or create tracking status
    tracking = db.query(TrackingStatus).filter(TrackingStatus.alumni_id == alumni_id).first()
    if not tracking:
        tracking = TrackingStatus(alumni_id=alumni_id, is_tracking=True, tracking_resumed_at=func.now())
    else:
        tracking.is_tracking = True
        tracking.tracking_resumed_at = func.now()
    
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    
    return {
        "success": True,
        "message": f"Tracking resumed for {alumni.full_name}",
        "alumni_id": alumni_id,
        "alumni_name": alumni.full_name,
        "tracking_resumed_at": tracking.tracking_resumed_at
    }
