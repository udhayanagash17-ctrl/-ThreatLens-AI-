from typing import Dict, Any


class RiskEngine:
    """Calculates risk scores based on multiple factors."""

    SEVERITY_WEIGHTS = {
        "CRITICAL": 1.0,
        "HIGH": 0.8,
        "MEDIUM": 0.5,
        "LOW": 0.2,
        "INFO": 0.05,
    }

    EXPOSURE_WEIGHTS = {
        "internet": 1.0,
        "internal": 0.5,
        "isolated": 0.1,
    }

    CONFIDENCE_WEIGHTS = {
        "HIGH": 1.0,
        "MEDIUM": 0.7,
        "LOW": 0.4,
    }

    IMPORTANCE_WEIGHTS = {
        "CRITICAL": 1.0,
        "HIGH": 0.8,
        "MEDIUM": 0.5,
        "LOW": 0.2,
    }

    @staticmethod
    def calculate_risk_score(
        severity: str,
        exposure: str = "internet",
        confidence: str = "MEDIUM",
        importance: str = "MEDIUM",
        cvss_score: float = None,
    ) -> Dict[str, Any]:
        """Calculate a risk score from 0-100 based on multiple factors."""
        sev_weight = RiskEngine.SEVERITY_WEIGHTS.get(severity.upper(), 0.5)
        exp_weight = RiskEngine.EXPOSURE_WEIGHTS.get(exposure.lower(), 0.5)
        conf_weight = RiskEngine.CONFIDENCE_WEIGHTS.get(confidence.upper(), 0.7)
        imp_weight = RiskEngine.IMPORTANCE_WEIGHTS.get(importance.upper(), 0.5)

        # Base score from severity
        base_score = sev_weight * 100

        # Adjust by exposure
        exposure_factor = exp_weight

        # Adjust by confidence
        confidence_factor = conf_weight

        # Adjust by importance
        importance_factor = imp_weight

        # If CVSS score available, blend it in
        if cvss_score is not None:
            cvss_factor = cvss_score / 10.0
            final_score = (base_score * 0.3 + cvss_factor * 100 * 0.3 + 
                          exposure_factor * 100 * 0.15 + 
                          confidence_factor * 100 * 0.1 + 
                          importance_factor * 100 * 0.15)
        else:
            final_score = (base_score * 0.4 + 
                          exposure_factor * 100 * 0.2 + 
                          confidence_factor * 100 * 0.15 + 
                          importance_factor * 100 * 0.25)

        final_score = min(100, max(0, round(final_score, 1)))

        # Determine risk level
        if final_score >= 80:
            risk_level = "CRITICAL"
        elif final_score >= 60:
            risk_level = "HIGH"
        elif final_score >= 40:
            risk_level = "MEDIUM"
        elif final_score >= 20:
            risk_level = "LOW"
        else:
            risk_level = "INFO"

        return {
            "score": final_score,
            "level": risk_level,
            "factors": {
                "severity": severity,
                "severity_weight": sev_weight,
                "exposure": exposure,
                "exposure_weight": exp_weight,
                "confidence": confidence,
                "confidence_weight": conf_weight,
                "importance": importance,
                "importance_weight": imp_weight,
                "cvss_score": cvss_score,
            },
        }

    @staticmethod
    def calculate_asset_risk(findings: list) -> Dict[str, Any]:
        """Calculate overall asset risk based on its findings."""
        if not findings:
            return {"score": 0, "level": "LOW", "factors": {}}

        max_score = 0
        total_score = 0
        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}

        for finding in findings:
            sev = finding.get("severity", "LOW")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
            score = finding.get("risk_score", 0)
            max_score = max(max_score, score)
            total_score += score

        avg_score = total_score / len(findings) if findings else 0
        # Weight max score more heavily
        final_score = (max_score * 0.6 + avg_score * 0.4)
        final_score = min(100, round(final_score, 1))

        if final_score >= 80:
            risk_level = "CRITICAL"
        elif final_score >= 60:
            risk_level = "HIGH"
        elif final_score >= 40:
            risk_level = "MEDIUM"
        elif final_score >= 20:
            risk_level = "LOW"
        else:
            risk_level = "INFO"

        return {
            "score": final_score,
            "level": risk_level,
            "factors": {
                "total_findings": len(findings),
                "severity_counts": severity_counts,
                "max_finding_score": max_score,
                "average_finding_score": round(avg_score, 1),
            },
        }
