import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { eventBus } from '@/lib/event-bus';
import { useHistoryStore } from '@/stores/history-store';
import type { CrudModuleApi } from '@/api/module-api-factory';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE CRUD HOOKS - Factory for generating CRUD module hooks
//
// Generates all standard React Query hooks for a CRUD module:
// useList, useDetail, useSearch, useCreate, useUpdate, useDelete,
// useRestore, useBatchDelete, useToggle{Field}, useAdd{SubResource},
// useRemove{SubResource}
// ═══════════════════════════════════════════════════════════════════════════

export interface CrudHooksOptions {
  /** Use optimistic mutations for create/update/delete (default: true) */
  optimistic?: boolean;
  /** EventBus events to emit on CRUD operations */
  events?: {
    created?: string;
    updated?: string;
    deleted?: string;
  };
  /** i18n key for delete error toast */
  deleteErrorKey?: string;
  /** Toggle field names (generates useToggle{Field} hooks) */
  toggles?: string[];
  /** Sub-resource names (generates useAdd{Name}/useRemove{Name} hooks) */
  subResources?: string[];
}

function createKeys(moduleName: string) {
  return {
    all: [moduleName] as const,
    list: () => [...createKeys(moduleName).all, 'list'] as const,
    detail: (id: number) => [...createKeys(moduleName).all, 'detail', id] as const,
    search: (query: string) => [...createKeys(moduleName).all, 'search', query] as const,
  };
}

/**
 * Creates a complete set of React Query hooks for a CRUD module.
 *
 * @example
 * const crud = createCrudHooks<Note, CreateNoteRequest, UpdateNoteRequest>(
 *   notesApi, 'notes', {
 *     optimistic: true,
 *     events: { created: 'notes:created', updated: 'notes:updated', deleted: 'notes:deleted' },
 *     deleteErrorKey: 'notes.deleteError',
 *     toggles: ['pin'],
 *   }
 * );
 * export const { keys: notesKeys, useList: useMyNotes, useDetail: useNoteDetail } = crud;
 */
export function createCrudHooks<T extends { id: number }, TCreate, TUpdate>(
  api: CrudModuleApi<T, TCreate, TUpdate>,
  moduleName: string,
  options: CrudHooksOptions = {},
) {
  const { optimistic = true, events, deleteErrorKey, toggles = [], subResources = [] } = options;
  const keys = createKeys(moduleName);

  /** Refresh history after every mutation so the panel stays in sync.
   *  The @EventListener is synchronous — the history entry is committed
   *  in the same transaction before the HTTP response returns. */
  const refreshHistory = () => {
    useHistoryStore.getState().refreshScope(moduleName);
  };

  // ─── Query hooks ───

  const useList = () =>
    useQuery({
      queryKey: keys.list(),
      queryFn: () => api.getAll().then((res) => res.data),
    });

  const useDetail = (id: number | null) =>
    useQuery({
      queryKey: keys.detail(id!),
      queryFn: () => api.getById(id!).then((res) => res.data),
      enabled: !!id,
    });

  const useSearch = (query: string) =>
    useQuery({
      queryKey: keys.search(query),
      queryFn: () => api.search(query).then((res) => res.data),
      enabled: query.length >= 2,
    });

  // ─── Mutation hooks ───

  const useCreate = () => {
    if (optimistic) {
      return useOptimisticMutation<T, TCreate>({
        mutationFn: async (data) => {
          const result = await api.create(data).then((res) => res.data);
          if (events?.created) eventBus.emit(events.created, { [moduleName.slice(0, -1)]: result });
          return result;
        },
        queryKey: keys.list(),
        updateCache: (old, data) => [
          ...(old ?? []),
          { id: Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as T,
        ],
        onSettled: refreshHistory,
      });
    }
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (data: TCreate) => {
        const result = await api.create(data).then((res) => res.data);
        if (events?.created) eventBus.emit(events.created, { [moduleName.slice(0, -1)]: result });
        return result;
      },
      onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
    });
  };

  const useUpdate = () => {
    if (optimistic) {
      return useOptimisticMutation<T, { id: number; data: TUpdate }>({
        mutationFn: async ({ id, data }) => {
          const result = await api.update(id, data).then((res) => res.data);
          if (events?.updated) eventBus.emit(events.updated, { [moduleName.slice(0, -1)]: result });
          return result;
        },
        queryKey: keys.list(),
        updateCache: (old, { id, data }) =>
          (old ?? []).map((item) =>
            item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item,
          ),
        onSettled: refreshHistory,
      });
    }
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: TUpdate }) => {
        const result = await api.update(id, data).then((res) => res.data);
        if (events?.updated) eventBus.emit(events.updated, { [moduleName.slice(0, -1)]: result });
        return result;
      },
      onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
    });
  };

  const useDelete = () => {
    if (optimistic) {
      return useOptimisticMutation<T, number>({
        mutationFn: async (id) => {
          await api.delete(id);
          if (events?.deleted) eventBus.emit(events.deleted, { id });
          return {} as T;
        },
        queryKey: keys.list(),
        updateCache: (old, id) => (old ?? []).filter((item) => item.id !== id),
        errorMessageKey: deleteErrorKey,
        onSettled: refreshHistory,
      });
    }
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(id);
        if (events?.deleted) eventBus.emit(events.deleted, { id });
      },
      onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
    });
  };

  // ─── Optional hooks ───

  const useRestore = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => api.restore(id).then((res) => res.data),
      onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
    });
  };

  const useBatchDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (ids: number[]) => api.batchDelete(ids),
      onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
    });
  };

  // ─── Toggle hooks ───

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleHooks: Record<string, () => any> = {};
  for (const field of toggles) {
    const hookName = `useToggle${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    const apiMethodName = `toggle${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    toggleHooks[hookName] = () => {
      const queryClient = useQueryClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiFn = (api as any)[apiMethodName];
      return useMutation({
        mutationFn: (id: number) => apiFn(id),
        onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.list() }); refreshHistory(); },
      });
    };
  }

  // ─── Sub-resource hooks ───

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subResourceHooks: Record<string, () => any> = {};
  for (const name of subResources) {
    const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
    const addMethod = `add${capitalName}`;
    const removeMethod = `remove${capitalName}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny = api as any;

    if (apiAny[addMethod]) {
      subResourceHooks[`useAdd${capitalName}`] = () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: ({ parentId, data }: { parentId: number; data: unknown }) =>
            apiAny[addMethod](parentId, data),
          onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.all }); refreshHistory(); },
        });
      };
    }

    if (apiAny[removeMethod]) {
      subResourceHooks[`useRemove${capitalName}`] = () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: ({ parentId, subId }: { parentId: number; subId: number }) =>
            apiAny[removeMethod](parentId, subId),
          onSettled: () => { queryClient.invalidateQueries({ queryKey: keys.all }); refreshHistory(); },
        });
      };
    }
  }

  return {
    keys,
    useList,
    useDetail,
    useSearch,
    useCreate,
    useUpdate,
    useDelete,
    useRestore,
    useBatchDelete,
    ...toggleHooks,
    ...subResourceHooks,
  };
}
