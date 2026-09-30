import { motion } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';
import type { Alert } from '../types';
import SeverityBadge from './SeverityBadge';

interface AlertCardProps {
  alert: Alert;
  onDismiss?: () => void;
  onMarkRead?: () => void;
  index?: number;
}

export default function AlertCard({ alert, onDismiss, onMarkRead, index = 0 }: AlertCardProps) {
  const severityIcons: Record<string, string> = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🟢',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative overflow-hidden rounded-xl border p-4
        ${alert.is_read ? 'border-white/5 bg-dark-800/30' : 'border-white/10 bg-dark-800/60'}
        ${!alert.is_read ? 'glow-blue' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={alert.severity === 'CRITICAL' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-2xl"
        >
          {severityIcons[alert.severity] || '🔵'}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{alert.title}</h4>
            <SeverityBadge severity={alert.severity} size="sm" pulse={!alert.is_read} />
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{alert.message}</p>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(alert.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!alert.is_read && onMarkRead && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMarkRead}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-neon-green transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </motion.button>
          )}
          {onDismiss && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-neon-red transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!alert.is_read && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple"
        />
      )}
    </motion.div>
  );
}
