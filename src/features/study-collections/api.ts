import api from '@/api/axios';
import type {
  StudyCollection,
  CreateStudyCollectionRequest,
  UpdateStudyCollectionRequest,
  AddItemRequest,
  StudyCollectionItem,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS API - Endpoints for study collections module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/study-collections';

export const studyCollectionsApi = {
  /** Créer une collection */
  create: (data: CreateStudyCollectionRequest) =>
    api.post<StudyCollection>(BASE, data),

  /** Lister mes collections */
  getMyCollections: () =>
    api.get<StudyCollection[]>(BASE),

  /** Détail d'une collection par ID */
  getById: (id: number) =>
    api.get<StudyCollection>(`${BASE}/${id}`),

  /** Mettre à jour une collection */
  update: (id: number, data: UpdateStudyCollectionRequest) =>
    api.put<StudyCollection>(`${BASE}/${id}`, data),

  /** Supprimer une collection */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  /** Rechercher dans mes collections */
  search: (query: string) =>
    api.get<StudyCollection[]>(`${BASE}/search`, { params: { query } }),

  /** Ajouter un item à une collection */
  addItem: (collectionId: number, data: AddItemRequest) =>
    api.post<StudyCollectionItem>(`${BASE}/${collectionId}/items`, data),

  /** Retirer un item d'une collection */
  removeItem: (collectionId: number, itemId: number) =>
    api.delete(`${BASE}/${collectionId}/items/${itemId}`),
};
