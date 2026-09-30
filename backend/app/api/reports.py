from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.vulnerability import Vulnerability
from app.models.asset import Asset
from app.models.scan import Scan
from app.services.ai import AIService

router = APIRouter()
ai_service = AIService()


@router.get("/summary")
async def get_report_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Gather statistics
    total_assets = db.query(Asset).count()
    total_vulns = db.query(Vulnerability).count()
    total_scans = db.query(Scan).count()

    severity_counts = {}
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        severity_counts[sev] = db.query(Vulnerability).filter(Vulnerability.severity == sev).count()

    # Calculate overall risk score
    risk_score = 0
    if total_vulns > 0:
        risk_score = (
            severity_counts.get("CRITICAL", 0) * 25 +
            severity_counts.get("HIGH", 0) * 15 +
            severity_counts.get("MEDIUM", 0) * 8 +
            severity_counts.get("LOW", 0) * 3
        )
        risk_score = min(100, risk_score)

    # Generate executive summary
    exec_summary = await ai_service.generate_executive_summary({
        "total_findings": total_vulns,
        "critical": severity_counts.get("CRITICAL", 0),
        "high": severity_counts.get("HIGH", 0),
        "medium": severity_counts.get("MEDIUM", 0),
        "low": severity_counts.get("LOW", 0),
        "total_assets": total_assets,
        "overall_risk_score": risk_score,
    })

    # Get recent findings
    recent_vulns = db.query(Vulnerability).order_by(Vulnerability.created_at.desc()).limit(10).all()

    # Get affected assets
    affected_assets = db.query(Asset).filter(Asset.risk_score > 0).all()

    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "scan_info": {
            "scanner": "ThreatLens AI",
            "version": "1.0.0",
            "scan_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        },
        "executive_summary": exec_summary,
        "statistics": {
            "total_assets": total_assets,
            "total_vulnerabilities": total_vulns,
            "total_scans": total_scans,
            "severity_distribution": severity_counts,
            "overall_risk_score": risk_score,
        },
        "recent_findings": [
            {
                "id": v.vuln_id,
                "title": v.title,
                "severity": v.severity,
                "status": v.status,
                "asset": v.asset_name,
                "created_at": v.created_at.isoformat(),
            }
            for v in recent_vulns
        ],
        "affected_assets": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
            }
            for a in affected_assets
        ],
    }

    return JSONResponse(content=report)


@router.get("/full")
async def get_full_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get all vulnerabilities
    vulns = db.query(Vulnerability).order_by(Vulnerability.created_at.desc()).all()

    # Get all assets
    assets = db.query(Asset).all()

    # Get all scans
    scans = db.query(Scan).order_by(Scan.started_at.desc()).all()

    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "scan_info": {
            "scanner": "ThreatLens AI",
            "version": "1.0.0",
            "scan_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        },
        "assets": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "url": a.url,
                "technology": a.technology,
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
                "https_enabled": a.https_enabled,
                "certificate_valid": a.certificate_valid,
            }
            for a in assets
        ],
        "vulnerabilities": [
            {
                "id": v.vuln_id,
                "title": v.title,
                "severity": v.severity,
                "status": v.status,
                "asset": v.asset_name,
                "component": v.component,
                "cve_id": v.cve_id,
                "description": v.description,
                "evidence": v.evidence,
                "remediation": v.remediation,
                "risk_score": v.risk_score,
                "created_at": v.created_at.isoformat(),
            }
            for v in vulns
        ],
        "scans": [
            {
                "id": s.id,
                "type": s.scan_type,
                "target": s.target,
                "status": s.status,
                "findings_count": s.findings_count,
                "risk_score": s.risk_score,
                "started_at": s.started_at.isoformat(),
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            }
            for s in scans
        ],
    }

    return JSONResponse(content=report)
