import { create } from 'zustand';
import { logger } from '@/lib/logger';
import { resolveCommand } from '@/lib/history/command-resolver';
import { fetchHistory, clearHistory } from '@/lib/history/history-api';
import type { HistoryCommand, HistoryScope, HistoryEntryDTO } from '@/lib/history/types';
import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import i18n from '@/i18n';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY STORE — Persistent undo/redo, backed by the backend
//
// Entries are loaded from the backend API and stored locally.
// Undo/redo uses the CommandResolver to reconstruct API calls.
// The backend records history automatically via CrudActionEvent.
// ═══════════════════════════════════════════════════════════════════════════

// Singleton QueryClient reference — set by the app on init
let queryClientRef: QueryClient | null = null;

export function setHistoryQueryClient(qc: QueryClient) {
  queryClientRef = qc;
}

function getQueryClient(): QueryClient {
  if (!queryClientRef) throw new Error('History store: QueryClient not initialized. Call setHistoryQueryClient() first.');
  return queryClientRef;
}

function dtoToCommand(dto: HistoryEntryDTO): HistoryCommand {
  return {
    id: dto.id,
    labelKey: dto.labelKey,
    icon: dto.icon,
    timestamp: new Date(dto.createdAt).getTime(),
    descriptor: {
      actionType: dto.actionType,
      moduleSlug: dto.moduleSlug,
      entityId: dto.entityId,
      previousData: dto.previousData ? JSON.parse(dto.previousData) : undefined,
      newData: dto.newData ? JSON.parse(dto.newData) : undefined,
    },
  };
}

interface HistoryState {
  scopes: Record<string, HistoryScope>;

  // Queries
  canUndo: (scope: string) => boolean;
  canRedo: (scope: string) => boolean;
  getScope: (scope: string) => HistoryScope;

  // Actions
  loadScope: (scope: string) => Promise<void>;
  refreshScope: (scope: string) => Promise<void>;
  undo: (scope: string) => Promise<void>;
  redo: (scope: string) => Promise<void>;
  jumpTo: (scope: string, entryId: number) => Promise<void>;
  clearScope: (scope: string) => Promise<void>;
}

function createEmptyScope(): HistoryScope {
  return { entries: [], pointer: -1, isLoading: false };
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  scopes: {},

  getScope: (scope) => get().scopes[scope] ?? createEmptyScope(),

  canUndo: (scope) => {
    const s = get().scopes[scope];
    return s ? s.pointer >= 0 : false;
  },

  canRedo: (scope) => {
    const s = get().scopes[scope];
    return s ? s.pointer < s.entries.length - 1 : false;
  },

  loadScope: async (scope) => {
    const current = get().scopes[scope];
    if (current?.isLoading) return;

    set((state) => ({
      scopes: {
        ...state.scopes,
        [scope]: { ...(state.scopes[scope] ?? createEmptyScope()), isLoading: true },
      },
    }));

    try {
      const dtos = await fetchHistory(scope);
      const entries = dtos.map(dtoToCommand);

      set((state) => ({
        scopes: {
          ...state.scopes,
          [scope]: { entries, pointer: entries.length - 1, isLoading: false },
        },
      }));
    } catch (err) {
      logger.error('[History] loadScope failed', err);
      set((state) => ({
        scopes: {
          ...state.scopes,
          [scope]: { ...(state.scopes[scope] ?? createEmptyScope()), isLoading: false },
        },
      }));
    }
  },

  refreshScope: async (scope) => {
    try {
      const dtos = await fetchHistory(scope);
      const entries = dtos.map(dtoToCommand);

      set((state) => ({
        scopes: {
          ...state.scopes,
          [scope]: { entries, pointer: entries.length - 1, isLoading: false },
        },
      }));
    } catch (err) {
      logger.error('[History] refreshScope failed', err);
    }
  },

  undo: async (scope) => {
    const s = get().scopes[scope];
    if (!s || s.pointer < 0) return;

    const command = s.entries[s.pointer];
    try {
      const resolved = resolveCommand(command.descriptor, getQueryClient());
      await resolved.undo();
    } catch (err) {
      logger.error('[History] undo failed', err);
      toast({ title: i18n.t('history.undoFailed'), variant: 'destructive' });
      return;
    }

    set((state) => {
      const current = state.scopes[scope];
      if (!current) return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: { ...current, pointer: current.pointer - 1 },
        },
      };
    });
  },

  redo: async (scope) => {
    const s = get().scopes[scope];
    if (!s || s.pointer >= s.entries.length - 1) return;

    const command = s.entries[s.pointer + 1];
    try {
      const resolved = resolveCommand(command.descriptor, getQueryClient());
      await resolved.execute();
    } catch (err) {
      logger.error('[History] redo failed', err);
      toast({ title: i18n.t('history.redoFailed'), variant: 'destructive' });
      return;
    }

    set((state) => {
      const current = state.scopes[scope];
      if (!current) return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: { ...current, pointer: current.pointer + 1 },
        },
      };
    });
  },

  jumpTo: async (scope, entryId) => {
    const s = get().scopes[scope];
    if (!s) return;

    const targetIdx = s.entries.findIndex((e) => e.id === entryId);
    if (targetIdx === -1) return;

    const currentPointer = s.pointer;
    const qc = getQueryClient();
    let hasFailure = false;

    if (targetIdx < currentPointer) {
      for (let i = currentPointer; i > targetIdx; i--) {
        try {
          const resolved = resolveCommand(s.entries[i].descriptor, qc);
          await resolved.undo();
        } catch (err) {
          logger.warn('[History] jumpTo undo step skipped (entry %d)', s.entries[i].id, err);
          hasFailure = true;
          // Continue to next step instead of stopping
        }
      }
    } else if (targetIdx > currentPointer) {
      for (let i = currentPointer + 1; i <= targetIdx; i++) {
        try {
          const resolved = resolveCommand(s.entries[i].descriptor, qc);
          await resolved.execute();
        } catch (err) {
          logger.warn('[History] jumpTo redo step skipped (entry %d)', s.entries[i].id, err);
          hasFailure = true;
          // Continue to next step instead of stopping
        }
      }
    }

    if (hasFailure) {
      toast({ title: i18n.t('history.jumpToFailed'), variant: 'destructive' });
    }

    set((state) => {
      const current = state.scopes[scope];
      if (!current) return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: { ...current, pointer: targetIdx },
        },
      };
    });
  },

  clearScope: async (scope) => {
    try {
      await clearHistory(scope);
    } catch (err) {
      logger.error('[History] clearScope backend failed', err);
    }

    set((state) => {
      const newScopes = { ...state.scopes };
      delete newScopes[scope];
      return { scopes: newScopes };
    });
  },
}));
