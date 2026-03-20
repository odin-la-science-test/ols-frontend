'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Tag } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCreateNote, useUpdateNote } from '../hooks';
import { toast } from '@/hooks';
import type { Note, NoteColor } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE EDITOR - Create or edit a note
// ═══════════════════════════════════════════════════════════════════════════

const COLORS: { key: NoteColor; class: string }[] = [
  { key: 'blue', class: 'bg-blue-500' },
  { key: 'red', class: 'bg-red-500' },
  { key: 'green', class: 'bg-green-500' },
  { key: 'yellow', class: 'bg-yellow-500' },
  { key: 'purple', class: 'bg-purple-500' },
  { key: 'orange', class: 'bg-orange-500' },
];

interface NoteEditorProps {
  /** Note existante à éditer (null = création) */
  note?: Note | null;
  onSaved: (note: Note) => void;
  onCancel: () => void;
}

export function NoteEditor({ note, onSaved, onCancel }: NoteEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!note;

  const [title, setTitle] = React.useState(note?.title || '');
  const [content, setContent] = React.useState(note?.content || '');
  const [color, setColor] = React.useState<string | null>(note?.color || null);
  const [tagInput, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>(note?.tags || []);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const isPending = createNote.isPending || updateNote.isPending;

  const canSubmit = title.trim().length > 0;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (isEditing && note) {
        const result = await updateNote.mutateAsync({
          id: note.id,
          data: {
            title,
            content,
            color,
            tags,
          },
        });
        onSaved(result);
        toast({ title: t('notes.updated') });
      } else {
        const result = await createNote.mutateAsync({
          title,
          content,
          color,
          tags,
        });
        onSaved(result);
        toast({ title: t('notes.created') });
      }
    } catch {
      toast({ title: t('notes.saveError'), variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Title */}
      <Input
        placeholder={t('notes.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-card border-border/40 text-base font-semibold"
        autoFocus
      />

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('notes.contentPlaceholder')}
        rows={10}
        className={cn(
          'w-full rounded-lg border border-border/40 bg-card',
          'px-3 py-2 text-sm resize-y',
          'placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)]',
          'transition-colors'
        )}
      />

      {/* Color picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('notes.colorLabel')}
        </label>
        <div className="flex items-center gap-2">
          {/* None option */}
          <button
            onClick={() => setColor(null)}
            className={cn(
              'w-7 h-7 rounded-full border-2 transition-all',
              'bg-card',
              color === null
                ? 'border-foreground scale-110'
                : 'border-border/40 hover:border-border/80'
            )}
            title={t('notes.noColor')}
          />
          {COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => setColor(c.key)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all',
                c.class,
                color === c.key
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:scale-105'
              )}
              title={c.key}
            />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Tag className="w-3 h-3" />
          {t('notes.tagsLabel')}
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-xs"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
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
          onKeyDown={handleAddTag}
          className="bg-card border-border/40 h-8 text-xs"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          {t('notes.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isEditing ? t('notes.save') : t('notes.create')}
        </Button>
      </div>
    </motion.div>
  );
}
