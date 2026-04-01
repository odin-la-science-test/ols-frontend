// ═══════════════════════════════════════════════════════════════════════════
// NOTES TYPES - Domain types for lab notebook
// ═══════════════════════════════════════════════════════════════════════════

import type { TFunction } from 'i18next';

export type { NoteColor } from '@/api/generated/enums';
import type { NoteColor } from '@/api/generated/enums';

/** Tailwind bg class for a solid color dot (sidebar, table column) */
export const NOTE_COLOR_DOT_CLASSES: Record<NoteColor, string> = {
  BLUE: 'bg-blue-500',
  RED: 'bg-red-500',
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-500',
  PURPLE: 'bg-violet-500',
  ORANGE: 'bg-orange-500',
};

export function noteColorLabel(color: NoteColor, t: TFunction): string {
  switch (color) {
    case 'BLUE': return t('notes.colors.blue');
    case 'RED': return t('notes.colors.red');
    case 'GREEN': return t('notes.colors.green');
    case 'YELLOW': return t('notes.colors.yellow');
    case 'PURPLE': return t('notes.colors.purple');
    case 'ORANGE': return t('notes.colors.orange');
  }
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  color: NoteColor | null;
  pinned: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;

  ownerName: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
  color?: NoteColor | null;
  pinned?: boolean;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  color?: NoteColor | null;
  pinned?: boolean;
  tags?: string[];
}
