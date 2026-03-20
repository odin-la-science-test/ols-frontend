import * as React from 'react';
import { motion } from 'framer-motion';
import { type WidgetId } from '@/stores/dashboard-store';

// ═══════════════════════════════════════════════════════════════════════════
// WIDGET WRAPPER - Consistent container for all dashboard widgets
// Provides uniform card styling (border, bg, padding, animation)
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardWidgetWrapperProps {
  id: WidgetId;
  children: React.ReactNode;
  className?: string;
}

export function DashboardWidgetWrapper({
  children,
  className,
}: DashboardWidgetWrapperProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
    >
      <div className="relative h-full rounded-xl overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="p-4">{children}</div>
      </div>
    </motion.div>
  );
}
