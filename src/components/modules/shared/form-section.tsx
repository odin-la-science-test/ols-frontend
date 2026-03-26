'use client';

import { type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useDensity } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// FORM SECTION - Animated card with optional header for settings/form pages
// ═══════════════════════════════════════════════════════════════════════════

interface FormSectionProps {
  id?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  delay?: number;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  id,
  title,
  description,
  icon: Icon,
  delay = 0,
  headerAction,
  children,
  className,
}: FormSectionProps) {
  const d = useDensity();
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className={cn(
        'rounded-xl border border-border/30 bg-card/50 scroll-mt-16',
        className
      )}
    >
      {title && (
        <div className={cn(
          'border-b border-border/30 flex items-center justify-between',
          d.density === 'compact' ? 'px-4 py-2.5' : d.density === 'comfortable' ? 'px-7 py-5' : 'px-6 py-4'
        )}>
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={cn(d.density === 'compact' ? 'p-4' : d.density === 'comfortable' ? 'p-7' : 'p-6')}>{children}</div>
    </motion.div>
  );
}
