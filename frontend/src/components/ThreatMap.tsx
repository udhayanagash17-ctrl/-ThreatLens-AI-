import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ThreatMapProps {
  assets: Array<{
    id: number;
    name: string;
    risk_score: number;
    risk_level: string;
  }>;
}

export default function ThreatMap({ assets }: ThreatMapProps) {
  const nodes = useMemo(() => {
    return assets.slice(0, 8).map((asset, i) => {
      const angle = (i / Math.min(assets.length, 8)) * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      return {
        ...asset,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
      };
    });
  }, [assets]);

  const getColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="relative w-full h-64 bg-dark-900/50 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: i * 0.1, duration: 1 }}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke="rgba(0, 212, 255, 0.3)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="relative"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: getColor(node.risk_level),
                boxShadow: `0 0 10px ${getColor(node.risk_level)}`,
              }}
            />
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: getColor(node.risk_level) }}
            />
          </motion.div>
          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
            {node.name}
          </span>
        </motion.div>
      ))}

      {/* Center hub */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-neon-blue" />
        </div>
      </motion.div>
    </div>
  );
}
