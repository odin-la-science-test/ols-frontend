'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import { InlineText, InlineTextarea, InlineColorPicker, InlineTagInput } from '@/components/modules/shared/inline-fields';
import { useInlineAutoSave } from '@/hooks/use-inline-auto-save';
import { useDeleteNote, useUpdateNote, useNoteDetail } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import type { Note, UpdateNoteRequest, NoteColor } from '../types';
import { NOTE_COLOR_DOT_CLASSES } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE DETAIL PANEL — Inline editable, auto-save on blur
// ═══════════════════════════════════════════════════════════════════════════

interface NoteFormValues {
  title: string;
  content: string;
  color: NoteColor | null;
  tags: string[];
}

const NOTE_COLORS = Object.entries(NOTE_COLOR_DOT_CLASSES).map(([value, className]) => ({
  value,
  label: value,
  className,
}));

interface NoteDetailPanelProps {
  note: Note;
  onClose: () => void;
  onEdit?: () => void;
}

export function NoteDetailPanel({ note: initialNote, onClose }: NoteDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteNote();
  const updateMutation = useUpdateNote();
  const { log } = useActivityLog();

  // Use React Query for fresh data (updates after undo/redo cache invalidation)
  const { data: freshNote } = useNoteDetail(initialNote.id);
  const note = freshNote ?? initialNote;

  const entityValues: NoteFormValues = {
    title: note.title,
    content: note.content ?? '',
    color: note.color,
    tags: note.tags,
  };

  const form = useForm<NoteFormValues>({ defaultValues: entityValues });

  const { handleFieldBlur, saveField, saveStatus } = useInlineAutoSave<NoteFormValues, UpdateNoteRequest>({
    form,
    updateMutation,
    entityId: note.id,
    entityValues,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(note.id);
    log({ type: 'action', message: t('activity.notes.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
    toast({ title: t('notes.deleted') });
    onClose();
  };

  return (
    <DetailPanelContent
      title={note.title}
      subtitle={formatDate(note.updatedAt)}
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
        <InlineText
          label={t('notes.title')}
          registration={form.register('title')}
          onFieldBlur={() => handleFieldBlur('title' as never)}
          placeholder={t('notes.titlePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineTextarea
          label={t('notes.content')}
          registration={form.register('content')}
          onFieldBlur={() => handleFieldBlur('content' as never)}
          placeholder={t('notes.contentPlaceholder')}
          rows={6}
        />

        <InlineColorPicker<NoteFormValues>
          label={t('notes.color')}
          name="color"
          control={form.control}
          colors={NOTE_COLORS}
          onSave={() => saveField('color' as never)}
        />

        <InlineTagInput<NoteFormValues>
          label="Tags"
          name="tags"
          control={form.control}
          onFieldBlur={() => handleFieldBlur('tags' as never)}
          placeholder={t('notes.addTag')}
        />

        {/* Read-only metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('notes.createdAt')} value={formatDate(note.createdAt)} />
          <DetailRow label={t('notes.updatedAt')} value={formatDate(note.updatedAt)} />
        </DetailSection>
      </div>
    </DetailPanelContent>
  );
}
