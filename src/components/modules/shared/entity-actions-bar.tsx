'use client';

import { useState, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { StickyNote, Library } from 'lucide-react';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui';
import { FavoriteButton } from './favorite-button';
import { AnnotationPanel } from './annotation-panel';
import { AddToCollectionDialog } from './add-to-collection-dialog';

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY ACTIONS BAR — Compact action row for detail panel header
// ═══════════════════════════════════════════════════════════════════════════

interface EntityActionsBarProps {
  entityId: number;
  annotations?: { entityType: string };
  collections?: { moduleId: string };
  favorite?: { moduleId: string; label: string; route: string };
  renderFavoriteAction?: (props: { entityId: number }) => ReactNode;
}

export function EntityActionsBar({
  entityId,
  annotations,
  collections,
  favorite,
  renderFavoriteAction,
}: EntityActionsBarProps) {
  const { t } = useTranslation();
  const [annotationsOpen, setAnnotationsOpen] = useState(false);

  return (
    <div>
      {/* Action buttons */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border/30">
        {/* Annotations toggle */}
        {annotations && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAnnotationsOpen((prev) => !prev)}
                  className="h-8 w-8"
                  aria-label={t('entityActions.annotations')}
                >
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('entityActions.annotations')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Collections dialog */}
        {collections && (
          <AddToCollectionDialog
            moduleId={collections.moduleId}
            entityId={entityId}
            trigger={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={t('entityActions.addToCollection')}
                    >
                      <Library className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('entityActions.addToCollection')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
        )}

        {/* Favorite (custom render or store-based) */}
        {renderFavoriteAction
          ? renderFavoriteAction({ entityId })
          : favorite && (
            <FavoriteButton
              moduleId={favorite.moduleId}
              entityId={entityId}
              label={favorite.label}
              route={favorite.route}
            />
          )}
      </div>

      {/* Annotation panel (expandable) */}
      {annotations && annotationsOpen && (
        <AnnotationPanel
          entityType={annotations.entityType}
          entityId={entityId}
          onClose={() => setAnnotationsOpen(false)}
        />
      )}
    </div>
  );
}
