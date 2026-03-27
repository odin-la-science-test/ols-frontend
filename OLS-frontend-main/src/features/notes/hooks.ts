import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import { useOptimisticMutation } from '@/hooks';
import { eventBus } from '@/lib/event-bus';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const notesKeys = {
  all: ['notes'] as const,
  myNotes: () => [...notesKeys.all, 'my-notes'] as const,
  detail: (id: number) => [...notesKeys.all, 'detail', id] as const,
  search: (query: string) => [...notesKeys.all, 'search', query] as const,
};

/** Mes notes */
export const useMyNotes = () => {
  return useQuery({
    queryKey: notesKeys.myNotes(),
    queryFn: () => notesApi.getMyNotes().then((res) => res.data),
  });
};

/** Détail d'une note */
export const useNoteDetail = (id: number) => {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: () => notesApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

/** Recherche */
export const useSearchNotes = (query: string) => {
  return useQuery({
    queryKey: notesKeys.search(query),
    queryFn: () => notesApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

/** Créer une note (optimistic) */
export const useCreateNote = () => {
  return useOptimisticMutation<Note, CreateNoteRequest>({
    mutationFn: async (data) => {
      const note = await notesApi.create(data).then((res) => res.data);
      eventBus.emit('notes:created', { note });
      return note;
    },
    queryKey: notesKeys.myNotes(),
    updateCache: (old, data) => [
      ...(old ?? []),
      { id: Date.now(), title: data.title, content: data.content ?? null, color: data.color ?? null, pinned: data.pinned ?? false, tags: data.tags ?? [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ownerName: '' } as Note,
    ],
  });
};

/** Mettre à jour une note (optimistic) */
export const useUpdateNote = () => {
  return useOptimisticMutation<Note, { id: number; data: UpdateNoteRequest }>({
    mutationFn: async ({ id, data }) => {
      const note = await notesApi.update(id, data).then((res) => res.data);
      eventBus.emit('notes:updated', { note });
      return note;
    },
    queryKey: notesKeys.myNotes(),
    updateCache: (old, { id, data }) =>
      (old ?? []).map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)),
  });
};

/** Supprimer une note (optimistic) */
export const useDeleteNote = () => {
  return useOptimisticMutation<Note, number>({
    mutationFn: async (id) => {
      await notesApi.delete(id);
      eventBus.emit('notes:deleted', { id });
      return {} as Note;
    },
    queryKey: notesKeys.myNotes(),
    updateCache: (old, id) => (old ?? []).filter((n) => n.id !== id),
    errorMessageKey: 'notes.deleteError',
  });
};

/** Restaurer une note supprimée */
export const useRestoreNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesApi.restore(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.myNotes() });
    },
  });
};

/** Supprimer plusieurs notes */
export const useBatchDeleteNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      notesApi.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.myNotes() });
    },
  });
};

/** Toggle pin */
export const useTogglePin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesApi.togglePin(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.myNotes() });
    },
  });
};
