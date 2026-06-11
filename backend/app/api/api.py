from fastapi import APIRouter
from app.api.endpoints import auth, alumni, upload, analytics, apify

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(alumni.router, prefix="/alumni", tags=["alumni"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(apify.router, prefix="/apify", tags=["apify"])
