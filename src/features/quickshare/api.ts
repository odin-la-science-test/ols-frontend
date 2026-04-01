import api from '@/api/axios';
import { createCrudApi } from '@/api/module-api-factory';
import type { SharedItem, CreateTextShareRequest, CreateFileShareParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE API - Generated via createCrudApi factory + custom endpoints
// ═══════════════════════════════════════════════════════════════════════════

export const quickShareApi = createCrudApi<SharedItem, CreateTextShareRequest, CreateTextShareRequest>(
  api, '/quickshare', {
    restore: true,
  },
);

// ─── Custom endpoints not covered by factory ───

/** Créer un partage de texte */
export const createTextShare = (data: CreateTextShareRequest) =>
  api.post<SharedItem>('/quickshare/text', data);

/** Créer un partage de fichier(s) */
export const createFileShare = (params: CreateFileShareParams) => {
  const formData = new FormData();
  for (const file of params.files) {
    formData.append('files', file);
  }
  if (params.title) formData.append('title', params.title);
  if (params.maxDownloads != null) formData.append('maxDownloads', params.maxDownloads.toString());
  if (params.expiresAt) formData.append('expiresAt', params.expiresAt);
  if (params.recipientEmail) formData.append('recipientEmail', params.recipientEmail);
  return api.post<SharedItem>('/quickshare/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** Accéder à un partage par son code */
export const getByShareCode = (code: string) =>
  api.get<SharedItem>(`/quickshare/d/${code}`);

/** Télécharger un fichier spécifique d'un partage */
export const downloadFile = (code: string, fileId: number) =>
  api.get<Blob>(`/quickshare/d/${code}/files/${fileId}/download`, { responseType: 'blob' });

/** Télécharger tous les fichiers en ZIP */
export const downloadAll = (code: string) =>
  api.get<Blob>(`/quickshare/d/${code}/download-all`, { responseType: 'blob' });
