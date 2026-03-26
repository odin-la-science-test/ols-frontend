'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useDensity } from '@/hooks';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { useEditorGroupId } from '@/components/common/editor-group-context';

// Re-export sub-components so all previous imports from this file keep working
export { DetailPanelContent, DetailSection } from './detail-content';
export { DetailRow, DetailTags, DetailCodeList, BooleanValueRow } from './detail-row';
export type { ApiCodeItem, BooleanValueRowProps } from './detail-row';

// ═══════════════════════════════════════════════════════════════════════════
// DETAIL PANEL - Item detail view
//
// Desktop (lg+): renders via portal into the SecondarySidebar at shell level.
//                No overlay, no absolute positioning — a true side panel.
// Mobile (<lg):  slide-in overlay panel from the right (original behaviour).
// ═══════════════════════════════════════════════════════════════════════════

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  actions,
  className,
}: DetailPanelProps) {
  const d = useDensity();
  const editorGroupId = useEditorGroupId();
  const portalTarget = useModuleDetailStore((s) => s.portalTargets[editorGroupId] ?? null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Shared inner content for mobile (header with close button + body + actions)
  const panelContentMobile = (
    <>
      {/* Header with close button — mobile only */}
      <div className={cn('flex items-start justify-between gap-4 border-b border-border/50', d.detailPadding)}>
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

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
    </>
  );

  // Shared inner content for desktop (no close button — zone header X handles it)
  const panelContentDesktop = (
    <>
      {/* Compact header — title + badge */}
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
    </>
  );

  // ── Desktop: render into SecondarySidebar via portal ──
  if (isDesktop && portalTarget && isOpen) {
    return createPortal(
      <div data-tour="detail-panel" className={cn('flex flex-col h-full overflow-hidden', className)}>
        {panelContentDesktop}
      </div>,
      portalTarget,
    );
  }

  // ── Mobile: slide-in overlay ──
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'absolute right-0 top-0 bottom-0 z-50 lg:hidden',
              'w-full max-w-md',
              'glass-overlay',
              'border-l border-border/50',
              'shadow-2xl',
              'flex flex-col',
              'pb-14', // Clear MobileBottomBar on mobile
              className
            )}
          >
            {panelContentMobile}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
