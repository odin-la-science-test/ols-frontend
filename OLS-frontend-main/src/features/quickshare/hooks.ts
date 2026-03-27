import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quickShareApi } from './api';
import { useOptimisticMutation } from '@/hooks';
import type { SharedItem, CreateTextShareRequest, CreateFileShareParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const quickShareKeys = {
  all: ['quickshare'] as const,
  myShares: () => [...quickShareKeys.all, 'my-shares'] as const,
  search: (query: string) => [...quickShareKeys.all, 'search', query] as const,
  detail: (id: number) => [...quickShareKeys.all, 'detail', id] as const,
  byCode: (code: string) => [...quickShareKeys.all, 'code', code] as const,
};

/** Mes partages */
export const useMyShares = () => {
  return useQuery({
    queryKey: quickShareKeys.myShares(),
    queryFn: () => quickShareApi.getMyShares().then((res) => res.data),
  });
};

/** Rechercher dans mes partages */
export const useSearchShares = (query: string) => {
  return useQuery({
    queryKey: quickShareKeys.search(query),
    queryFn: () => quickShareApi.search(query).then((res) => res.data),
    enabled: query.length >= 2,
  });
};

/** Détail d'un partage par code */
export const useShareByCode = (code: string) => {
  return useQuery({
    queryKey: quickShareKeys.byCode(code),
    queryFn: () => quickShareApi.getByShareCode(code).then((res) => res.data),
    enabled: !!code,
  });
};

/** Créer un partage texte */
export const useCreateTextShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTextShareRequest) =>
      quickShareApi.createText(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickShareKeys.myShares() });
    },
  });
};

/** Créer un partage fichier */
export const useCreateFileShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateFileShareParams) =>
      quickShareApi.createFile(params).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickShareKeys.myShares() });
    },
  });
};

/** Supprimer un partage (optimistic) */
export const useDeleteShare = () => {
  return useOptimisticMutation<SharedItem, number>({
    mutationFn: async (id) => { await quickShareApi.delete(id); return {} as SharedItem; },
    queryKey: quickShareKeys.myShares(),
    updateCache: (old, id) => (old ?? []).filter((s) => s.id !== id),
  });
};
