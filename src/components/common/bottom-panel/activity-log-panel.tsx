'use client';

import { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { ENTRY_TYPE_ICON, ENTRY_TYPE_COLOR, formatTimestamp } from './constants';

export function ActivityLogPanel() {
  const { t } = useTranslation();
  const activityLog = useBottomPanelStore((s) => s.activityLog);
  const clearLog = useBottomPanelStore((s) => s.clearLog);
  const listRef = useRef<HTMLDivElement>(null);

  if (activityLog.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60">
        {t('bottomPanel.noActivity')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with clear button */}
      <div className="flex items-center justify-end px-3 py-1 border-b border-border/20">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={clearLog}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              {t('bottomPanel.clearLog')}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('bottomPanel.clearLog')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Log entries */}
      <div ref={listRef} className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {activityLog.map((entry) => {
          const TypeIcon = ENTRY_TYPE_ICON[entry.type] ?? Settings;
          const typeColor = ENTRY_TYPE_COLOR[entry.type] ?? 'text-muted-foreground';
          return (
            <div
              key={entry.id}
              className="flex items-start gap-2 px-3 py-0.5 hover:bg-muted/30 transition-colors"
            >
              <span className="text-muted-foreground/60 shrink-0 tabular-nums w-16">
                {formatTimestamp(entry.timestamp)}
              </span>
              <TypeIcon className={cn('h-3 w-3 mt-0.5 shrink-0', typeColor)} />
              <span className="text-foreground/90 flex-1 break-words">
                {entry.message}
                {entry.detail && (
                  <span className="text-muted-foreground/60 ml-1">{entry.detail}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
