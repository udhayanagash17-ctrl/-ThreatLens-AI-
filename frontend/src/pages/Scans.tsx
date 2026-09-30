import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import ScanAnimation from '../components/ScanAnimation';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SeverityBadge from '../components/SeverityBadge';
import { scanService } from '../services/scans';
import type { Scan } from '../types';

export default function Scans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTarget, setScanTarget] = useState('');
  const [scanType, setScanType] = useState('web');

  useEffect(() => {
    scanService.getAll().then((data) => {
      setScans(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleScan = async () => {
    if (!scanTarget) return;
    setIsScanning(true);
    try {
      const result = await scanService.runScan({ target: scanTarget, scan_type: scanType });
      setScans([result, ...scans]);
      setScanTarget('');
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'failed': return <XCircle className="w-4 h-4 text-neon-red" />;
      case 'running': return <Clock className="w-4 h-4 text-neon-blue animate-spin" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading scans..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">Security Scans</h1>
        <p className="text-sm text-slate-400 mt-1">Run and monitor security assessments</p>
      </motion.div>

      {/* New Scan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-sm font-medium text-slate-400 mb-4">New Scan</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={scanTarget}
              onChange={(e) => setScanTarget(e.target.value)}
              placeholder="Enter target URL or IP (e.g., example.com)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
              disabled={isScanning}
            />
          </div>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
            disabled={isScanning}
          >
            <option value="web">Web Scan</option>
            <option value="full">Full Scan</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScan}
            disabled={isScanning || !scanTarget}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </motion.button>
        </div>

        {/* Scan Animation */}
        <AnimatePresence>
          {isScanning && <ScanAnimation isScanning={isScanning} target={scanTarget} />}
        </AnimatePresence>
      </motion.div>

      {/* Scan History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-slate-400 mb-4">Scan History</h3>
        {scans.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {scans.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scan.status)}
                      <div>
                        <p className="text-sm font-medium text-white">{scan.target}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(scan.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{scan.findings_count} findings</p>
                        <p className="text-xs text-slate-400">Risk: {scan.risk_score}</p>
                      </div>
                      <div className="flex gap-1">
                        {scan.critical_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                            {scan.critical_count}C
                          </span>
                        )}
                        {scan.high_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
                            {scan.high_count}H
                          </span>
                        )}
                        {scan.medium_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                            {scan.medium_count}M
                          </span>
                        )}
                        {scan.low_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                            {scan.low_count}L
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No scans yet"
            description="Run your first security scan to start detecting vulnerabilities."
          />
        )}
      </motion.div>
    </div>
  );
}
