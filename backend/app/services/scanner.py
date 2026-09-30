import httpx
import ssl
import socket
from datetime import datetime
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse


class WebScanner:
    """Non-destructive web security scanner."""

    SECURITY_HEADERS = [
        "strict-transport-security",
        "content-security-policy",
        "x-content-type-options",
        "x-frame-options",
        "x-xss-protection",
        "referrer-policy",
        "permissions-policy",
    ]

    def __init__(self):
        self.findings: List[Dict[str, Any]] = []

    async def scan(self, target: str) -> Dict[str, Any]:
        """Perform web security scan on target."""
        self.findings = []
        result = {
            "target": target,
            "scan_time": datetime.utcnow().isoformat(),
            "https_enabled": False,
            "certificate_valid": False,
            "certificate_expiry": None,
            "security_headers": {},
            "missing_headers": [],
            "technologies": [],
            "findings": [],
            "risk_score": 0.0,
        }

        try:
            # Ensure URL has scheme
            if not target.startswith(("http://", "https://")):
                target = "https://" + target

            parsed = urlparse(target)
            hostname = parsed.hostname

            # Check HTTPS and certificate
            if parsed.scheme == "https":
                result["https_enabled"] = True
                cert_info = self._check_certificate(hostname, parsed.port or 443)
                result["certificate_valid"] = cert_info["valid"]
                result["certificate_expiry"] = cert_info.get("expiry")

            # Perform HTTP security checks
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=15.0,
                verify=False,
            ) as client:
                try:
                    response = await client.get(target)
                    headers = {k.lower(): v for k, v in response.headers.items()}

                    # Check security headers
                    for header in self.SECURITY_HEADERS:
                        if header in headers:
                            result["security_headers"][header] = headers[header]
                        else:
                            result["missing_headers"].append(header)

                    # Detect technologies
                    result["technologies"] = self._detect_technologies(headers, response.text)

                    # Generate findings
                    self._check_https(result, target)
                    self._check_security_headers(result)
                    self._check_information_disclosure(result, headers)
                    self._check_cookie_security(result, headers)

                except httpx.ConnectError:
                    # Try HTTP if HTTPS fails
                    if target.startswith("https://"):
                        http_target = target.replace("https://", "http://")
                        result["findings"].append({
                            "title": "HTTPS Not Available",
                            "severity": "HIGH",
                            "description": "The target does not support HTTPS connections.",
                            "evidence": f"Connection to {target} failed over HTTPS.",
                            "remediation": "Enable HTTPS with a valid TLS certificate.",
                        })

        except Exception as e:
            result["findings"].append({
                "title": "Scan Error",
                "severity": "INFO",
                "description": f"An error occurred during scanning: {str(e)}",
                "evidence": str(e),
                "remediation": "Verify the target is accessible and try again.",
            })

        result["findings"] = self.findings
        result["risk_score"] = self._calculate_risk_score()
        return result

    def _check_certificate(self, hostname: str, port: int) -> Dict[str, Any]:
        """Check SSL certificate validity."""
        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    expiry = cert.get("notAfter")
                    return {"valid": True, "expiry": expiry}
        except Exception:
            return {"valid": False, "expiry": None}

    def _detect_technologies(self, headers: Dict[str, str], body: str) -> List[str]:
        """Detect web technologies from headers and body."""
        technologies = []

        server = headers.get("server", "")
        if server:
            technologies.append(f"Server: {server}")

        powered_by = headers.get("x-powered-by", "")
        if powered_by:
            technologies.append(f"Powered-By: {powered_by}")

        if "wp-content" in body or "wp-includes" in body:
            technologies.append("WordPress")
        if "react" in body.lower() or "__next" in body.lower():
            technologies.append("React/Next.js")
        if "vue" in body.lower():
            technologies.append("Vue.js")
        if "angular" in body.lower():
            technologies.append("Angular")
        if "jquery" in body.lower():
            technologies.append("jQuery")

        return technologies

    def _check_https(self, result: Dict[str, Any], target: str):
        """Check HTTPS configuration."""
        if not result["https_enabled"]:
            self.findings.append({
                "title": "HTTPS Not Enabled",
                "severity": "HIGH",
                "description": "The application is served over unencrypted HTTP.",
                "evidence": f"Target {target} is accessible over HTTP.",
                "remediation": "Enable HTTPS with a valid TLS certificate from a trusted CA.",
            })
        elif not result["certificate_valid"]:
            self.findings.append({
                "title": "Invalid SSL Certificate",
                "severity": "HIGH",
                "description": "The SSL certificate is invalid or expired.",
                "evidence": "Certificate validation failed.",
                "remediation": "Renew or replace the SSL certificate.",
            })

    def _check_security_headers(self, result: Dict[str, Any]):
        """Check for missing security headers."""
        for header in result["missing_headers"]:
            severity = "MEDIUM"
            if header in ["strict-transport-security", "content-security-policy"]:
                severity = "HIGH"

            self.findings.append({
                "title": f"Missing Security Header: {header}",
                "severity": severity,
                "description": f"The {header} security header is not present.",
                "evidence": f"HTTP response does not contain {header} header.",
                "remediation": f"Implement the {header} header in your web server configuration.",
            })

    def _check_information_disclosure(self, result: Dict[str, Any], headers: Dict[str, str]):
        """Check for information disclosure."""
        server = headers.get("server", "")
        if server and any(x in server.lower() for x in ["apache", "nginx", "iis", "microsoft"]):
            # Only flag if version is disclosed
            if any(char.isdigit() for char in server):
                self.findings.append({
                    "title": "Server Version Disclosure",
                    "severity": "LOW",
                    "description": "The server header reveals version information.",
                    "evidence": f"Server header: {server}",
                    "remediation": "Configure server to suppress version information in headers.",
                })

    def _check_cookie_security(self, result: Dict[str, Any], headers: Dict[str, str]):
        """Check cookie security attributes."""
        set_cookie = headers.get("set-cookie", "")
        if set_cookie:
            issues = []
            if "httponly" not in set_cookie.lower():
                issues.append("HttpOnly")
            if "secure" not in set_cookie.lower():
                issues.append("Secure")
            if "samesite" not in set_cookie.lower():
                issues.append("SameSite")

            if issues:
                self.findings.append({
                    "title": "Insecure Cookie Attributes",
                    "severity": "MEDIUM",
                    "description": f"Cookie missing security attributes: {', '.join(issues)}",
                    "evidence": f"Set-Cookie header: {set_cookie[:100]}",
                    "remediation": "Add HttpOnly, Secure, and SameSite attributes to cookies.",
                })

    def _calculate_risk_score(self) -> float:
        """Calculate overall risk score for the scan."""
        if not self.findings:
            return 0.0

        score = 0.0
        for finding in self.findings:
            sev = finding.get("severity", "LOW")
            if sev == "CRITICAL":
                score += 25
            elif sev == "HIGH":
                score += 15
            elif sev == "MEDIUM":
                score += 8
            elif sev == "LOW":
                score += 3

        return min(100, score)
