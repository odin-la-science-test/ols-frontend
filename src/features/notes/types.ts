// ═══════════════════════════════════════════════════════════════════════════
// NOTES TYPES - Domain types for lab notebook
// ═══════════════════════════════════════════════════════════════════════════

export type NoteColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Note {
  id: number;
  title: string;
  content: string | null;
  color: string | null;
  pinned: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;

  ownerName: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
  color?: string | null;
  pinned?: boolean;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  color?: string | null;
  pinned?: boolean;
  tags?: string[];
}
