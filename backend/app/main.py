from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import engine, Base
from app.api import api_router
from app.models import User, Asset, Scan, Vulnerability, SBOMComponent, SBOMScan, Alert

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default user
    Base.metadata.create_all(bind=engine)

    # Create default admin user if not exists
    from sqlalchemy.orm import Session
    from app.core.security import get_password_hash

    db = Session(engine)
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin",
                email="admin@threatlens.local",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role="admin",
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Attack Surface & Vulnerability Monitoring System",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered Attack Surface & Vulnerability Monitoring System",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
