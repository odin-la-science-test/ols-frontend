import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// WIDGET WRAPPER - Consistent container for all dashboard widgets
// Provides uniform card styling (border, bg, padding)
// Fills the grid cell provided by react-grid-layout
//
// Uses CSS @container so child widgets can use container query variants
// (@xs:, @sm:, @md:, @lg:) to adapt to their own size, not the viewport.
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardWidgetWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function DashboardWidgetWrapper({
  children,
  className,
}: DashboardWidgetWrapperProps) {
  return (
    <div
      className={cn(
        '@container h-full w-full rounded-xl overflow-hidden border border-border/30 glass-surface',
        className,
      )}
    >
      <div className="h-full p-2.5 @xs:p-3 @sm:p-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
