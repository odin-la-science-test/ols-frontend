'use client';

import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Badge } from '@/components/modules/shared';
import type { StudyCollection } from '../types';
import { useRemoveItem } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION ITEMS LIST - Displays items in a study collection
// ═══════════════════════════════════════════════════════════════════════════

interface CollectionItemsListProps {
  collection: StudyCollection;
}

export function CollectionItemsList({ collection }: CollectionItemsListProps) {
  const { t } = useTranslation();
  const removeItemMutation = useRemoveItem();

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(
      { collectionId: collection.id, itemId },
      {
        onSuccess: () => {
          toast({ title: t('studyCollections.itemRemoved') });
        },
      },
    );
  };

  if (collection.items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {t('studyCollections.noItems')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {collection.items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-center justify-between gap-3 p-3',
            'rounded-lg border border-border/40 bg-card',
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Badge variant="secondary" size="sm">
              {item.moduleId}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{item.entityId}
            </span>
            {item.notes && (
              <span className="text-xs text-muted-foreground truncate">
                {item.notes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {new Date(item.addedAt).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(item.id)}
              disabled={removeItemMutation.isPending}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
