import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type { Annotation, CreateAnnotationRequest, UpdateAnnotationRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS API - Generated via createCrudApi factory
// ═══════════════════════════════════════════════════════════════════════════

export const annotationsApi = createCrudApi<Annotation, CreateAnnotationRequest, UpdateAnnotationRequest>(
  api, '/annotations', {
    restore: true,
  },
);

/** Annotations pour une entite specifique (custom, hors factory) */
export const getByEntity = (entityType: string, entityId: number) =>
  api.get<Annotation[]>(`/annotations/entity/${entityType}/${entityId}`);
