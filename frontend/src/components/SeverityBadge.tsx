import { motion } from 'framer-motion';

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  LOW: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  INFO: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function SeverityBadge({ severity, size = 'md', pulse = false }: SeverityBadgeProps) {
  const config = severityConfig[severity.toUpperCase()] || severityConfig.INFO;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-semibold
        ${config.bg} ${config.text} ${config.border} ${sizeConfig[size]}
      `}
    >
      {pulse && (
        <motion.span
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`}
        />
      )}
      {severity.toUpperCase()}
    </motion.span>
  );
}
