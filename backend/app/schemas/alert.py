from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    alert_type: str
    vulnerability_id: Optional[int] = None
    asset_id: Optional[int] = None
    is_read: bool
    is_dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True
