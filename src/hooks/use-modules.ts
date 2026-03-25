import { useQuery } from '@tanstack/react-query';
import { modulesApi, type AppModuleDTO, type ModuleType } from '@/api';

// Query keys pour le cache
export const moduleKeys = {
  all: ['modules'] as const,
  byType: (type: ModuleType) => ['modules', type] as const,
  byKey: (key: string) => ['modules', 'detail', key] as const,
};

/**
 * Hook pour récupérer tous les modules
 */
export const useModules = () => {
  return useQuery({
    queryKey: moduleKeys.all,
    queryFn: async () => {
      const response = await modulesApi.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer les modules par type (MUNIN_ATLAS ou HUGIN_LAB)
 */
export const useModulesByType = (type: ModuleType) => {
  return useQuery({
    queryKey: moduleKeys.byType(type),
    queryFn: async () => {
      const response = await modulesApi.getByType(type);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer un module spécifique
 */
export const useModule = (key: string) => {
  return useQuery({
    queryKey: moduleKeys.byKey(key),
    queryFn: async () => {
      const response = await modulesApi.getByKey(key);
      return response.data;
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000,
  });
};

// Types exportés
export type { AppModuleDTO, ModuleType };
