'use client';

import { useTranslation } from 'react-i18next';
import { Pin, Pencil, Trash2, Clock, Tag, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import type { Note } from '../types';
import { useDeleteNote, useTogglePin } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE DETAIL PANEL - View details of a note
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
  onEdit: () => void;
}

export function NoteDetailPanel({ note, onClose, onEdit }: NoteDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteNote();
  const togglePinMutation = useTogglePin();

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
    deleteMutation.mutate(note.id, {
      onSuccess: () => {
        toast({ title: t('notes.deleted') });
        onClose();
      },
    });
  };

  const handleTogglePin = () => {
    togglePinMutation.mutate(note.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {note.color && (
          <div className={cn('w-3 h-3 rounded-full shrink-0', COLOR_DOT[note.color] || '')} />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{note.title}</h3>
          <p className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors hidden lg:block">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t('notes.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePin}
            className={cn('gap-1.5', note.pinned && 'text-[var(--module-accent)]')}
          >
            <Pin className="w-3.5 h-3.5" />
            {note.pinned ? t('notes.unpin') : t('notes.pin')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('notes.delete')}
          </Button>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Tag className="w-3 h-3" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-muted/60 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('notes.createdAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(note.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('notes.updatedAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(note.updatedAt)}</p>
          </div>
        </div>

        {/* Content */}
        {note.content && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('notes.content')}
            </label>
            <div
              className={cn(
                'rounded-lg border border-border/40 bg-card p-4',
                'text-sm whitespace-pre-wrap leading-relaxed'
              )}
            >
              {note.content}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
