import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Wraps a landing section with scroll-triggered fade-in animation.
 * Sections control their own background via className.
 */
export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}
