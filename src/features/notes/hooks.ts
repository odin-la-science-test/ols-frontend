import { useQuery } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { notesApi, searchByTag } from './api';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES HOOKS - Generated via createCrudHooks factory
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<Note, CreateNoteRequest, UpdateNoteRequest>(
  notesApi, 'notes', {
    optimistic: true,
    events: { created: 'notes:created', updated: 'notes:updated', deleted: 'notes:deleted' },
    deleteErrorKey: 'notes.deleteError',
    toggles: ['pin'],
  },
);

export const notesKeys = crud.keys;
export const useMyNotes = crud.useList;
export const useNoteDetail = crud.useDetail;
export const useSearchNotes = crud.useSearch;
export const useCreateNote = crud.useCreate;
export const useUpdateNote = crud.useUpdate;
export const useDeleteNote = crud.useDelete;
export const useRestoreNote = crud.useRestore;
export const useBatchDeleteNotes = crud.useBatchDelete;
export const useTogglePin = (crud as Record<string, unknown>).useTogglePin as () => ReturnType<typeof import('@tanstack/react-query').useMutation>;

/** Recherche par tag (custom, hors factory) */
export const useSearchByTag = (tag: string) =>
  useQuery({
    queryKey: [...notesKeys.all, 'tag', tag] as const,
    queryFn: () => searchByTag(tag).then((res) => res.data),
    enabled: tag.length >= 2,
  });
