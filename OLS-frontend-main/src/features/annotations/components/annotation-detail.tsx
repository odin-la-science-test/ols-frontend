'use client';

import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Clock, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import type { Annotation, AnnotationColor } from '../types';
import { useDeleteAnnotation, useCreateAnnotation } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATION DETAIL PANEL - View details of an annotation
// ═══════════════════════════════════════════════════════════════════════════

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

export function AnnotationDetailPanel({ annotation, onClose, onEdit }: AnnotationDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteAnnotation();
  const createMutation = useCreateAnnotation();
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
    const snapshot = {
      entityType: annotation.entityType,
      entityId: annotation.entityId,
      content: annotation.content,
      color: annotation.color,
    };
    pushCommand({
      labelKey: 'history.annotations.delete',
      icon: 'trash-2',
      execute: async () => {
        await deleteMutation.mutateAsync(annotation.id);
        log({ type: 'action', message: t('annotations.deleted'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
        toast({ title: t('annotations.deleted') });
        onClose();
      },
      undo: async () => {
        await createMutation.mutateAsync(snapshot);
        toast({ title: t('history.undo') });
      },
    });
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
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-7 text-xs">
              <Pencil className="w-3 h-3" />
              {t('contacts.edit')}
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
        {/* Content */}
        <DetailSection title={t('annotations.content')} icon={StickyNote}>
          <div className={cn(
            'rounded-lg border border-border/40 bg-card p-4',
            'text-sm whitespace-pre-wrap leading-relaxed'
          )}>
            {annotation.content}
          </div>
        </DetailSection>

        {/* Entity info */}
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
