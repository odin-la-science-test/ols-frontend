'use client';

import { useCallback } from 'react';

import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useMyContacts, useToggleFavorite } from '../hooks';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT FAVORITE ACTION — Star toggle for EntityActionsBar
// ═══════════════════════════════════════════════════════════════════════════

export function ContactFavoriteAction({ entityId }: { entityId: number }) {
  const { t } = useTranslation();
  const { data: contacts } = useMyContacts();
  const toggleFavMutation = useToggleFavorite();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();

  const isFavorite = contacts?.find((c) => c.id === entityId)?.favorite ?? false;

  const handleToggle = useCallback(() => {
    pushCommand({
      labelKey: 'history.contacts.toggleFavorite',
      icon: 'star',
      execute: async () => {
        await toggleFavMutation.mutateAsync(entityId);
        log({ type: 'action', message: t('activity.contacts.toggleFavorite'), icon: 'star', accentColor: HUGIN_PRIMARY });
      },
      undo: async () => {
        await toggleFavMutation.mutateAsync(entityId);
      },
    });
  }, [entityId, toggleFavMutation, pushCommand, log, t]);

  const tooltipLabel = isFavorite ? t('common.removeFavorite') : t('common.addFavorite');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleToggle} className="h-8 w-8" aria-label={tooltipLabel}>
            <Star className={cn('h-4 w-4 transition-colors', isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
