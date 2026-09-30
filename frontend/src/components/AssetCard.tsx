import { motion } from 'framer-motion';
import { Globe, Lock, Unlock, Wifi } from 'lucide-react';
import type { Asset } from '../types';
import RiskGauge from './RiskGauge';

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
  index?: number;
}

export default function AssetCard({ asset, onClick, index = 0 }: AssetCardProps) {
  const riskColors: Record<string, string> = {
    CRITICAL: 'from-red-500/20 to-red-500/0',
    HIGH: 'from-orange-500/20 to-orange-500/0',
    MEDIUM: 'from-yellow-500/20 to-yellow-500/0',
    LOW: 'from-green-500/20 to-green-500/0',
    INFO: 'from-blue-500/20 to-blue-500/0',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-dark-800/50 backdrop-blur-sm p-5 cursor-pointer group"
    >
      {/* Risk gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${riskColors[asset.risk_level] || riskColors.INFO} opacity-50`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg bg-white/5"
            >
              <Globe className="w-5 h-5 text-neon-blue" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-neon-blue transition-colors">
                {asset.name}
              </h3>
              <p className="text-xs text-slate-400">{asset.type}</p>
            </div>
          </div>
          <RiskGauge score={asset.risk_score} size="sm" showLabel={false} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">URL</span>
            <span className="text-slate-300 truncate ml-2">{asset.url || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Technology</span>
            <span className="text-slate-300">{asset.technology || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">HTTPS</span>
            {asset.https_enabled ? (
              <Lock className="w-3 h-3 text-neon-green" />
            ) : (
              <Unlock className="w-3 h-3 text-neon-red" />
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Security Headers</span>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-neon-blue" />
              <span className="text-slate-300">{asset.security_headers_score}/6</span>
            </div>
          </div>
        </div>

        {/* Risk level bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Risk Level</span>
            <span className={`font-semibold ${
              asset.risk_level === 'CRITICAL' ? 'text-red-400' :
              asset.risk_level === 'HIGH' ? 'text-orange-400' :
              asset.risk_level === 'MEDIUM' ? 'text-yellow-400' :
              asset.risk_level === 'LOW' ? 'text-green-400' : 'text-blue-400'
            }`}>
              {asset.risk_level}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${asset.risk_score}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
              className={`h-full rounded-full ${
                asset.risk_level === 'CRITICAL' ? 'bg-red-500' :
                asset.risk_level === 'HIGH' ? 'bg-orange-500' :
                asset.risk_level === 'MEDIUM' ? 'bg-yellow-500' :
                asset.risk_level === 'LOW' ? 'bg-green-500' : 'bg-blue-500'
              }`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
