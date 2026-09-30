from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ScanCreate(BaseModel):
    asset_id: Optional[int] = None
    scan_type: str = "web"
    target: str


class ScanResponse(BaseModel):
    id: int
    asset_id: Optional[int] = None
    scan_type: str
    status: str
    target: str
    findings_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    risk_score: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
