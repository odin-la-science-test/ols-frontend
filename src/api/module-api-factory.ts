import type { AxiosInstance, AxiosResponse } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE API FACTORY - Generic API creator for all modules
//
// Supports two modes:
// - Browse modules (bacteriology, mycology): getAll, getById, search, identify
// - CRUD modules (contacts, notes): getAll, getById, search, create, update, delete
// Both modes are opt-in via the options parameter.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base API interface — all modules get these
 */
export interface ModuleApiBase<T, TSearchParams> {
  getAll: (params?: TSearchParams) => Promise<AxiosResponse<T[]>>;
  getById: (id: number) => Promise<AxiosResponse<T>>;
  search: (query: string) => Promise<AxiosResponse<T[]>>;
}

/**
 * Identification endpoints (science modules)
 */
export interface ModuleApiIdentification<T, TProfile> {
  identifyByApiCode: (code: string) => Promise<AxiosResponse<T>>;
  identifyByProfile: (profile: TProfile) => Promise<AxiosResponse<T[]>>;
}

/**
 * CRUD endpoints (contacts, notes, etc.)
 */
export interface ModuleApiCrud<T, TCreate, TUpdate> {
  create: (data: TCreate) => Promise<AxiosResponse<T>>;
  update: (id: number, data: TUpdate) => Promise<AxiosResponse<T>>;
  delete: (id: number) => Promise<AxiosResponse<void>>;
}

/**
 * Full module API for science/browse modules
 */
export type ModuleApi<T, TSearchParams, TProfile> =
  ModuleApiBase<T, TSearchParams> & ModuleApiIdentification<T, TProfile>;

/**
 * Options for createModuleApi
 */
export interface CreateModuleApiOptions {
  /** Search query parameter name (default: 'query') */
  searchParam?: string;
  /** Whether to include identification endpoints */
  identification?: boolean;
  /** Whether to include CRUD endpoints */
  crud?: boolean;
}

/**
 * Create a module API with standard operations.
 * By default, includes browse operations (getAll, getById, search).
 * Pass options to add identification or CRUD endpoints.
 */
export function createModuleApi<
  T,
  TSearchParams = Record<string, unknown>,
  TProfile = Record<string, unknown>,
  TCreate = Record<string, unknown>,
  TUpdate = Record<string, unknown>,
>(
  api: AxiosInstance,
  baseUrl: string,
  options: CreateModuleApiOptions = {},
): ModuleApiBase<T, TSearchParams>
  & ModuleApiIdentification<T, TProfile>
  & Partial<ModuleApiCrud<T, TCreate, TUpdate>> {
  // By default, identification endpoints are always included (backward compatible).
  // Pass identification: false to exclude them.
  const { searchParam = 'query', identification = true, crud = false } = options;

  const base: ModuleApiBase<T, TSearchParams> = {
    getAll: (params?: TSearchParams) =>
      api.get<T[]>(baseUrl, { params }),

    getById: (id: number) =>
      api.get<T>(`${baseUrl}/${id}`),

    search: (query: string) =>
      api.get<T[]>(`${baseUrl}/search`, { params: { [searchParam]: query } }),
  };

  const identificationMethods = identification ? {
    identifyByApiCode: (code: string) =>
      api.get<T>(`${baseUrl}/identify/api/${code}`),

    identifyByProfile: (profile: TProfile) =>
      api.post<T[]>(`${baseUrl}/identify`, profile),
  } : {};

  const crudMethods = crud ? {
    create: (data: TCreate) =>
      api.post<T>(baseUrl, data),

    update: (id: number, data: TUpdate) =>
      api.put<T>(`${baseUrl}/${id}`, data),

    delete: (id: number) =>
      api.delete<void>(`${baseUrl}/${id}`),
  } : {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...base, ...identificationMethods, ...crudMethods } as any;
}
