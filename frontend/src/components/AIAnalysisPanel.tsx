import { motion } from 'framer-motion';
import { Bot, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AIAnalysisPanelProps {
  analysis: string;
  loading?: boolean;
}

export default function AIAnalysisPanel({ analysis, loading }: AIAnalysisPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Bot className="w-5 h-5 text-neon-purple" />
          </motion.div>
          <span className="text-sm font-medium text-neon-purple">AI Analyst</span>
          <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="h-3 bg-white/5 rounded"
              style={{ width: `${100 - i * 10}%` }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-neon-purple" />
          <span className="text-sm font-medium text-neon-purple">AI Analysis</span>
          <Sparkles className="w-4 h-4 text-neon-purple" />
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
        </motion.button>
      </div>
      <div className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
        {analysis}
      </div>
    </motion.div>
  );
}
