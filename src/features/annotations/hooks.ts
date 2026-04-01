import { useQuery } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { annotationsApi, getByEntity } from './api';
import type { Annotation, CreateAnnotationRequest, UpdateAnnotationRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS HOOKS - Generated via createCrudHooks factory
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<Annotation, CreateAnnotationRequest, UpdateAnnotationRequest>(
  annotationsApi, 'annotations', {
    optimistic: true,
  },
);

export const annotationsKeys = {
  ...crud.keys,
  entity: (entityType: string, entityId: number) =>
    [...crud.keys.all, 'entity', entityType, entityId] as const,
};
export const useMyAnnotations = crud.useList;
export const useSearchAnnotations = crud.useSearch;
export const useCreateAnnotation = crud.useCreate;
export const useUpdateAnnotation = crud.useUpdate;
export const useDeleteAnnotation = crud.useDelete;
export const useRestoreAnnotation = crud.useRestore;
export const useAnnotationDetail = crud.useDetail;

/** Annotations pour une entite specifique (custom, hors factory) */
export const useEntityAnnotations = (entityType: string, entityId: number) =>
  useQuery({
    queryKey: annotationsKeys.entity(entityType, entityId),
    queryFn: () => getByEntity(entityType, entityId).then((res) => res.data),
    enabled: !!entityType && !!entityId,
  });
