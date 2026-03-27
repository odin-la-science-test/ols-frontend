'use client';

import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow, DetailTags } from '@/components/modules/shared';
import type { Note } from '../types';
import { useDeleteNote, useRestoreNote } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE DETAIL PANEL - View details of a note
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

interface NoteDetailPanelProps {
  note: Note;
  onClose: () => void;
  onEdit?: () => void;
}

export function NoteDetailPanel({ note, onClose, onEdit }: NoteDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteNote();
  const restoreMutation = useRestoreNote();
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
      labelKey: 'history.notes.delete',
      icon: 'trash-2',
      execute: async () => {
        await deleteMutation.mutateAsync(note.id);
        log({ type: 'action', message: t('activity.notes.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
        toast({ title: t('notes.deleted') });
        onClose();
      },
      undo: async () => {
        await restoreMutation.mutateAsync(note.id);
        toast({ title: t('notes.restored') });
      },
    });
  };

  return (
    <DetailPanelContent
      title={note.title}
      subtitle={formatDate(note.updatedAt)}
      badge={
        note.color ? (
          <div className={cn('w-3 h-3 rounded-full shrink-0', COLOR_DOT[note.color] || '')} />
        ) : undefined
      }
      actions={
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-7 text-xs">
              <Pencil className="w-3 h-3" />
              {t('notes.edit')}
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
        {/* Tags */}
        {note.tags.length > 0 && (
          <DetailTags label="Tags" tags={note.tags} />
        )}

        {/* Metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('notes.createdAt')} value={formatDate(note.createdAt)} />
          <DetailRow label={t('notes.updatedAt')} value={formatDate(note.updatedAt)} />
        </DetailSection>

        {/* Content */}
        {note.content && (
          <DetailSection title={t('notes.content')}>
            <div
              className={cn(
                'rounded-lg border border-border/40 bg-card p-4',
                'text-sm whitespace-pre-wrap leading-relaxed'
              )}
            >
              {note.content}
            </div>
          </DetailSection>
        )}
      </div>
    </DetailPanelContent>
  );
}
