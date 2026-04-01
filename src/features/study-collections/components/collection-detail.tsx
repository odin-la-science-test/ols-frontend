'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Trash2, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow, Badge } from '@/components/modules/shared';
import { InlineText, InlineTextarea } from '@/components/modules/shared/inline-fields';
import { useInlineAutoSave } from '@/hooks/use-inline-auto-save';
import type { StudyCollection, UpdateStudyCollectionRequest } from '../types';
import { useDeleteCollection, useUpdateCollection, useCollectionDetail } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { CollectionItemsList } from './collection-items-list';

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION DETAIL PANEL — Inline editable, auto-save on blur
// ═══════════════════════════════════════════════════════════════════════════

interface CollectionFormValues {
  name: string;
  description: string;
}

interface CollectionDetailPanelProps {
  collection: StudyCollection;
  onClose: () => void;
  onEdit?: () => void;
}

export function CollectionDetailPanel({ collection: initialCollection, onClose }: CollectionDetailPanelProps) {
  // Get fresh data from React Query cache (refreshes after undo/redo invalidation)
  const { data: freshCollection } = useCollectionDetail(initialCollection.id);
  const collection = freshCollection ?? initialCollection;

  const { t } = useTranslation();
  const deleteMutation = useDeleteCollection();
  const updateMutation = useUpdateCollection();
  const { log } = useActivityLog();

  const form = useForm<CollectionFormValues>({
    defaultValues: {
      name: collection.name,
      description: collection.description ?? '',
    },
  });

  const { handleFieldBlur, saveStatus } = useInlineAutoSave<CollectionFormValues, UpdateStudyCollectionRequest>({
    form,
    updateMutation,
    entityId: collection.id,
    entityValues: {
      name: collection.name,
      description: collection.description ?? '',
    },
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(collection.id);
      log({ type: 'action', message: t('activity.studyCollections.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
      toast({ title: t('studyCollections.deleted') });
      onClose();
    } catch {
      toast({ title: t('studyCollections.deleteError'), variant: 'destructive' });
    }
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Editable fields */}
        <InlineText
          label={t('studyCollections.name')}
          registration={form.register('name')}
          onFieldBlur={() => handleFieldBlur('name' as never)}
          placeholder={t('studyCollections.namePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineTextarea
          label={t('studyCollections.description')}
          registration={form.register('description')}
          onFieldBlur={() => handleFieldBlur('description' as never)}
          placeholder={t('studyCollections.descriptionPlaceholder')}
          rows={4}
        />

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
