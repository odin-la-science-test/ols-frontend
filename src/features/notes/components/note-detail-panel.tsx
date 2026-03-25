'use client';

import { useTranslation } from 'react-i18next';
import { Pin, Pencil, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow, DetailTags } from '@/components/modules/shared';
import type { Note } from '../types';
import { useDeleteNote, useCreateNote, useTogglePin } from '../hooks';
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
  const createMutation = useCreateNote();
  const togglePinMutation = useTogglePin();
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
    const snapshot = { title: note.title, content: note.content ?? undefined, color: note.color, pinned: note.pinned, tags: note.tags };
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
        await createMutation.mutateAsync(snapshot);
        toast({ title: t('history.undo') });
      },
    });
  };

  const handleTogglePin = () => {
    pushCommand({
      labelKey: 'history.notes.togglePin',
      icon: 'pin',
      execute: async () => {
        await togglePinMutation.mutateAsync(note.id);
        log({ type: 'action', message: t('activity.notes.togglePin'), icon: 'pin', accentColor: HUGIN_PRIMARY });
      },
      undo: async () => { await togglePinMutation.mutateAsync(note.id); },
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
            onClick={handleTogglePin}
            className={cn('gap-1.5 h-7 text-xs', note.pinned && 'text-[var(--module-accent)]')}
          >
            <Pin className="w-3 h-3" />
          </Button>
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
                'rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-4',
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
