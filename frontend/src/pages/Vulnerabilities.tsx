import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Bot, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import VulnerabilityCard from '../components/VulnerabilityCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SeverityBadge from '../components/SeverityBadge';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import { vulnerabilityService } from '../services/vulnerabilities';
import type { Vulnerability } from '../types';

const severityFilters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const statusFilters = ['ALL', 'OPEN', 'IN_REVIEW', 'REMEDIATED', 'ACCEPTED', 'FALSE_POSITIVE'];

export default function Vulnerabilities() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    vulnerabilityService.getAll().then((data) => {
      setVulns(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredVulns = vulns.filter((vuln) => {
    const matchesSearch = vuln.title.toLowerCase().includes(search.toLowerCase()) ||
      vuln.vuln_id.toLowerCase().includes(search.toLowerCase()) ||
      vuln.component?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || vuln.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || vuln.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAnalyze = async (vuln: Vulnerability) => {
    setSelectedVuln(vuln);
    setShowModal(true);
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const result = await vulnerabilityService.analyze(vuln.id);
      setAiAnalysis(result.analysis);
    } catch (err) {
      setAiAnalysis('Failed to generate AI analysis. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusUpdate = async (vuln: Vulnerability, newStatus: string) => {
    try {
      await vulnerabilityService.update(vuln.id, { status: newStatus });
      setVulns(vulns.map((v) => v.id === vuln.id ? { ...v, status: newStatus as Vulnerability['status'] } : v));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading vulnerabilities..." />
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
        <h1 className="text-2xl font-bold text-white">Vulnerabilities</h1>
        <p className="text-sm text-slate-400 mt-1">Manage and analyze security findings</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vulnerabilities..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">Severity:</span>
            <div className="flex gap-1">
              {severityFilters.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    severityFilter === sev
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <div className="flex gap-1">
              {statusFilters.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vulnerabilities List */}
      {filteredVulns.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredVulns.map((vuln, i) => (
              <div key={vuln.id} className="relative">
                <VulnerabilityCard
                  vulnerability={vuln}
                  index={i}
                  onClick={() => {
                    setSelectedVuln(vuln);
                    setShowModal(true);
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze(vuln);
                    }}
                    className="p-1.5 rounded-lg bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 transition-colors"
                    title="AI Analysis"
                  >
                    <Bot className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No vulnerabilities found"
          description="Try adjusting your filters or run a new scan."
        />
      )}

      {/* Vulnerability Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedVuln?.title || 'Vulnerability Details'}
        size="lg"
      >
        {selectedVuln && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-3">
              <SeverityBadge severity={selectedVuln.severity} size="lg" />
              <span className="text-sm text-slate-400">{selectedVuln.vuln_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedVuln.status === 'OPEN' ? 'bg-red-500/10 text-red-400' :
                selectedVuln.status === 'IN_REVIEW' ? 'bg-yellow-500/10 text-yellow-400' :
                selectedVuln.status === 'REMEDIATED' ? 'bg-green-500/10 text-green-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {selectedVuln.status.replace('_', ' ')}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Component</p>
                <p className="text-sm text-white font-medium">{selectedVuln.component || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Version</p>
                <p className="text-sm text-white font-medium">{selectedVuln.component_version || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">CVE</p>
                <p className="text-sm text-white font-medium">{selectedVuln.cve_id || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Risk Score</p>
                <p className="text-sm text-white font-medium">{selectedVuln.risk_score}/100</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
              <p className="text-sm text-slate-300">{selectedVuln.description || 'No description available.'}</p>
            </div>

            {/* Evidence */}
            {selectedVuln.evidence && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Evidence</h4>
                <pre className="text-xs text-slate-300 bg-dark-900 rounded-lg p-3 overflow-x-auto">
                  {selectedVuln.evidence}
                </pre>
              </div>
            )}

            {/* Remediation */}
            {selectedVuln.remediation && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Remediation</h4>
                <p className="text-sm text-slate-300">{selectedVuln.remediation}</p>
              </div>
            )}

            {/* AI Analysis */}
            <AIAnalysisPanel analysis={selectedVuln.ai_analysis || aiAnalysis} loading={aiLoading} />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnalyze(selectedVuln)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-medium hover:bg-neon-purple/20 transition-colors"
              >
                <Bot className="w-4 h-4" />
                Analyze with AI
              </motion.button>
              <select
                value={selectedVuln.status}
                onChange={(e) => handleStatusUpdate(selectedVuln, e.target.value)}
                className="px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
              >
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="REMEDIATED">Remediated</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
