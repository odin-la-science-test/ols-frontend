import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, animate, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * AnimatedCounter - Anime un nombre de 0 vers une cible quand il entre dans le viewport.
 * Utilise framer-motion pour une animation fluide.
 */
export function AnimatedCounter({
  target,
  suffix = '',
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (v) => {
      setDisplay(Math.round(v));
    });
    return unsubscribe;
  }, [motionValue]);

  useEffect(() => {
    if (isInView) {
      animate(motionValue, target, { duration });
    }
  }, [isInView, motionValue, target, duration]);

  return (
    <motion.span ref={ref} className={cn('tabular-nums', className)}>
      {display}
      {suffix}
    </motion.span>
  );
}
