from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.asset import Asset
from app.models.vulnerability import Vulnerability
from app.models.alert import Alert
from app.schemas.scan import ScanCreate, ScanResponse
from app.services.scanner import WebScanner
from app.services.risk import RiskEngine
from app.services.vulnerability import VulnerabilityService

router = APIRouter()


@router.get("/", response_model=List[ScanResponse])
def get_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(Scan).order_by(Scan.started_at.desc()).offset(skip).limit(limit).all()
    return scans


@router.post("/run", response_model=ScanResponse)
async def run_scan(scan_data: ScanCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Create scan record
    db_scan = Scan(
        asset_id=scan_data.asset_id,
        scan_type=scan_data.scan_type,
        status="running",
        target=scan_data.target,
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    # Run scan
    scanner = WebScanner()
    scan_result = await scanner.scan(scan_data.target)

    # Update asset if provided
    if scan_data.asset_id:
        asset = db.query(Asset).filter(Asset.id == scan_data.asset_id).first()
        if asset:
            asset.https_enabled = scan_result["https_enabled"]
            asset.certificate_valid = scan_result["certificate_valid"]
            asset.security_headers_score = len(scan_result["security_headers"])
            asset.risk_score = scan_result["risk_score"]
            if scan_result["risk_score"] >= 80:
                asset.risk_level = "CRITICAL"
            elif scan_result["risk_score"] >= 60:
                asset.risk_level = "HIGH"
            elif scan_result["risk_score"] >= 40:
                asset.risk_level = "MEDIUM"
            else:
                asset.risk_level = "LOW"

    # Create vulnerability findings
    vuln_service = VulnerabilityService()
    findings = vuln_service.create_finding_from_scan(scan_result, scan_data.asset_id)

    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        severity_counts[f["severity"]] = severity_counts.get(f["severity"], 0) + 1

        # Calculate risk score
        risk_result = RiskEngine.calculate_risk_score(
            severity=f["severity"],
            confidence=f["confidence"],
        )

        db_vuln = Vulnerability(
            vuln_id=f["vuln_id"],
            title=f["title"],
            description=f["description"],
            severity=f["severity"],
            asset_id=scan_data.asset_id,
            asset_name=scan_data.target,
            evidence=f["evidence"],
            remediation=f["remediation"],
            detection_source=f["detection_source"],
            confidence=f["confidence"],
            status="OPEN",
            risk_score=risk_result["score"],
        )
        db.add(db_vuln)

        # Create alert for high/critical findings
        if f["severity"] in ["CRITICAL", "HIGH"]:
            db.add(Alert(
                title=f"New {f['severity']} Finding: {f['title']}",
                message=f"A {f['severity']} severity vulnerability was found in {scan_data.target}",
                severity=f["severity"],
                alert_type="new_vuln",
                asset_id=scan_data.asset_id,
            ))

    # Update scan record
    db_scan.status = "completed"
    db_scan.findings_count = len(findings)
    db_scan.critical_count = severity_counts.get("CRITICAL", 0)
    db_scan.high_count = severity_counts.get("HIGH", 0)
    db_scan.medium_count = severity_counts.get("MEDIUM", 0)
    db_scan.low_count = severity_counts.get("LOW", 0)
    db_scan.risk_score = scan_result["risk_score"]
    db_scan.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_scan)
    return db_scan


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
