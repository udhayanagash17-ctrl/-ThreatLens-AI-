export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  url?: string;
  ip_address?: string;
  description?: string;
  technology?: string;
  https_enabled: boolean;
  certificate_valid: boolean;
  certificate_expiry?: string;
  security_headers_score: number;
  risk_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: number;
  asset_id?: number;
  scan_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  risk_score: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface Vulnerability {
  id: number;
  vuln_id: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  cvss_score?: number;
  asset_id?: number;
  asset_name?: string;
  component?: string;
  component_version?: string;
  cve_id?: string;
  evidence?: string;
  remediation?: string;
  detection_source?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_REVIEW' | 'REMEDIATED' | 'ACCEPTED' | 'FALSE_POSITIVE';
  risk_score: number;
  ai_analysis?: string;
  created_at: string;
  updated_at: string;
}

export interface SBOMComponent {
  id: number;
  name: string;
  version: string;
  type?: string;
  package_url?: string;
  license?: string;
  supplier?: string;
  is_vulnerable: boolean;
  vuln_count: number;
  max_cvss?: number;
  created_at: string;
}

export interface SBOMScan {
  id: number;
  filename: string;
  format: string;
  total_components: number;
  vulnerable_components: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alert_type: string;
  vulnerability_id?: number;
  asset_id?: number;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_assets: number;
  total_vulnerabilities: number;
  total_scans: number;
  severity_distribution: Record<string, number>;
  overall_risk_score: number;
}

export interface ReportSummary {
  generated_at: string;
  scan_info: {
    scanner: string;
    version: string;
    scan_date: string;
  };
  executive_summary: string;
  statistics: {
    total_assets: number;
    total_vulnerabilities: number;
    total_scans: number;
    severity_distribution: Record<string, number>;
    overall_risk_score: number;
  };
  recent_findings: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    asset?: string;
    created_at: string;
  }>;
  affected_assets: Array<{
    id: number;
    name: string;
    type: string;
    risk_score: number;
    risk_level: string;
  }>;
}
