import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface CounterAnimationProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function CounterAnimation({ value, duration = 1.5, className = '' }: CounterAnimationProps) {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className}>
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
