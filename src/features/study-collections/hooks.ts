import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { studyCollectionsApi } from './api';
import type { StudyCollection, CreateStudyCollectionRequest, UpdateStudyCollectionRequest, AddItemRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS HOOKS - Generated via createCrudHooks factory
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<StudyCollection, CreateStudyCollectionRequest, UpdateStudyCollectionRequest>(
  studyCollectionsApi, 'study-collections', {
    optimistic: true,
    subResources: ['items'],
  },
);

export const studyCollectionsKeys = crud.keys;
export const useMyCollections = crud.useList;
export const useCollectionDetail = crud.useDetail;
export const useSearchCollections = crud.useSearch;
export const useCreateCollection = crud.useCreate;
export const useUpdateCollection = crud.useUpdate;
export const useDeleteCollection = crud.useDelete;
export const useRestoreCollection = crud.useRestore;

/** Ajouter un item a une collection */
export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, data }: { collectionId: number; data: AddItemRequest }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (studyCollectionsApi as any).addItems(collectionId, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: studyCollectionsKeys.all }),
  });
};

/** Retirer un item d'une collection */
export const useRemoveItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: number; itemId: number }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (studyCollectionsApi as any).removeItems(collectionId, itemId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: studyCollectionsKeys.all }),
  });
};
