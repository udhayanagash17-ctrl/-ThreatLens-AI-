from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # domain, ip, web_app, api, service
    url = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    technology = Column(String, nullable=True)
    https_enabled = Column(Boolean, default=False)
    certificate_valid = Column(Boolean, default=False)
    certificate_expiry = Column(DateTime, nullable=True)
    security_headers_score = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="LOW")  # CRITICAL, HIGH, MEDIUM, LOW
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
