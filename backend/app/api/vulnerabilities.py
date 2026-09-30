from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.vulnerability import Vulnerability
from app.schemas.vulnerability import VulnerabilityResponse, VulnerabilityUpdate
from app.services.ai import AIService

router = APIRouter()
ai_service = AIService()


@router.get("/", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Vulnerability)
    if severity:
        query = query.filter(Vulnerability.severity == severity.upper())
    if status:
        query = query.filter(Vulnerability.status == status.upper())
    return query.order_by(Vulnerability.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/stats")
def get_vulnerability_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Vulnerability).count()
    by_severity = {}
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        by_severity[sev] = db.query(Vulnerability).filter(Vulnerability.severity == sev).count()

    by_status = {}
    for st in ["OPEN", "IN_REVIEW", "REMEDIATED", "ACCEPTED", "FALSE_POSITIVE"]:
        by_status[st] = db.query(Vulnerability).filter(Vulnerability.status == st).count()

    return {
        "total": total,
        "by_severity": by_severity,
        "by_status": by_status,
    }


@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability(vuln_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vuln


@router.put("/{vuln_id}", response_model=VulnerabilityResponse)
def update_vulnerability(vuln_id: int, vuln_data: VulnerabilityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    for key, value in vuln_data.model_dump(exclude_unset=True).items():
        setattr(vuln, key, value)

    db.commit()
    db.refresh(vuln)
    return vuln


@router.post("/{vuln_id}/analyze")
async def analyze_vulnerability(vuln_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    finding_data = {
        "title": vuln.title,
        "severity": vuln.severity,
        "component": vuln.component,
        "component_version": vuln.component_version,
        "cve_id": vuln.cve_id,
        "description": vuln.description,
        "evidence": vuln.evidence,
        "remediation": vuln.remediation,
    }

    analysis = await ai_service.analyze_finding(finding_data)
    vuln.ai_analysis = analysis
    db.commit()

    return {"analysis": analysis}
