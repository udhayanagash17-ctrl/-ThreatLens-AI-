import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Shield, Bug, Globe, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';
import { reportService } from '../services/reports';
import type { ReportSummary } from '../types';

export default function Reports() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getSummary().then((data) => {
      setReport(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Generating report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 text-slate-500">
        <FileText className="w-16 h-16 mx-auto mb-4" />
        <p>No report available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Security Report</h1>
          <p className="text-sm text-slate-400 mt-1">Comprehensive security assessment report</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-medium hover:bg-neon-blue/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </motion.button>
      </motion.div>

      {/* Scan Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800/50 border border-white/5 rounded-xl p-4"
      >
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-blue" />
            <span className="text-slate-400">Scanner:</span>
            <span className="text-white">{report.scan_info.scanner}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon-blue" />
            <span className="text-slate-400">Date:</span>
            <span className="text-white">{report.scan_info.scan_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Version:</span>
            <span className="text-white">{report.scan_info.version}</span>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-800/50 border border-white/5 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-neon-blue" />
          Executive Summary
        </h3>
        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
          {report.executive_summary}
        </pre>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-4 text-center">
          <Globe className="w-6 h-6 text-neon-blue mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{report.statistics.total_assets}</p>
          <p className="text-xs text-slate-400">Assets</p>
        </div>
        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-4 text-center">
          <Bug className="w-6 h-6 text-neon-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{report.statistics.total_vulnerabilities}</p>
          <p className="text-xs text-slate-400">Vulnerabilities</p>
        </div>
        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-neon-orange mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{report.statistics.overall_risk_score}</p>
          <p className="text-xs text-slate-400">Risk Score</p>
        </div>
        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 text-neon-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{report.statistics.total_scans}</p>
          <p className="text-xs text-slate-400">Scans</p>
        </div>
      </motion.div>

      {/* Severity Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-800/50 border border-white/5 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
        <div className="space-y-3">
          {Object.entries(report.statistics.severity_distribution).map(([severity, count]) => (
            <div key={severity} className="flex items-center gap-4">
              <SeverityBadge severity={severity} size="sm" />
              <div className="flex-1">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${report.statistics.total_vulnerabilities > 0 ? (count / report.statistics.total_vulnerabilities) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${
                      severity === 'CRITICAL' ? 'bg-red-500' :
                      severity === 'HIGH' ? 'bg-orange-500' :
                      severity === 'MEDIUM' ? 'bg-yellow-500' :
                      severity === 'LOW' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Findings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-800/50 border border-white/5 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Findings</h3>
        {report.recent_findings.length > 0 ? (
          <div className="space-y-2">
            {report.recent_findings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={finding.severity} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{finding.title}</p>
                    <p className="text-xs text-slate-400">{finding.asset || 'Unknown asset'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  finding.status === 'OPEN' ? 'bg-red-500/10 text-red-400' :
                  finding.status === 'REMEDIATED' ? 'bg-green-500/10 text-green-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {finding.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No findings to report</p>
        )}
      </motion.div>

      {/* Affected Assets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-800/50 border border-white/5 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Affected Assets</h3>
        {report.affected_assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.affected_assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-slate-400">{asset.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{asset.risk_score}</p>
                  <p className={`text-xs ${
                    asset.risk_level === 'CRITICAL' ? 'text-red-400' :
                    asset.risk_level === 'HIGH' ? 'text-orange-400' :
                    asset.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {asset.risk_level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No affected assets</p>
        )}
      </motion.div>
    </div>
  );
}
