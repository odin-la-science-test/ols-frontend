'use client';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Undo2, Redo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { useRouteHistoryStore } from '@/stores/route-history-store';
import { useHistory } from '@/hooks/use-history';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION BAR — Address bar with back/forward + breadcrumbs
//
// Like a browser address bar: [←][→] + route breadcrumbs.
// Used standalone in classic mode (gap Arc) and embedded in TitleBar (IDE).
// In classic mode, also shows undo/redo (no activity bar / history panel).
// ═══════════════════════════════════════════════════════════════════════════

interface NavigationBarProps {
  /** Additional class names for the container */
  className?: string;
  /** Compact mode (smaller buttons) — used when embedded in TitleBar */
  compact?: boolean;
  /** Show undo/redo buttons — classic mode only (no activity bar) */
  showUndoRedo?: boolean;
}

export function NavigationBar({ className, compact, showUndoRedo }: NavigationBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canGoBack = useRouteHistoryStore((s) => s.canGoBack());
  const canGoForward = useRouteHistoryStore((s) => s.canGoForward());
  const { canUndo, canRedo, undo, redo } = useHistory();

  const handleBack = useCallback(() => {
    const path = useRouteHistoryStore.getState().goBack();
    if (path) navigate(path);
  }, [navigate]);

  const handleForward = useCallback(() => {
    const path = useRouteHistoryStore.getState().goForward();
    if (path) navigate(path);
  }, [navigate]);

  const iconSize = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const btnSize = compact ? 'h-5 w-5' : 'h-6 w-6';
  const btnClass = cn(
    'inline-flex items-center justify-center rounded-sm transition-colors',
    'text-foreground/70 hover:text-foreground hover:bg-muted/40',
    'disabled:opacity-30 disabled:cursor-default',
    btnSize,
  );

  return (
    <div className={cn('flex items-center gap-1 min-w-0', className)}>
      {/* Back / Forward buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button onClick={handleBack} disabled={!canGoBack} className={btnClass} aria-label={t('navigation.back')}>
              <ArrowLeft className={iconSize} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{t('navigation.back')}</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button onClick={handleForward} disabled={!canGoForward} className={btnClass} aria-label={t('navigation.forward')}>
              <ArrowRight className={iconSize} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{t('navigation.forward')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs className="min-w-0 flex-1" forceVisible />

      {/* Undo / Redo — classic mode only */}
      {showUndoRedo && (
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button onClick={undo} disabled={!canUndo} className={btnClass} aria-label={t('history.undo')}>
                <Undo2 className={iconSize} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t('history.undo')}</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button onClick={redo} disabled={!canRedo} className={btnClass} aria-label={t('history.redo')}>
                <Redo2 className={iconSize} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t('history.redo')}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
