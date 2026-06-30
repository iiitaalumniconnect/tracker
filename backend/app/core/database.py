# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from app.core.config import settings

# print("DATABASE_URL =", repr(settings.DATABASE_URL))

# if not settings.DATABASE_URL:
#     raise ValueError("DATABASE_URL is empty")

# if settings.DATABASE_URL.startswith("sqlite"):
#     engine = create_engine(
#         settings.DATABASE_URL,
#         connect_args={"check_same_thread": False}
#     )
# else:
#     engine = create_engine(settings.DATABASE_URL)

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

print("DATABASE_URL =", repr(settings.DATABASE_URL))

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL is empty")

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,  # Keep up to 20 persistent connections
    max_overflow=40,  # Allow 40 temporary extra connections
    pool_timeout=60,  # Wait up to 60 seconds for a free connection
    pool_recycle=1800,  # Recycle connections every 30 minutes
    pool_pre_ping=True,  # Automatically reconnect dead connections
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
