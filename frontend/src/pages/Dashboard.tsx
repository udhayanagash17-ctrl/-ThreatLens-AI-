import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Bug,
  Globe,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import StatCard from '../components/StatCard';
import VulnerabilityCard from '../components/VulnerabilityCard';
import RiskGauge from '../components/RiskGauge';
import ThreatMap from '../components/ThreatMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { vulnerabilityService } from '../services/vulnerabilities';
import { assetService } from '../services/assets';
import { scanService } from '../services/scans';
import type { Vulnerability, Asset, Scan } from '../types';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  INFO: '#3b82f6',
};

export default function Dashboard() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vulnerabilityService.getAll(),
      assetService.getAll(),
      scanService.getAll(),
    ]).then(([v, a, s]) => {
      setVulns(v);
      setAssets(a);
      setScans(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // Calculate stats
  const stats = {
    totalAssets: assets.length,
    totalVulns: vulns.length,
    totalScans: scans.length,
    critical: vulns.filter((v) => v.severity === 'CRITICAL').length,
    high: vulns.filter((v) => v.severity === 'HIGH').length,
    medium: vulns.filter((v) => v.severity === 'MEDIUM').length,
    low: vulns.filter((v) => v.severity === 'LOW').length,
  };

  const overallRisk = stats.totalVulns > 0
    ? Math.min(100, stats.critical * 25 + stats.high * 15 + stats.medium * 8 + stats.low * 3)
    : 0;

  // Chart data
  const severityData = [
    { name: 'Critical', value: stats.critical, color: SEVERITY_COLORS.CRITICAL },
    { name: 'High', value: stats.high, color: SEVERITY_COLORS.HIGH },
    { name: 'Medium', value: stats.medium, color: SEVERITY_COLORS.MEDIUM },
    { name: 'Low', value: stats.low, color: SEVERITY_COLORS.LOW },
  ].filter((d) => d.value > 0);

  const trendData = [
    { name: 'Mon', vulns: 12, scans: 5 },
    { name: 'Tue', vulns: 19, scans: 8 },
    { name: 'Wed', vulns: 8, scans: 3 },
    { name: 'Thu', vulns: 15, scans: 6 },
    { name: 'Fri', vulns: 22, scans: 10 },
    { name: 'Sat', vulns: 6, scans: 2 },
    { name: 'Sun', vulns: 10, scans: 4 },
  ];

  const recentVulns = vulns.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time attack surface monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20"
          >
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="text-xs font-medium text-neon-green">Live</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={Globe}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Vulnerabilities"
          value={stats.totalVulns}
          icon={Bug}
          color="red"
          delay={0.1}
        />
        <StatCard
          title="Critical Issues"
          value={stats.critical}
          icon={AlertTriangle}
          color="orange"
          delay={0.2}
        />
        <StatCard
          title="Scans Run"
          value={stats.totalScans}
          icon={Activity}
          color="green"
          delay={0.3}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">Overall Risk Score</h3>
          <div className="flex justify-center">
            <RiskGauge score={overallRisk} size="lg" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <p className="text-xs text-slate-400">Open</p>
              <p className="text-lg font-bold text-white">{vulns.filter((v) => v.status === 'OPEN').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <p className="text-xs text-slate-400">Resolved</p>
              <p className="text-lg font-bold text-neon-green">{vulns.filter((v) => v.status === 'REMEDIATED').length}</p>
            </div>
          </div>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">Severity Distribution</h3>
          {severityData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">
              No vulnerabilities detected
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Threat Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">Attack Surface Map</h3>
          <ThreatMap assets={assets} />
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">Vulnerability Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="vulnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="vulns"
                  stroke="#ef4444"
                  fill="url(#vulnGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Scan Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-4">Scan Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="scans" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Vulnerabilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">Recent Vulnerabilities</h3>
          <span className="text-xs text-slate-500">{vulns.length} total</span>
        </div>
        {recentVulns.length > 0 ? (
          <div className="space-y-3">
            {recentVulns.map((vuln, i) => (
              <VulnerabilityCard key={vuln.id} vulnerability={vuln} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-neon-green" />
            <p>No vulnerabilities detected</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
