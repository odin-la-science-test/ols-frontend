'use client';

import { useTranslation } from 'react-i18next';
import { Trash2, Clock, Package, StickyNote, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow, Badge } from '@/components/modules/shared';
import type { StudyCollection } from '../types';
import { useDeleteCollection } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { CollectionItemsList } from './collection-items-list';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION DETAIL PANEL - View details of a study collection
// ═══════════════════════════════════════════════════════════════════════════

interface CollectionDetailPanelProps {
  collection: StudyCollection;
  onClose: () => void;
  onEdit?: () => void;
}

export function CollectionDetailPanel({ collection, onClose, onEdit }: CollectionDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteCollection();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    pushCommand({
      labelKey: 'history.studyCollections.delete',
      icon: 'trash-2',
      execute: async () => {
        await deleteMutation.mutateAsync(collection.id);
        log({ type: 'action', message: t('activity.studyCollections.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
        toast({ title: t('studyCollections.deleted') });
        onClose();
      },
      undo: async () => {
        // Re-create with same data
        const { studyCollectionsApi } = await import('../api');
        await studyCollectionsApi.create({ name: collection.name, description: collection.description || undefined });
        toast({ title: t('history.undo') });
      },
    });
  };

  return (
    <DetailPanelContent
      title={collection.name}
      subtitle={collection.description || undefined}
      badge={
        <Badge variant="secondary" size="sm" className="gap-1">
          <Package className="w-3 h-3" strokeWidth={1.5} />
          {t('studyCollections.itemCount', { count: collection.items.length })}
        </Badge>
      }
      actions={
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-7 text-xs">
              <Pencil className="w-3 h-3" />
              {t('studyCollections.edit')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Description */}
        {collection.description && (
          <DetailSection title={t('studyCollections.description')} icon={StickyNote}>
            <div className={cn(
              'rounded-lg border border-border/40 bg-card p-4',
              'text-sm whitespace-pre-wrap leading-relaxed'
            )}>
              {collection.description}
            </div>
          </DetailSection>
        )}

        {/* Items */}
        <DetailSection title={t('studyCollections.items')} icon={Package}>
          <CollectionItemsList collection={collection} />
        </DetailSection>

        {/* Metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('studyCollections.addedAt')} value={formatDate(collection.createdAt)} />
          <DetailRow label={t('studyCollections.updatedAt')} value={formatDate(collection.updatedAt)} />
        </DetailSection>
      </div>
    </DetailPanelContent>
  );
}
