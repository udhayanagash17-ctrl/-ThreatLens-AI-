from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class SBOMComponent(Base):
    __tablename__ = "sbom_components"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    type = Column(String, nullable=True)  # library, framework, application
    package_url = Column(String, nullable=True)
    license = Column(String, nullable=True)
    supplier = Column(String, nullable=True)
    is_vulnerable = Column(Boolean, default=False)
    vuln_count = Column(Integer, default=0)
    max_cvss = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SBOMScan(Base):
    __tablename__ = "sbom_scans"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    format = Column(String, nullable=False)  # spdx, cyclonedx
    total_components = Column(Integer, default=0)
    vulnerable_components = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
