// ═══════════════════════════════════════════════════════════════════════════
// NOTES TYPES - Domain types for lab notebook
// ═══════════════════════════════════════════════════════════════════════════

import type { TFunction } from 'i18next';

export type { NoteColor } from '@/api/generated/enums';
import type { NoteColor } from '@/api/generated/enums';

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
