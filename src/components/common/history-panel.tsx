'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Undo2, Redo2, Trash2 } from 'lucide-react';

import { useHistoryStore } from '@/stores/history-store';
import { registry } from '@/lib/module-registry';
import { getModuleIcon } from '@/lib/module-icons';
import { IconButtonWithTooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format-time';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY PANEL — Activity bar panel for undo/redo history
//
// Shows the history stack for the currently active module scope.
// Entries after the pointer are grayed out (undone state).
// Click an entry to jumpTo it.
// ═══════════════════════════════════════════════════════════════════════════

const GLOBAL_SCOPE = '__global__';
const EMPTY_ENTRIES: never[] = [];

function useActiveScope(): string {
  const { pathname } = useLocation();
  return registry.getByRoute(pathname)?.id ?? GLOBAL_SCOPE;
}

export function HistoryPanel() {
  const { t } = useTranslation();
  const scope = useActiveScope();
  const scopeState = useHistoryStore((s) => s.scopes[scope]);
  const entries = scopeState?.entries ?? EMPTY_ENTRIES;
  const pointer = scopeState?.pointer ?? -1;
  const canUndo = pointer >= 0;
  const canRedo = scopeState ? pointer < scopeState.entries.length - 1 : false;

  const handleUndo = useCallback(() => {
    useHistoryStore.getState().undo(scope);
  }, [scope]);

  const handleRedo = useCallback(() => {
    useHistoryStore.getState().redo(scope);
  }, [scope]);

  const handleClear = useCallback(() => {
    useHistoryStore.getState().clearScope(scope);
  }, [scope]);

  const handleJumpTo = useCallback(
    (entryId: string) => {
      useHistoryStore.getState().jumpTo(scope, entryId);
    },
    [scope],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/30">
        <IconButtonWithTooltip
          icon={<Undo2 className="w-4 h-4" strokeWidth={1.5} />}
          tooltip={t('history.undo')}
          onClick={handleUndo}
          disabled={!canUndo}
          side="bottom"
        />
        <IconButtonWithTooltip
          icon={<Redo2 className="w-4 h-4" strokeWidth={1.5} />}
          tooltip={t('history.redo')}
          onClick={handleRedo}
          disabled={!canRedo}
          side="bottom"
        />
        <div className="flex-1" />
        <IconButtonWithTooltip
          icon={<Trash2 className="w-4 h-4" strokeWidth={1.5} />}
          tooltip={t('history.clear')}
          onClick={handleClear}
          disabled={entries.length === 0}
          side="bottom"
        />
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {t('history.empty')}
          </p>
        ) : (
          // Render newest first (reversed)
          [...entries].reverse().map((entry, reversedIdx) => {
            const realIdx = entries.length - 1 - reversedIdx;
            const isActive = realIdx === pointer;
            const isUndone = realIdx > pointer;
            const EntryIcon = entry.icon ? getModuleIcon(entry.icon) : null;

            return (
              <button
                key={entry.id}
                onClick={() => handleJumpTo(entry.id)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-xs transition-colors duration-200',
                  'hover:bg-muted/50',
                  isActive && 'border-l-2 border-[var(--module-accent,hsl(var(--primary)))] bg-muted/30',
                  isUndone && 'opacity-40',
                  !isActive && !isUndone && 'border-l-2 border-transparent',
                )}
              >
                {EntryIcon && (
                  <EntryIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                )}
                <span className="truncate flex-1">{t(entry.labelKey)}</span>
                <span className="text-muted-foreground shrink-0">
                  {formatRelativeTime(entry.timestamp, t)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
