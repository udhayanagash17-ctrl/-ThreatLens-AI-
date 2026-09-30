import json
from typing import Dict, Any, Optional
from app.core.config import get_settings

settings = get_settings()


class AIService:
    """AI Security Analyst service that explains findings in plain language."""

    def __init__(self):
        self.enabled = settings.AI_ENABLED
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    async def analyze_finding(self, finding: Dict[str, Any]) -> str:
        """Generate AI analysis for a vulnerability finding."""
        if not self.enabled:
            return self._generate_rule_based_analysis(finding)

        # If API key is available, use LLM
        if self.api_key:
            try:
                return await self._call_llm(finding)
            except Exception:
                pass

        # Fallback to rule-based analysis
        return self._generate_rule_based_analysis(finding)

    async def _call_llm(self, finding: Dict[str, Any]) -> str:
        """Call LLM API for analysis."""
        import httpx

        prompt = self._build_prompt(finding)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a cybersecurity analyst. Explain findings clearly and provide actionable recommendations."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 500,
                    "temperature": 0.3,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    def _build_prompt(self, finding: Dict[str, Any]) -> str:
        """Build prompt for LLM analysis."""
        return f"""Analyze this security finding and provide a clear explanation:

Title: {finding.get('title', 'Unknown')}
Severity: {finding.get('severity', 'Unknown')}
Component: {finding.get('component', 'N/A')}
Version: {finding.get('component_version', 'N/A')}
CVE: {finding.get('cve_id', 'N/A')}
Description: {finding.get('description', 'No description available')}
Evidence: {finding.get('evidence', 'No evidence available')}

Please provide:
1. What was found (simple explanation)
2. Why it matters (impact)
3. Recommended action (remediation)
4. Priority level"""

    def _generate_rule_based_analysis(self, finding: Dict[str, Any]) -> str:
        """Generate rule-based analysis when AI is not available."""
        title = finding.get("title", "Unknown finding")
        severity = finding.get("severity", "MEDIUM")
        component = finding.get("component", "N/A")
        version = finding.get("component_version", "N/A")
        cve = finding.get("cve_id", "N/A")
        description = finding.get("description", "No description available")
        evidence = finding.get("evidence", "No evidence available")
        remediation = finding.get("remediation", "Review and apply security best practices.")

        analysis = f"""AI Security Analysis
{'='*50}

What Was Found:
A security issue was detected in {component} (version {version}). 
The finding is classified as {severity} severity.

Why It Matters:
{description}

Evidence:
{evidence}

Recommended Action:
{remediation}

Priority: {severity}

Note: This analysis was generated using rule-based analysis. 
Enable AI API key for enhanced AI-powered insights."""

        return analysis

    async def generate_executive_summary(self, stats: Dict[str, Any]) -> str:
        """Generate executive summary for reports."""
        total = stats.get("total_findings", 0)
        critical = stats.get("critical", 0)
        high = stats.get("high", 0)
        medium = stats.get("medium", 0)
        low = stats.get("low", 0)
        assets = stats.get("total_assets", 0)
        risk_score = stats.get("overall_risk_score", 0)

        summary = f"""Executive Summary
{'='*50}

ThreatLens AI has completed a comprehensive security assessment of {assets} assets.

Key Findings:
- Total Vulnerabilities: {total}
- Critical: {critical}
- High: {high}
- Medium: {medium}
- Low: {low}

Overall Risk Score: {risk_score}/100

{"IMMEDIATE ACTION REQUIRED: Critical vulnerabilities have been identified that require urgent attention." if critical > 0 else "No critical vulnerabilities detected." if total == 0 else "High priority findings should be addressed promptly."}

Recommendations:
1. {"Address critical vulnerabilities immediately" if critical > 0 else "Maintain current security posture"}
2. {"Prioritize high-severity findings" if high > 0 else "Continue regular security assessments"}
3. Review and update security configurations
4. Implement continuous monitoring

Report generated by ThreatLens AI v{settings.APP_VERSION}"""

        return summary
