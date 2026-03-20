import type { AxiosInstance, AxiosResponse } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE API FACTORY - Generic API creator for all modules
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic module API interface
 */
export interface ModuleApi<T, TSearchParams, TProfile> {
  getAll: (params?: TSearchParams) => Promise<AxiosResponse<T[]>>;
  getById: (id: number) => Promise<AxiosResponse<T>>;
  search: (query: string) => Promise<AxiosResponse<T[]>>;
  identifyByApiCode: (code: string) => Promise<AxiosResponse<T>>;
  identifyByProfile: (profile: TProfile) => Promise<AxiosResponse<T[]>>;
}

/**
 * Create a module API with all CRUD operations
 * 
 * @param api - Axios instance
 * @param baseUrl - Base URL for the module (e.g., '/bacteria', '/fungi')
 * @returns Module API with all standard operations
 */
export function createModuleApi<T, TSearchParams = Record<string, unknown>, TProfile = Record<string, unknown>>(
  api: AxiosInstance,
  baseUrl: string
): ModuleApi<T, TSearchParams, TProfile> {
  return {
    /**
     * Get all items with optional pagination/filters
     */
    getAll: (params?: TSearchParams) =>
      api.get<T[]>(baseUrl, { params }),

    /**
     * Get a single item by ID
     */
    getById: (id: number) =>
      api.get<T>(`${baseUrl}/${id}`),

    /**
     * Search items by species name or query
     */
    search: (query: string) =>
      api.get<T[]>(`${baseUrl}/search`, { params: { query } }),

    /**
     * Identify by API code (e.g., "5144572", "SAC001")
     */
    identifyByApiCode: (code: string) =>
      api.get<T>(`${baseUrl}/identify/api/${code}`),

    /**
     * Identify by profile (biochemical, mycological, etc.)
     */
    identifyByProfile: (profile: TProfile) =>
      api.post<T[]>(`${baseUrl}/identify`, profile),
  };
}
