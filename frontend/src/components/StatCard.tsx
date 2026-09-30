import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'red' | 'green' | 'orange';
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

const colorMap = {
  blue: {
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/20',
    text: 'text-neon-blue',
    glow: 'glow-blue',
    iconBg: 'bg-neon-blue/20',
  },
  purple: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/20',
    text: 'text-neon-purple',
    glow: 'glow-purple',
    iconBg: 'bg-neon-purple/20',
  },
  red: {
    bg: 'bg-neon-red/10',
    border: 'border-neon-red/20',
    text: 'text-neon-red',
    glow: 'glow-red',
    iconBg: 'bg-neon-red/20',
  },
  green: {
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/20',
    text: 'text-neon-green',
    glow: 'glow-green',
    iconBg: 'bg-neon-green/20',
  },
  orange: {
    bg: 'bg-neon-orange/10',
    border: 'border-neon-orange/20',
    text: 'text-neon-orange',
    glow: '',
    iconBg: 'bg-neon-orange/20',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, delay = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} p-6 card-hover`}
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${colors.iconBg} blur-3xl opacity-50`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            className={`text-3xl font-bold ${colors.text}`}
          >
            {value}
          </motion.p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-neon-green' : 'text-neon-red'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last scan
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-xl ${colors.iconBg}`}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </motion.div>
      </div>

      {/* Animated bottom line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent ${colors.text} origin-left`}
      />
    </motion.div>
  );
}
