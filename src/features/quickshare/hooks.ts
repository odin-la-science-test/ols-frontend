import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrudHooks } from '@/hooks/create-crud-hooks';
import { quickShareApi, createTextShare, createFileShare, getByShareCode } from './api';
import type { SharedItem, CreateTextShareRequest, CreateFileShareParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE HOOKS - Generated via createCrudHooks factory + custom hooks
// ═══════════════════════════════════════════════════════════════════════════

const crud = createCrudHooks<SharedItem, CreateTextShareRequest, CreateTextShareRequest>(
  quickShareApi, 'quickshare', {
    optimistic: false,
  },
);

// ─── Keys (extend factory keys with custom ones) ───

export const quickShareKeys = {
  ...crud.keys,
  byCode: (code: string) => [...crud.keys.all, 'code', code] as const,
};

// ─── Standard hooks from factory ───

export const useMyShares = crud.useList;
export const useSearchShares = crud.useSearch;
export const useDeleteShare = crud.useDelete;
export const useRestoreShare = crud.useRestore;

// ─── Custom hooks ───

/** Détail d'un partage par code */
export const useShareByCode = (code: string) =>
  useQuery({
    queryKey: quickShareKeys.byCode(code),
    queryFn: () => getByShareCode(code).then((res) => res.data),
    enabled: !!code,
  });

/** Créer un partage texte */
export const useCreateTextShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTextShareRequest) =>
      createTextShare(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickShareKeys.list() });
    },
  });
};

/** Créer un partage fichier */
export const useCreateFileShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateFileShareParams) =>
      createFileShare(params).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickShareKeys.list() });
    },
  });
};
