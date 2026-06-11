from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Alumni Career Tracker"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE_URL: postgresql://user:password@localhost/alumni_tracker
    # We are using sqlite by default for easy local setup without docker.
    # To use postgresql, create a .env file and set DATABASE_URL.
    DATABASE_URL: str = "sqlite:///./alumni_tracker.db"
    JWT_SECRET_KEY: str = "wxlxq_coiv_l26EqMhHcUOpRQMQVQhnVfectBAu__SU"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    APIFY_API_TOKEN: Optional[str] = None
    BREVO_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
