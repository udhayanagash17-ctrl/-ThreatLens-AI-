import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';

interface ScanAnimationProps {
  isScanning: boolean;
  target?: string;
}

export default function ScanAnimation({ isScanning, target }: ScanAnimationProps) {
  if (!isScanning) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Radar animation */}
      <div className="relative w-48 h-48 mb-6">
        {/* Outer rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="absolute inset-0 rounded-full border border-neon-blue/20"
            style={{ transform: `scale(${1 + i * 0.3})` }}
          />
        ))}

        {/* Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left">
            <div className="w-full h-full bg-gradient-to-t from-neon-blue/30 to-transparent rounded-tr-full" />
          </div>
        </motion.div>

        {/* Center icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="p-4 rounded-full bg-neon-blue/10 border border-neon-blue/30">
            <Radar className="w-8 h-8 text-neon-blue" />
          </div>
        </motion.div>

        {/* Blipping dots */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 rounded-full bg-neon-blue"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm text-neon-blue font-medium"
      >
        Scanning {target || 'target'}...
      </motion.p>
      <p className="text-xs text-slate-400 mt-1">Analyzing attack surface</p>
    </motion.div>
  );
}
