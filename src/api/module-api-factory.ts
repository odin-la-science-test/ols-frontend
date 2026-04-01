import type { AxiosInstance, AxiosResponse } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE API FACTORY - Generic API creator for all modules
//
// Supports two modes:
// - Browse modules (bacteriology, mycology): getAll, getById, search, identify
// - CRUD modules (contacts, notes): getAll, getById, search, create, update,
//   delete, restore, batchDelete, toggles, sub-resources
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
 * Optional CRUD extensions
 */
export interface ModuleApiRestore<T> {
  restore: (id: number) => Promise<AxiosResponse<T>>;
}

export interface ModuleApiBatchDelete {
  batchDelete: (ids: number[]) => Promise<AxiosResponse<void>>;
}

/**
 * Full module API for science/browse modules
 */
export type ModuleApi<T, TSearchParams, TProfile> =
  ModuleApiBase<T, TSearchParams> & ModuleApiIdentification<T, TProfile>;

/**
 * Full CRUD module API (base + crud + optional extensions)
 */
export type CrudModuleApi<T, TCreate, TUpdate> =
  ModuleApiBase<T, never> &
  ModuleApiCrud<T, TCreate, TUpdate> &
  ModuleApiRestore<T> &
  ModuleApiBatchDelete &
  Record<string, (...args: never[]) => Promise<AxiosResponse<unknown>>>;

// ─── Sub-resource config ───

export interface SubResourceConfig {
  name: string;
  methods: ('add' | 'remove')[];
}

// ─── Options ───

export interface CreateModuleApiOptions {
  /** Search query parameter name (default: 'query') */
  searchParam?: string;
  /** Whether to include identification endpoints */
  identification?: boolean;
  /** Whether to include CRUD endpoints */
  crud?: boolean;
}

export interface CreateCrudApiOptions {
  /** Search query parameter name (default: 'query') */
  searchParam?: string;
  /** Include PATCH /{id}/restore */
  restore?: boolean;
  /** Include DELETE /batch */
  batchDelete?: boolean;
  /** Toggle fields: ['pin', 'favorite'] → PATCH /{id}/{field} */
  toggles?: string[];
  /** Sub-resources: [{name:'items', methods:['add','remove']}] */
  subResources?: SubResourceConfig[];
}

/**
 * Create a module API for science/browse modules (backward compatible).
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

/**
 * Create a CRUD module API with all standard + optional endpoints.
 * Generates: getAll, getById, search, create, update, delete,
 * and optionally: restore, batchDelete, toggles, sub-resources.
 */
export function createCrudApi<T, TCreate, TUpdate>(
  api: AxiosInstance,
  baseUrl: string,
  options: CreateCrudApiOptions = {},
): CrudModuleApi<T, TCreate, TUpdate> {
  const { searchParam = 'query', restore = false, batchDelete = false, toggles = [], subResources = [] } = options;

  // Base CRUD
  const methods: Record<string, (...args: never[]) => Promise<AxiosResponse<unknown>>> = {
    getAll: (params?: unknown) =>
      api.get<T[]>(baseUrl, { params: params as Record<string, unknown> }),

    getById: (id: number) =>
      api.get<T>(`${baseUrl}/${id}`),

    search: (query: string) =>
      api.get<T[]>(`${baseUrl}/search`, { params: { [searchParam]: query } }),

    create: (data: TCreate) =>
      api.post<T>(baseUrl, data),

    update: (id: number, data: TUpdate) =>
      api.put<T>(`${baseUrl}/${id}`, data),

    delete: (id: number) =>
      api.delete<void>(`${baseUrl}/${id}`),
  };

  // Optional: restore
  if (restore) {
    methods.restore = (id: number) =>
      api.patch<T>(`${baseUrl}/${id}/restore`);
  }

  // Optional: batch delete
  if (batchDelete) {
    methods.batchDelete = (ids: number[]) =>
      api.delete<void>(`${baseUrl}/batch`, { data: { ids } });
  }

  // Optional: toggles (PATCH /{id}/{field})
  for (const field of toggles) {
    const name = `toggle${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    methods[name] = (id: number) =>
      api.patch<T>(`${baseUrl}/${id}/${field}`);
  }

  // Optional: sub-resources
  for (const sub of subResources) {
    const capitalName = sub.name.charAt(0).toUpperCase() + sub.name.slice(1);
    if (sub.methods.includes('add')) {
      methods[`add${capitalName}`] = (parentId: number, data: unknown) =>
        api.post(`${baseUrl}/${parentId}/${sub.name}`, data);
    }
    if (sub.methods.includes('remove')) {
      methods[`remove${capitalName}`] = (parentId: number, subId: number) =>
        api.delete(`${baseUrl}/${parentId}/${sub.name}/${subId}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return methods as any;
}
