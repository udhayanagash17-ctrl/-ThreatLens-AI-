import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'purple' | 'red' | 'green' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const colorMap = {
  blue: 'from-neon-blue to-cyan-400',
  purple: 'from-neon-purple to-pink-400',
  red: 'from-neon-red to-orange-400',
  green: 'from-neon-green to-emerald-400',
  orange: 'from-neon-orange to-yellow-400',
};

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-medium text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${sizeMap[size]} bg-white/5 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} progress-animated`}
        />
      </div>
    </div>
  );
}
