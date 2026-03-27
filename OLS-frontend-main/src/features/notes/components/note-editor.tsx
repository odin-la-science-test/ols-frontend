'use client';

import { useState, type KeyboardEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { X, Check } from 'lucide-react';
import { Button, Input, Textarea, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateNote, useUpdateNote, useDeleteNote } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { noteFormSchema, type NoteFormData } from '../schema';
import type { Note, NoteColor } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE EDITOR - Create or edit a note
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

const COLORS: { key: NoteColor; class: string }[] = [
  { key: 'BLUE', class: 'bg-blue-500' },
  { key: 'RED', class: 'bg-red-500' },
  { key: 'GREEN', class: 'bg-green-500' },
  { key: 'YELLOW', class: 'bg-yellow-500' },
  { key: 'PURPLE', class: 'bg-purple-500' },
  { key: 'ORANGE', class: 'bg-orange-500' },
];

interface NoteEditorProps {
  /** Note existante à éditer (null = création) */
  note?: Note | null;
  onSaved: (note: Note) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function NoteEditor({ note, onSaved, onCancel, moduleKey }: NoteEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!note;

  const { form, clearDraft } = useDraftForm<NoteFormData>({
    moduleKey,
    schema: noteFormSchema,
    defaults: { title: '', content: '', color: null, tags: [] },
    entityValues: note ? { title: note.title, content: note.content ?? '', color: note.color as NoteFormData['color'], tags: note.tags } : undefined,
  });

  const { register, control, handleSubmit, formState: { errors } } = form;
  const [tagInput, setTagInput] = useState('');

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const isPending = createNote.isPending || updateNote.isPending;
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();

  const onSubmit = async (data: NoteFormData) => {
    try {
      if (isEditing && note) {
        const previousData = { title: note.title, content: note.content ?? undefined, color: note.color as NoteFormData['color'], tags: note.tags };
        await pushCommand({
          labelKey: 'history.notes.update',
          icon: 'pencil',
          execute: async () => {
            const result = await updateNote.mutateAsync({ id: note.id, data });
            log({ type: 'action', message: t('activity.notes.update'), icon: 'pencil', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('notes.updated') });
          },
          undo: async () => {
            await updateNote.mutateAsync({ id: note.id, data: previousData });
            toast({ title: t('history.undo') });
          },
        });
      } else {
        let createdId: number | null = null;
        await pushCommand({
          labelKey: 'history.notes.create',
          icon: 'plus',
          execute: async () => {
            const result = await createNote.mutateAsync(data);
            createdId = result.id;
            log({ type: 'action', message: t('activity.notes.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('notes.created') });
          },
          undo: async () => {
            if (createdId) {
              await deleteNote.mutateAsync(createdId);
              toast({ title: t('history.undo') });
            }
          },
        });
      }
    } catch {
      toast({ title: t('notes.saveError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col flex-1 min-h-0"
    >
      <SidebarFormBody>
        {/* Title */}
        <SidebarFormField label={t('notes.titleLabel')} error={errors.title?.message ? t(errors.title.message) : undefined}>
          <Input
            {...register('title')}
            placeholder={t('notes.titlePlaceholder')}
            className="bg-card border-border/40 text-base font-semibold"
            autoFocus
          />
        </SidebarFormField>

        {/* Content */}
        <Textarea
          {...register('content')}
          placeholder={t('notes.contentPlaceholder')}
          rows={10}
          className="border-border/40 bg-card"
        />

        {/* Color picker */}
        <SidebarFormField label={t('notes.colorLabel')}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                {/* None option */}
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => field.onChange(null)}
                      className={cn(
                        'w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center',
                        'bg-card',
                        field.value === null
                          ? 'border-foreground/50 scale-110'
                          : 'border-border/40 hover:border-border/80'
                      )}
                    >
                      {field.value === null && <Check className="w-3.5 h-3.5 text-foreground" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t('notes.noColor')}</TooltipContent>
                </Tooltip>
                {COLORS.map((c) => (
                  <Tooltip key={c.key} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => field.onChange(c.key)}
                        className={cn(
                          'w-7 h-7 rounded-lg transition-all flex items-center justify-center',
                          c.class,
                          field.value === c.key
                            ? 'scale-110 shadow-md'
                            : 'hover:scale-105'
                        )}
                      >
                        {field.value === c.key && <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{c.key}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          />
        </SidebarFormField>

        {/* Tags */}
        <SidebarFormField label={t('notes.tagsLabel')}>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {field.value.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value.filter((t: string) => t !== tag))}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder={t('notes.tagPlaceholder')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      const newTag = tagInput.trim().toLowerCase();
                      if (!field.value.includes(newTag)) {
                        field.onChange([...field.value, newTag]);
                      }
                      setTagInput('');
                    }
                  }}
                  className="bg-card border-border/40 h-8 text-xs"
                />
              </>
            )}
          />
        </SidebarFormField>
      </SidebarFormBody>

      {/* Actions */}
      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          {t('notes.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : isEditing ? t('notes.save') : t('notes.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
