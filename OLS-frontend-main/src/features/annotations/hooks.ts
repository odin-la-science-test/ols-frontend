import { useQuery } from '@tanstack/react-query';
import { annotationsApi } from './api';
import { useOptimisticMutation } from '@/hooks';
import type { Annotation, CreateAnnotationRequest, UpdateAnnotationRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const annotationsKeys = {
  all: ['annotations'] as const,
  myAnnotations: () => [...annotationsKeys.all, 'my-annotations'] as const,
  detail: (id: number) => [...annotationsKeys.all, 'detail', id] as const,
  search: (query: string) => [...annotationsKeys.all, 'search', query] as const,
  entity: (entityType: string, entityId: number) =>
    [...annotationsKeys.all, 'entity', entityType, entityId] as const,
};

/** Mes annotations */
export const useMyAnnotations = () => {
  return useQuery({
    queryKey: annotationsKeys.myAnnotations(),
    queryFn: () => annotationsApi.getMyAnnotations().then((res) => res.data),
  });
};

/** Recherche */
export const useSearchAnnotations = (query: string) => {
  return useQuery({
    queryKey: annotationsKeys.search(query),
    queryFn: () => annotationsApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

/** Annotations pour une entite specifique */
export const useEntityAnnotations = (entityType: string, entityId: number) => {
  return useQuery({
    queryKey: annotationsKeys.entity(entityType, entityId),
    queryFn: () => annotationsApi.getByEntity(entityType, entityId).then((res) => res.data),
    enabled: !!entityType && !!entityId,
  });
};

/** Creer une annotation (optimistic) */
export const useCreateAnnotation = () => {
  return useOptimisticMutation<Annotation, CreateAnnotationRequest>({
    mutationFn: (data) => annotationsApi.create(data).then((res) => res.data),
    queryKey: annotationsKeys.myAnnotations(),
    updateCache: (old, data) => [
      ...(old ?? []),
      { id: Date.now(), ...data, color: data.color ?? 'YELLOW', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ownerName: '' } as Annotation,
    ],
  });
};

/** Mettre a jour une annotation (optimistic) */
export const useUpdateAnnotation = () => {
  return useOptimisticMutation<Annotation, { id: number; data: UpdateAnnotationRequest }>({
    mutationFn: ({ id, data }) => annotationsApi.update(id, data).then((res) => res.data),
    queryKey: annotationsKeys.myAnnotations(),
    updateCache: (old, { id, data }) =>
      (old ?? []).map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)),
  });
};

/** Supprimer une annotation (optimistic) */
export const useDeleteAnnotation = () => {
  return useOptimisticMutation<Annotation, number>({
    mutationFn: async (id) => { await annotationsApi.delete(id); return {} as Annotation; },
    queryKey: annotationsKeys.myAnnotations(),
    updateCache: (old, id) => (old ?? []).filter((a) => a.id !== id),
  });
};
