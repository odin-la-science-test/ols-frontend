import api from '@/api/axios';
import type { SharedItem, CreateTextShareRequest, CreateFileShareParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE API - Endpoints for instant sharing
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/quickshare';

export const quickShareApi = {
  /** Créer un partage de texte */
  createText: (data: CreateTextShareRequest) =>
    api.post<SharedItem>(`${BASE}/text`, data),

  /** Créer un partage de fichier(s) */
  createFile: (params: CreateFileShareParams) => {
    const formData = new FormData();
    for (const file of params.files) {
      formData.append('files', file);
    }
    if (params.title) formData.append('title', params.title);
    if (params.maxDownloads != null) formData.append('maxDownloads', params.maxDownloads.toString());
    if (params.expiresAt) formData.append('expiresAt', params.expiresAt);
    if (params.recipientEmail) formData.append('recipientEmail', params.recipientEmail);
    return api.post<SharedItem>(`${BASE}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Lister mes partages */
  getMyShares: () =>
    api.get<SharedItem[]>(BASE),

  /** Détail d'un partage par ID */
  getById: (id: number) =>
    api.get<SharedItem>(`${BASE}/${id}`),

  /** Accéder à un partage par son code */
  getByShareCode: (code: string) =>
    api.get<SharedItem>(`${BASE}/d/${code}`),

  /** Télécharger un fichier spécifique d'un partage */
  downloadFile: (code: string, fileId: number) =>
    api.get<Blob>(`${BASE}/d/${code}/files/${fileId}/download`, { responseType: 'blob' }),

  /** Télécharger tous les fichiers en ZIP */
  downloadAll: (code: string) =>
    api.get<Blob>(`${BASE}/d/${code}/download-all`, { responseType: 'blob' }),

  /** Supprimer un partage */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),
};
