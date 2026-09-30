import json
from typing import Dict, Any, List
from datetime import datetime
from app.services.vulnerability import VulnerabilityService


class SBOMScanner:
    """Scanner for Software Bill of Materials (SBOM) analysis."""

    def __init__(self):
        self.vuln_service = VulnerabilityService()

    async def scan(self, sbom_data: Dict[str, Any], filename: str = "sbom.json") -> Dict[str, Any]:
        """Analyze SBOM data for vulnerabilities."""
        components = self._parse_components(sbom_data)
        vulnerable_components = []
        findings = []

        for comp in components:
            vuln_info = self.vuln_service.match_component(
                comp.get("name", ""),
                comp.get("version", "")
            )

            if vuln_info:
                comp["is_vulnerable"] = True
                comp["vuln_count"] = 1
                comp["max_cvss"] = vuln_info["cvss_score"]
                vulnerable_components.append(comp)

                findings.append({
                    "vuln_id": f"TL-{datetime.utcnow().strftime('%Y%m%d')}-{len(findings)+1:04d}",
                    "title": vuln_info["title"],
                    "description": vuln_info["description"],
                    "severity": vuln_info["severity"],
                    "cvss_score": vuln_info["cvss_score"],
                    "component": comp["name"],
                    "component_version": comp["version"],
                    "cve_id": vuln_info["cve"],
                    "evidence": f"Component {comp['name']} version {comp['version']} matches {vuln_info['cve']}",
                    "remediation": vuln_info["remediation"],
                    "detection_source": "SBOM Scanner",
                    "confidence": "HIGH",
                    "status": "OPEN",
                })
            else:
                comp["is_vulnerable"] = False
                comp["vuln_count"] = 0

        # Calculate statistics
        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        for f in findings:
            severity_counts[f["severity"]] = severity_counts.get(f["severity"], 0) + 1

        return {
            "filename": filename,
            "format": sbom_data.get("bomFormat", "unknown"),
            "total_components": len(components),
            "vulnerable_components": len(vulnerable_components),
            "components": components,
            "findings": findings,
            "severity_counts": severity_counts,
            "scan_time": datetime.utcnow().isoformat(),
        }

    def _parse_components(self, sbom_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse components from SBOM data (supports CycloneDX and SPDX)."""
        components = []

        # CycloneDX format
        if "components" in sbom_data:
            for comp in sbom_data["components"]:
                components.append({
                    "name": comp.get("name", "unknown"),
                    "version": comp.get("version", "unknown"),
                    "type": comp.get("type", "library"),
                    "package_url": comp.get("purl", ""),
                    "license": self._extract_license(comp),
                    "supplier": comp.get("publisher", ""),
                })

        # SPDX format
        elif "packages" in sbom_data:
            for pkg in sbom_data["packages"]:
                components.append({
                    "name": pkg.get("name", "unknown"),
                    "version": pkg.get("versionInfo", "unknown"),
                    "type": "library",
                    "package_url": pkg.get("externalRefs", [{}])[0].get("referenceLocator", "") if pkg.get("externalRefs") else "",
                    "license": pkg.get("licenseDeclared", ""),
                    "supplier": pkg.get("supplier", ""),
                })

        # Simple format (just a list of name/version)
        elif isinstance(sbom_data, list):
            for item in sbom_data:
                components.append({
                    "name": item.get("name", "unknown"),
                    "version": item.get("version", "unknown"),
                    "type": item.get("type", "library"),
                    "package_url": item.get("purl", ""),
                    "license": item.get("license", ""),
                    "supplier": item.get("supplier", ""),
                })

        return components

    def _extract_license(self, comp: Dict[str, Any]) -> str:
        """Extract license info from component."""
        licenses = comp.get("licenses", [])
        if licenses:
            if isinstance(licenses[0], dict):
                return licenses[0].get("license", {}).get("id", "")
            return str(licenses[0])
        return ""
