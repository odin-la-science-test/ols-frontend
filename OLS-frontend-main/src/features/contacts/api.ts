import api from '@/api/axios';
import type { Contact, CreateContactRequest, UpdateContactRequest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS API - Endpoints for contacts module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/contacts';

export const contactsApi = {
  /** Créer un contact */
  create: (data: CreateContactRequest) =>
    api.post<Contact>(BASE, data),

  /** Lister mes contacts */
  getMyContacts: () =>
    api.get<Contact[]>(BASE),

  /** Détail d'un contact par ID */
  getById: (id: number) =>
    api.get<Contact>(`${BASE}/${id}`),

  /** Mettre à jour un contact */
  update: (id: number, data: UpdateContactRequest) =>
    api.put<Contact>(`${BASE}/${id}`, data),

  /** Supprimer un contact */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),

  /** Supprimer plusieurs contacts */
  batchDelete: (ids: number[]) =>
    api.delete(`${BASE}/batch`, { data: { ids } }),

  /** Toggle favori */
  toggleFavorite: (id: number) =>
    api.patch<Contact>(`${BASE}/${id}/favorite`),

  /** Restaurer un contact supprimé (undo soft delete) */
  restore: (id: number) =>
    api.patch<Contact>(`${BASE}/${id}/restore`),

  /** Rechercher dans mes contacts */
  search: (query: string) =>
    api.get<Contact[]>(`${BASE}/search`, { params: { query } }),
};
