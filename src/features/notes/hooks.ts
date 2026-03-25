import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import type { CreateNoteRequest, UpdateNoteRequest } from './types';

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

/** Créer une note */
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteRequest) =>
      notesApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.myNotes() });
    },
  });
};

/** Mettre à jour une note */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNoteRequest }) =>
      notesApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.myNotes() });
    },
  });
};

/** Supprimer une note */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
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
