import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyCollectionsApi } from './api';
import { useOptimisticMutation } from '@/hooks';
import type { StudyCollection, CreateStudyCollectionRequest, UpdateStudyCollectionRequest, AddItemRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const studyCollectionsKeys = {
  all: ['study-collections'] as const,
  myCollections: () => [...studyCollectionsKeys.all, 'my-collections'] as const,
  detail: (id: number) => [...studyCollectionsKeys.all, 'detail', id] as const,
  search: (query: string) => [...studyCollectionsKeys.all, 'search', query] as const,
};

/** Mes collections */
export const useMyCollections = () => {
  return useQuery({
    queryKey: studyCollectionsKeys.myCollections(),
    queryFn: () => studyCollectionsApi.getMyCollections().then((res) => res.data),
  });
};

/** Détail d'une collection */
export const useCollectionDetail = (id: number) => {
  return useQuery({
    queryKey: studyCollectionsKeys.detail(id),
    queryFn: () => studyCollectionsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

/** Recherche */
export const useSearchCollections = (query: string) => {
  return useQuery({
    queryKey: studyCollectionsKeys.search(query),
    queryFn: () => studyCollectionsApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

/** Créer une collection (optimistic) */
export const useCreateCollection = () => {
  return useOptimisticMutation<StudyCollection, CreateStudyCollectionRequest>({
    mutationFn: (data) => studyCollectionsApi.create(data).then((res) => res.data),
    queryKey: studyCollectionsKeys.myCollections(),
    updateCache: (old, data) => [
      ...(old ?? []),
      { id: Date.now(), name: data.name, description: data.description ?? '', ownerName: '', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as StudyCollection,
    ],
  });
};

/** Mettre à jour une collection (optimistic) */
export const useUpdateCollection = () => {
  return useOptimisticMutation<StudyCollection, { id: number; data: UpdateStudyCollectionRequest }>({
    mutationFn: ({ id, data }) => studyCollectionsApi.update(id, data).then((res) => res.data),
    queryKey: studyCollectionsKeys.myCollections(),
    updateCache: (old, { id, data }) =>
      (old ?? []).map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)),
  });
};

/** Supprimer une collection (optimistic) */
export const useDeleteCollection = () => {
  return useOptimisticMutation<StudyCollection, number>({
    mutationFn: async (id) => { await studyCollectionsApi.delete(id); return {} as StudyCollection; },
    queryKey: studyCollectionsKeys.myCollections(),
    updateCache: (old, id) => (old ?? []).filter((c) => c.id !== id),
  });
};

/** Ajouter un item */
export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, data }: { collectionId: number; data: AddItemRequest }) =>
      studyCollectionsApi.addItem(collectionId, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyCollectionsKeys.all });
    },
  });
};

/** Retirer un item */
export const useRemoveItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: number; itemId: number }) =>
      studyCollectionsApi.removeItem(collectionId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyCollectionsKeys.all });
    },
  });
};
