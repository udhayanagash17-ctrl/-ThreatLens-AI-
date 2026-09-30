from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SBOMUpload(BaseModel):
    filename: str
    content: str  # JSON string of SBOM data


class SBOMComponentResponse(BaseModel):
    id: int
    name: str
    version: str
    type: Optional[str] = None
    package_url: Optional[str] = None
    license: Optional[str] = None
    supplier: Optional[str] = None
    is_vulnerable: bool
    vuln_count: int
    max_cvss: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SBOMScanResponse(BaseModel):
    id: int
    filename: str
    format: str
    total_components: int
    vulnerable_components: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    created_at: datetime

    class Config:
        from_attributes = True
