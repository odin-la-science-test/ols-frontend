'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Badge } from './badge';
import { useDensity } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { useEditorGroupId } from '@/components/common/editor-group-context';

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
  badge?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
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
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Handle escape key
  React.useEffect(() => {
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
      <div className={cn('flex flex-col h-full overflow-hidden', className)}>
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
              'bg-card/80 backdrop-blur-xl',
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

// ─── Detail Section ───
interface DetailSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
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

// ─── Detail Row ───
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  className?: string;
}

export function DetailRow({ label, value, copyable, className }: DetailRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-4 py-2', className)}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {copyable && typeof value === 'string' ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm font-medium text-foreground">{value}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="text-sm font-medium text-right break-words">{value ?? '—'}</span>
        )}
      </div>
    </div>
  );
}

// ─── Detail Tags ───
interface DetailTagsProps {
  label: string;
  tags: string[];
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'molecule';
  className?: string;
}

export function DetailTags({ label, tags, variant = 'default', className }: DetailTagsProps) {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return (
      <div className={cn('py-2', className)}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-sm text-muted-foreground/70 mt-1">{t('common.none')}</p>
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Badge key={tag} variant={variant}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Code List ───
// Displays a list of API codes with their associated gallery
// Clicking copies only the code (not the gallery)
interface ApiCodeItem {
  gallery: string;
  code: string;
}

interface DetailCodeListProps {
  label: string;
  codes?: ApiCodeItem[];
  className?: string;
}

export function DetailCodeList({ label, codes, className }: DetailCodeListProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!codes || codes.length === 0) {
    return (
      <div className={cn('flex items-start justify-between gap-4 py-2', className)}>
        <span className="text-sm text-muted-foreground shrink-0">{label}</span>
        <span className="text-sm font-medium text-right">—</span>
      </div>
    );
  }

  return (
    <div className={cn('py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-col gap-0.5 mt-2">
        {codes.map((item, index) => (
          <div
            key={`${item.gallery}-${item.code}-${index}`}
            className="flex items-center justify-between gap-2 py-1"
          >
            <span className="text-xs text-muted-foreground">{item.gallery}</span>
            <div className="flex-1 border-b border-dotted border-border/50 mx-2" />
            <button
              onClick={() => handleCopy(item.code, index)}
              className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm font-mono font-medium text-foreground">{item.code}</span>
              {copiedIndex === index ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Boolean Value Row Helper ───
// Generic component for displaying boolean values (replaces BiochemicalRow/CharacteristicRow)
export interface BooleanValueRowProps {
  label: string;
  value?: boolean | null;
}

export function BooleanValueRow({ label, value }: BooleanValueRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${
        value === true ? 'text-success' : 
        value === false ? 'text-muted-foreground' : 
        'text-muted-foreground/50'
      }`}>
        {value === true ? '+' : value === false ? '−' : '?'}
      </span>
    </div>
  );
}

