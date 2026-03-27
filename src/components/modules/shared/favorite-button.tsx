'use client';

import { useCallback } from 'react';

import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui';
import { useFavoritesStore } from '@/stores/favorites-store';

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITE BUTTON — Reusable star toggle for any module entity
// ═══════════════════════════════════════════════════════════════════════════

interface FavoriteButtonProps {
  moduleId: string;
  entityId: string | number;
  label: string;
  route: string;
  className?: string;
}

export function FavoriteButton({ moduleId, entityId, label, route, className }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(moduleId, entityId));
  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  const handleToggle = useCallback(() => {
    if (isFavorite) {
      removeFavorite(moduleId, entityId);
    } else {
      addFavorite({ moduleId, entityId, label, route });
    }
  }, [isFavorite, moduleId, entityId, label, route, addFavorite, removeFavorite]);

  const tooltipLabel = isFavorite ? t('common.removeFavorite') : t('common.addFavorite');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn('h-8 w-8', className)}
            aria-label={tooltipLabel}
          >
            <Star
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400',
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
