'use client';

import { useCallback } from 'react';

import { Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useMyNotes, useTogglePin } from '../hooks';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE PIN ACTION — Pin toggle for EntityActionsBar
// ═══════════════════════════════════════════════════════════════════════════

export function NotePinAction({ entityId }: { entityId: number }) {
  const { t } = useTranslation();
  const { data: notes } = useMyNotes();
  const togglePinMutation = useTogglePin();
  const { log } = useActivityLog();

  const isPinned = notes?.find((n) => n.id === entityId)?.pinned ?? false;

  const handleToggle = useCallback(async () => {
    await togglePinMutation.mutateAsync(entityId);
    log({ type: 'action', message: t('activity.notes.togglePin'), icon: 'pin', accentColor: HUGIN_PRIMARY });
  }, [entityId, togglePinMutation, log, t]);

  const tooltipLabel = isPinned ? t('notes.unpin') : t('notes.pin');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleToggle} className="h-8 w-8" aria-label={tooltipLabel}>
            <Pin className={cn('h-4 w-4 transition-colors', isPinned ? 'fill-[var(--module-accent)] text-[var(--module-accent)]' : 'text-muted-foreground hover:text-[var(--module-accent)]')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
