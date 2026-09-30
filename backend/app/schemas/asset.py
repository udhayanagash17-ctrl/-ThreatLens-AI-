from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AssetCreate(BaseModel):
    name: str
    type: str
    url: Optional[str] = None
    ip_address: Optional[str] = None
    description: Optional[str] = None
    technology: Optional[str] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technology: Optional[str] = None
    is_active: Optional[bool] = None


class AssetResponse(BaseModel):
    id: int
    name: str
    type: str
    url: Optional[str] = None
    ip_address: Optional[str] = None
    description: Optional[str] = None
    technology: Optional[str] = None
    https_enabled: bool
    certificate_valid: bool
    certificate_expiry: Optional[datetime] = None
    security_headers_score: int
    risk_score: float
    risk_level: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
