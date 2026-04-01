'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Trash2, Clock, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import { InlineTextarea, InlineSelect } from '@/components/modules/shared/inline-fields';
import { useInlineAutoSave } from '@/hooks/use-inline-auto-save';
import type { Annotation, AnnotationColor, UpdateAnnotationRequest } from '../types';
import { useDeleteAnnotation, useUpdateAnnotation, useAnnotationDetail } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATION DETAIL PANEL — Inline editable, auto-save on blur
// ═══════════════════════════════════════════════════════════════════════════

interface AnnotationFormValues {
  content: string;
  color: AnnotationColor;
}

const ANNOTATION_COLORS = [
  { value: 'YELLOW', label: 'YELLOW' },
  { value: 'GREEN', label: 'GREEN' },
  { value: 'BLUE', label: 'BLUE' },
  { value: 'PINK', label: 'PINK' },
];

function getColorDotClass(color: AnnotationColor): string {
  switch (color) {
    case 'YELLOW': return 'bg-yellow-500';
    case 'GREEN': return 'bg-green-500';
    case 'BLUE': return 'bg-blue-500';
    case 'PINK': return 'bg-pink-500';
  }
}

function getColorLabel(color: AnnotationColor, t: ReturnType<typeof useTranslation>['t']): string {
  switch (color) {
    case 'YELLOW': return t('annotations.color.YELLOW');
    case 'GREEN': return t('annotations.color.GREEN');
    case 'BLUE': return t('annotations.color.BLUE');
    case 'PINK': return t('annotations.color.PINK');
  }
}

interface AnnotationDetailPanelProps {
  annotation: Annotation;
  onClose: () => void;
  onEdit?: () => void;
}

export function AnnotationDetailPanel({ annotation: initialAnnotation, onClose }: AnnotationDetailPanelProps) {
  // Get fresh data from React Query cache (refreshes after undo/redo invalidation)
  const { data: freshAnnotation } = useAnnotationDetail(initialAnnotation.id);
  const annotation = freshAnnotation ?? initialAnnotation;

  const { t } = useTranslation();
  const deleteMutation = useDeleteAnnotation();
  const updateMutation = useUpdateAnnotation();
  const { log } = useActivityLog();

  const form = useForm<AnnotationFormValues>({
    defaultValues: {
      content: annotation.content,
      color: annotation.color,
    },
  });

  const { handleFieldBlur, saveField, saveStatus } = useInlineAutoSave<AnnotationFormValues, UpdateAnnotationRequest>({
    form,
    updateMutation,
    entityId: annotation.id,
    entityValues: {
      content: annotation.content,
      color: annotation.color,
    },
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(annotation.id);
      log({ type: 'action', message: t('annotations.deleted'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
      toast({ title: t('annotations.deleted') });
      onClose();
    } catch {
      toast({ title: t('annotations.deleteError'), variant: 'destructive' });
    }
  };

  const contentPreview = annotation.content.length > 40
    ? `${annotation.content.slice(0, 40)}...`
    : annotation.content;

  return (
    <DetailPanelContent
      title={contentPreview}
      subtitle={`${annotation.entityType} #${annotation.entityId}`}
      badge={
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2.5 h-2.5 rounded-full', getColorDotClass(annotation.color))} />
          <span className="text-xs text-muted-foreground">
            {getColorLabel(annotation.color, t)}
          </span>
        </div>
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
      <div className="space-y-4">
        {/* Editable fields */}
        <InlineTextarea
          label={t('annotations.content')}
          registration={form.register('content')}
          onFieldBlur={() => handleFieldBlur('content' as never)}
          placeholder={t('annotations.contentPlaceholder')}
          rows={6}
          saveStatus={saveStatus}
        />

        <InlineSelect<AnnotationFormValues>
          label={t('annotations.color.label')}
          name="color"
          control={form.control}
          options={ANNOTATION_COLORS}
          onSave={() => saveField('color' as never)}
          saveStatus={saveStatus}
        />

        {/* Read-only fields */}
        <DetailSection title={t('annotations.entityType')} icon={StickyNote}>
          <DetailRow label={t('annotations.entityType')} value={annotation.entityType} />
          <DetailRow label={t('annotations.entityId')} value={String(annotation.entityId)} />
        </DetailSection>

        {/* Metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('contacts.createdAt')} value={formatDate(annotation.createdAt)} />
          <DetailRow label={t('contacts.updatedAt')} value={formatDate(annotation.updatedAt)} />
          <DetailRow label={t('annotations.owner')} value={annotation.ownerName} />
        </DetailSection>
      </div>
    </DetailPanelContent>
  );
}
