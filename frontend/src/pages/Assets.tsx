import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Globe, Server, Wifi, Database } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { assetService } from '../services/assets';
import type { Asset } from '../types';

const assetTypes = [
  { value: 'all', label: 'All Types', icon: Globe },
  { value: 'domain', label: 'Domain', icon: Globe },
  { value: 'ip', label: 'IP Address', icon: Server },
  { value: 'web_app', label: 'Web App', icon: Wifi },
  { value: 'api', label: 'API', icon: Database },
  { value: 'service', label: 'Service', icon: Server },
];

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'domain', url: '', description: '' });

  useEffect(() => {
    assetService.getAll().then((data) => {
      setAssets(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.url?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = async () => {
    try {
      const created = await assetService.create(newAsset);
      setAssets([created, ...assets]);
      setShowModal(false);
      setNewAsset({ name: '', type: 'domain', url: '', description: '' });
    } catch (err) {
      console.error('Failed to create asset:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading assets..." />
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
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your attack surface inventory</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-medium hover:bg-neon-blue/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
          >
            {assetTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAssets.map((asset, i) => (
              <AssetCard key={asset.id} asset={asset} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="No assets found"
          description="Add your first asset to start monitoring your attack surface."
          action={{ label: 'Add Asset', onClick: () => setShowModal(true) }}
        />
      )}

      {/* Add Asset Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Asset">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Asset Name</label>
            <input
              type="text"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
              placeholder="e.g., api.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
            <select
              value={newAsset.type}
              onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
            >
              <option value="domain">Domain</option>
              <option value="ip">IP Address</option>
              <option value="web_app">Web Application</option>
              <option value="api">API</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">URL</label>
            <input
              type="text"
              value={newAsset.url}
              onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
            <textarea
              value={newAsset.description}
              onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 transition-colors resize-none"
              rows={3}
              placeholder="Brief description of the asset..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Create Asset
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
