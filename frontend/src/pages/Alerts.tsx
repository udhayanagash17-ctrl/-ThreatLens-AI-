import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { alertService } from '../services/alerts';
import type { Alert } from '../types';

const severityFilters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    alertService.getAll().then((data) => {
      setAlerts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesUnread = !showUnreadOnly || !alert.is_read;
    return matchesSeverity && matchesUnread;
  });

  const handleMarkRead = async (id: number) => {
    await alertService.markRead(id);
    setAlerts(alerts.map((a) => a.id === id ? { ...a, is_read: true } : a));
  };

  const handleDismiss = async (id: number) => {
    await alertService.dismiss(id);
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleMarkAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
    await Promise.all(unreadIds.map((id) => alertService.markRead(id)));
    setAlerts(alerts.map((a) => ({ ...a, is_read: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading alerts..." />
      </div>
    );
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts read'}
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green font-medium hover:bg-neon-green/20 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-dark-800 text-neon-blue focus:ring-neon-blue/50"
          />
          <span className="text-xs text-slate-400">Unread only</span>
        </label>
      </motion.div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.map((alert, i) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={i}
                onDismiss={() => handleDismiss(alert.id)}
                onMarkRead={() => handleMarkRead(alert.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No alerts"
          description="You're all caught up! New security alerts will appear here."
        />
      )}
    </div>
  );
}
