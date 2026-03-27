'use client';

import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';

// ─── Detail Panel Content (no portal, no overlay) ───
// Used by detail components rendered within CollectionLayout's portal.
// Provides the same header + content + actions structure as DetailPanel
// but without self-portaling. The parent layout handles positioning.

interface DetailPanelContentProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DetailPanelContent({
  title,
  subtitle,
  badge,
  children,
  actions,
  className,
}: DetailPanelContentProps) {
  const d = useDensity();

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header */}
      <div className={cn('flex items-center gap-2 border-b border-border/50 px-3 py-2')}>
        <h2 className="text-sm font-semibold truncate flex-1 min-w-0">{title}</h2>
        {badge}
      </div>
      {subtitle && (
        <div className="px-3 py-1 border-b border-border/20 bg-muted/20">
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      )}

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto', d.detailPadding)}>
        {children}
      </div>

      {/* Actions */}
      {actions && (
        <div className={cn('border-t border-border/50 bg-muted/20', d.detailPadding)}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Detail Section ───
interface DetailSectionProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ title, icon: Icon, children, className }: DetailSectionProps) {
  const d = useDensity();

  return (
    <div className={cn(d.detailSectionGap, className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
