'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, Trash2, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Note } from '../types';
import { useDeleteNote, useTogglePin } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// NOTE LIST - Grid of user's notes
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_MAP: Record<string, string> = {
  blue: 'border-l-blue-500',
  red: 'border-l-red-500',
  green: 'border-l-green-500',
  yellow: 'border-l-yellow-500',
  purple: 'border-l-purple-500',
  orange: 'border-l-orange-500',
};

const COLOR_BG_MAP: Record<string, string> = {
  blue: 'bg-blue-500/5',
  red: 'bg-red-500/5',
  green: 'bg-green-500/5',
  yellow: 'bg-yellow-500/5',
  purple: 'bg-purple-500/5',
  orange: 'bg-orange-500/5',
};

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  onSelectNote: (note: Note) => void;
  selectedNoteId?: number | null;
}

export function NoteList({ notes, isLoading, onSelectNote, selectedNoteId }: NoteListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Tag className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{t('notes.emptyTitle')}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{t('notes.emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {notes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          index={index}
          isSelected={selectedNoteId === note.id}
          onSelect={() => onSelectNote(note)}
        />
      ))}
    </div>
  );
}

// ─── Individual note card ───

interface NoteCardProps {
  note: Note;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function NoteCard({ note, index, isSelected, onSelect }: NoteCardProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteNote();
  const togglePinMutation = useTogglePin();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(note.id, {
      onSuccess: () => toast({ title: t('notes.deleted') }),
    });
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinMutation.mutate(note.id);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const colorBorder = note.color ? COLOR_MAP[note.color] || '' : '';
  const colorBg = note.color ? COLOR_BG_MAP[note.color] || '' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onSelect}
      className={cn(
        'group flex flex-col p-3 rounded-lg cursor-pointer border-l-[3px]',
        'border border-border/40 bg-card',
        'hover:bg-card hover:border-border/60 transition-all duration-200',
        colorBorder || 'border-l-transparent',
        colorBg,
        isSelected && 'ring-1 ring-[var(--module-accent)] border-border/60'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-1.5">
        <h3 className="flex-1 text-sm font-semibold line-clamp-1">{note.title}</h3>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleTogglePin}
            className={cn(
              'p-1 rounded-md transition-colors',
              note.pinned
                ? 'text-[var(--module-accent)]'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={t('notes.pin')}
          >
            <Pin className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
            title={t('notes.delete')}
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      {note.content && (
        <p className="text-xs text-muted-foreground line-clamp-3 mb-2 whitespace-pre-line">
          {note.content}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          <Clock className="w-3 h-3" />
          {formatDate(note.updatedAt)}
        </div>
        <div className="flex items-center gap-1">
          {note.pinned && (
            <Pin className="w-3 h-3 text-[var(--module-accent)]" strokeWidth={1.5} />
          )}
          {note.tags.length > 0 && (
            <span className="text-[10px] text-muted-foreground/70">
              {note.tags.length} {note.tags.length > 1 ? 'tags' : 'tag'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
