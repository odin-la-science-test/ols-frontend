import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quickShareApi } from './api';
import type { CreateTextShareRequest, CreateFileShareParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE HOOKS - TanStack Query hooks
// ═══════════════════════════════════════════════════════════════════════════

export const quickShareKeys = {
  all: ['quickshare'] as const,
  myShares: () => [...quickShareKeys.all, 'my-shares'] as const,
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

/** Supprimer un partage */
export const useDeleteShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => quickShareApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickShareKeys.myShares() });
    },
  });
};
