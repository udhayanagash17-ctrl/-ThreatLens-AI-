import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Package, AlertTriangle, CheckCircle, FileJson, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SeverityBadge from '../components/SeverityBadge';
import { sbomService } from '../services/sbom';
import type { SBOMComponent, SBOMScan } from '../types';

const sampleSBOM = {
  bomFormat: "CycloneDX",
  components: [
    { name: "log4j", version: "2.14.1", type: "library" },
    { name: "openssl", version: "3.0.2", type: "library" },
    { name: "spring-core", version: "5.3.15", type: "library" },
    { name: "nginx", version: "1.20.0", type: "framework" },
    { name: "react", version: "18.2.0", type: "library" },
    { name: "axios", version: "1.2.0", type: "library" },
    { name: "fastapi", version: "0.95.0", type: "framework" },
    { name: "python", version: "3.11.0", type: "language" },
  ]
};

export default function SBOM() {
  const [components, setComponents] = useState<SBOMComponent[]>([]);
  const [scans, setScans] = useState<SBOMScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    total: number;
    vulnerable: number;
    findings: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      sbomService.getComponents(),
      sbomService.getScans(),
    ]).then(([comps, scans]) => {
      setComponents(comps);
      setScans(scans);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUpload = async (data: { filename: string; content: string }) => {
    setUploading(true);
    try {
      const result = await sbomService.upload(data);
      setUploadResult({
        total: result.total_components,
        vulnerable: result.vulnerable_components,
        findings: result.findings_count,
      });
      // Refresh data
      const [comps, scans] = await Promise.all([
        sbomService.getComponents(),
        sbomService.getScans(),
      ]);
      setComponents(comps);
      setScans(scans);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSampleUpload = () => {
    handleUpload({
      filename: 'sample-sbom.json',
      content: JSON.stringify(sampleSBOM),
    });
  };

  const filteredComponents = components.filter((comp) =>
    comp.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading SBOM data..." />
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
          <h1 className="text-2xl font-bold text-white">SBOM Analysis</h1>
          <p className="text-sm text-slate-400 mt-1">Software Bill of Materials security analysis</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSampleUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-medium hover:bg-neon-purple/20 transition-colors disabled:opacity-50"
          >
            <FileJson className="w-4 h-4" />
            Load Sample
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Upload SBOM
          </motion.button>
        </div>
      </motion.div>

      {/* Upload Result */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              <div>
                <p className="text-sm font-medium text-neon-green">SBOM Analysis Complete</p>
                <p className="text-xs text-slate-400">
                  {uploadResult.total} components analyzed, {uploadResult.vulnerable} vulnerable, {uploadResult.findings} findings
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800/50 border border-white/5 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-neon-blue" />
            <div>
              <p className="text-2xl font-bold text-white">{components.length}</p>
              <p className="text-xs text-slate-400">Total Components</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 border border-white/5 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-neon-red" />
            <div>
              <p className="text-2xl font-bold text-white">{components.filter((c) => c.is_vulnerable).length}</p>
              <p className="text-xs text-slate-400">Vulnerable</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800/50 border border-white/5 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-neon-green" />
            <div>
              <p className="text-2xl font-bold text-white">{components.filter((c) => !c.is_vulnerable).length}</p>
              <p className="text-xs text-slate-400">Safe</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
        />
      </motion.div>

      {/* Components List */}
      {filteredComponents.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredComponents.map((comp, i) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-dark-800/50 border rounded-xl p-4 ${
                  comp.is_vulnerable ? 'border-neon-red/20' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${comp.is_vulnerable ? 'bg-neon-red/10' : 'bg-neon-green/10'}`}>
                      <Package className={`w-5 h-5 ${comp.is_vulnerable ? 'text-neon-red' : 'text-neon-green'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{comp.name}</p>
                      <p className="text-xs text-slate-400">v{comp.version} • {comp.type || 'library'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {comp.is_vulnerable && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                        {comp.vuln_count} CVE{comp.vuln_count > 1 ? 'S' : ''}
                      </span>
                    )}
                    {comp.max_cvss && (
                      <span className="text-xs text-slate-400">CVSS: {comp.max_cvss}</span>
                    )}
                    {comp.is_vulnerable ? (
                      <AlertTriangle className="w-4 h-4 text-neon-red" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No components found"
          description="Upload an SBOM to analyze your software dependencies."
          action={{ label: 'Upload SBOM', onClick: () => setShowUpload(true) }}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpload(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Upload SBOM</h3>
            <p className="text-sm text-slate-400 mb-4">
              Upload a CycloneDX or SPDX format SBOM file (JSON).
            </p>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-neon-blue/30 transition-colors">
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Drag & drop or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">JSON format only</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSampleUpload}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Use Sample Data
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Loading overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Analyzing SBOM..." />
        </div>
      )}
    </div>
  );
}
