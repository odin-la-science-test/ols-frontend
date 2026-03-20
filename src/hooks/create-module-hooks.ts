import { 
  createModuleKeys,
  useModuleList,
  useModuleItem,
  useModuleSearch,
  useModuleIdentifyByProfile,
  useModuleIdentifyByApiCode,
  type ModuleApi,
} from './use-module-crud';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE MODULE HOOKS - Factory for generating module-specific hooks
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a complete set of React Query hooks for a module with consistent patterns.
 * This factory eliminates code duplication between modules by generating all standard hooks.
 * 
 * @template T - Entity type (e.g., Bacterium, Fungus)
 * @template P - Search parameters type
 * @template PR - Profile type for identification
 * 
 * @param moduleApi - The API instance created with createModuleApi
 * @param moduleName - Unique module name for query keys (e.g., 'bacteria', 'fungi')
 * 
 * @returns Object containing all standard hooks for the module
 * 
 * @example
 * // bacteriology/hooks.ts
 * const hooks = createModuleHooks(bacteriologyApi, 'bacteria');
 * export const useBacteria = hooks.useList;
 * export const useBacterium = hooks.useItem;
 */
export function createModuleHooks<T, P, PR>(
  moduleApi: ModuleApi<T, P, PR>,
  moduleName: string
) {
  const keys = createModuleKeys(moduleName);
  
  return {
    /**
     * Query keys for cache management
     */
    keys,
    
    /**
     * Fetch all entities with optional filters
     */
    useList: (params?: P) => {
      return useModuleList<T, P, PR>(keys, moduleApi, params);
    },
    
    /**
     * Fetch a single entity by ID
     */
    useItem: (id: number | null) => {
      return useModuleItem<T, P, PR>(keys, moduleApi, id);
    },
    
    /**
     * Search entities by query string
     */
    useSearch: (query: string) => {
      return useModuleSearch<T, P, PR>(keys, moduleApi, query);
    },
    
    /**
     * Identify entities by profile (mutation)
     */
    useIdentifyByProfile: () => {
      return useModuleIdentifyByProfile<T, P, PR>(keys, moduleApi);
    },
    
    /**
     * Identify entities by API code (query)
     */
    useIdentifyByApiCode: () => {
      return useModuleIdentifyByApiCode<T, P, PR>(moduleApi);
    },
  };
}
