import api from '@/api/axios';
import type { Annotation, CreateAnnotationRequest, UpdateAnnotationRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS API - Endpoints for annotations module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/annotations';

export const annotationsApi = {
  /** Creer une annotation */
  create: (data: CreateAnnotationRequest) =>
    api.post<Annotation>(BASE, data),

  /** Lister mes annotations */
  getMyAnnotations: () =>
    api.get<Annotation[]>(BASE),

  /** Detail d'une annotation par ID */
  getById: (id: number) =>
    api.get<Annotation>(`${BASE}/${id}`),

  /** Mettre a jour une annotation */
  update: (id: number, data: UpdateAnnotationRequest) =>
    api.put<Annotation>(`${BASE}/${id}`, data),

  /** Supprimer une annotation */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  /** Rechercher dans mes annotations */
  search: (query: string) =>
    api.get<Annotation[]>(`${BASE}/search`, { params: { query } }),

  /** Annotations pour une entite specifique */
  getByEntity: (entityType: string, entityId: number) =>
    api.get<Annotation[]>(`${BASE}/entity/${entityType}/${entityId}`),
};
