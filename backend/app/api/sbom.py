from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.sbom import SBOMComponent, SBOMScan
from app.models.vulnerability import Vulnerability
from app.models.alert import Alert
from app.schemas.sbom import SBOMComponentResponse, SBOMScanResponse
from app.services.sbom_scanner import SBOMScanner
from app.services.risk import RiskEngine

router = APIRouter()


@router.post("/upload")
async def upload_sbom(sbom_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    filename = sbom_data.get("filename", "sbom.json")
    content = sbom_data.get("content", {})

    scanner = SBOMScanner()
    result = await scanner.scan(content, filename)

    # Save SBOM scan record
    db_sbom_scan = SBOMScan(
        filename=filename,
        format=result["format"],
        total_components=result["total_components"],
        vulnerable_components=result["vulnerable_components"],
        critical_count=result["severity_counts"].get("CRITICAL", 0),
        high_count=result["severity_counts"].get("HIGH", 0),
        medium_count=result["severity_counts"].get("MEDIUM", 0),
        low_count=result["severity_counts"].get("LOW", 0),
    )
    db.add(db_sbom_scan)

    # Save components
    for comp in result["components"]:
        db_comp = SBOMComponent(
            name=comp["name"],
            version=comp["version"],
            type=comp.get("type"),
            package_url=comp.get("package_url"),
            license=comp.get("license"),
            supplier=comp.get("supplier"),
            is_vulnerable=comp["is_vulnerable"],
            vuln_count=comp.get("vuln_count", 0),
            max_cvss=comp.get("max_cvss"),
        )
        db.add(db_comp)

    # Create vulnerability findings
    for f in result["findings"]:
        risk_result = RiskEngine.calculate_risk_score(
            severity=f["severity"],
            confidence=f["confidence"],
            cvss_score=f.get("cvss_score"),
        )

        db_vuln = Vulnerability(
            vuln_id=f["vuln_id"],
            title=f["title"],
            description=f["description"],
            severity=f["severity"],
            cvss_score=f.get("cvss_score"),
            component=f["component"],
            component_version=f["component_version"],
            cve_id=f.get("cve_id"),
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
                message=f"A {f['severity']} severity vulnerability was found in {f['component']} {f['component_version']}",
                severity=f["severity"],
                alert_type="new_vuln",
            ))

    db.commit()

    return {
        "message": "SBOM analyzed successfully",
        "total_components": result["total_components"],
        "vulnerable_components": result["vulnerable_components"],
        "findings_count": len(result["findings"]),
        "severity_counts": result["severity_counts"],
    }


@router.get("/components", response_model=List[SBOMComponentResponse])
def get_components(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SBOMComponent).offset(skip).limit(limit).all()


@router.get("/scans", response_model=List[SBOMScanResponse])
def get_sbom_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SBOMScan).order_by(SBOMScan.created_at.desc()).offset(skip).limit(limit).all()
