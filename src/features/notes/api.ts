import api from '@/api/axios';
import type { Note, CreateNoteRequest, UpdateNoteRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES API - Endpoints for lab notebook
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/notes';

export const notesApi = {
  /** Créer une note */
  create: (data: CreateNoteRequest) =>
    api.post<Note>(`${BASE}`, data),

  /** Lister mes notes */
  getMyNotes: () =>
    api.get<Note[]>(BASE),

  /** Détail d'une note par ID */
  getById: (id: number) =>
    api.get<Note>(`${BASE}/${id}`),

  /** Mettre à jour une note */
  update: (id: number, data: UpdateNoteRequest) =>
    api.put<Note>(`${BASE}/${id}`, data),

  /** Supprimer une note */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  /** Toggle pin */
  togglePin: (id: number) =>
    api.patch<Note>(`${BASE}/${id}/pin`),

  /** Rechercher dans mes notes */
  search: (query: string) =>
    api.get<Note[]>(`${BASE}/search`, { params: { query } }),

  /** Rechercher par tag (prefix match) */
  searchByTag: (tag: string) =>
    api.get<Note[]>(`${BASE}/search/tags`, { params: { query: tag } }),
};
