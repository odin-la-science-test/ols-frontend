import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC MODULE CRUD HOOKS - Reusable hooks for all modules
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic query keys factory for module CRUD operations
 */
export function createModuleKeys(moduleName: string) {
  return {
    all: [moduleName] as const,
    lists: () => [...createModuleKeys(moduleName).all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...createModuleKeys(moduleName).lists(), params] as const,
    details: () => [...createModuleKeys(moduleName).all, 'detail'] as const,
    detail: (id: number) => [...createModuleKeys(moduleName).details(), id] as const,
    search: (query: string) => [...createModuleKeys(moduleName).all, 'search', query] as const,
    identify: () => [...createModuleKeys(moduleName).all, 'identify'] as const,
  };
}

/**
 * Generic API interface for module operations
 */
export interface ModuleApi<T, TSearchParams, TProfile> {
  getAll: (params?: TSearchParams) => Promise<AxiosResponse<T[]>>;
  getById: (id: number) => Promise<AxiosResponse<T>>;
  search: (query: string) => Promise<AxiosResponse<T[]>>;
  identifyByApiCode: (code: string) => Promise<AxiosResponse<T>>;
  identifyByProfile: (profile: TProfile) => Promise<AxiosResponse<T[]>>;
}

/**
 * Hook to fetch all items with optional filters
 */
export function useModuleList<T, TSearchParams, TProfile = unknown>(
  keys: ReturnType<typeof createModuleKeys>,
  api: ModuleApi<T, TSearchParams, TProfile>,
  params?: TSearchParams
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey: keys.list(params ?? {}),
    queryFn: () => api.getAll(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single item by ID
 */
export function useModuleItem<T, TSearchParams, TProfile = unknown>(
  keys: ReturnType<typeof createModuleKeys>,
  api: ModuleApi<T, TSearchParams, TProfile>,
  id: number | null
): UseQueryResult<T, Error> {
  return useQuery({
    queryKey: keys.detail(id!),
    queryFn: () => api.getById(id!).then((res) => res.data),
    enabled: id !== null,
  });
}

/**
 * Hook to search items by name/query
 */
export function useModuleSearch<T, TSearchParams, TProfile = unknown>(
  keys: ReturnType<typeof createModuleKeys>,
  api: ModuleApi<T, TSearchParams, TProfile>,
  query: string
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey: keys.search(query),
    queryFn: () => api.search(query).then((res) => res.data),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to identify items by profile (mutation)
 */
export function useModuleIdentifyByProfile<T, TSearchParams, TProfile>(
  keys: ReturnType<typeof createModuleKeys>,
  api: ModuleApi<T, TSearchParams, TProfile>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: TProfile) =>
      api.identifyByProfile(profile).then((res) => res.data),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: keys.identify() });
    },
  });
}

/**
 * Hook to identify items by API code
 */
export function useModuleIdentifyByApiCode<T, TSearchParams, TProfile>(
  api: ModuleApi<T, TSearchParams, TProfile>
) {
  return useMutation({
    mutationFn: (code: string) =>
      api.identifyByApiCode(code).then((res) => res.data),
  });
}
