import { create } from 'zustand';
import { logger } from '@/lib/logger';
import type { HistoryCommand, HistoryScope } from '@/lib/history/types';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY STORE — Undo/Redo command stack, scoped per module
//
// In-memory only (closures are not serializable).
// Each module scope has its own independent history stack.
// ═══════════════════════════════════════════════════════════════════════════

const MAX_ENTRIES = 50;

interface HistoryState {
  scopes: Record<string, HistoryScope>;
  maxEntries: number;

  // Queries
  canUndo: (scope: string) => boolean;
  canRedo: (scope: string) => boolean;
  getScope: (scope: string) => HistoryScope;

  // Actions
  pushCommand: (scope: string, cmd: Omit<HistoryCommand, 'id' | 'timestamp'>) => Promise<void>;
  undo: (scope: string) => Promise<void>;
  redo: (scope: string) => Promise<void>;
  jumpTo: (scope: string, entryId: string) => Promise<void>;
  clearScope: (scope: string) => void;
}

function createEmptyScope(): HistoryScope {
  return { entries: [], pointer: -1 };
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  scopes: {},
  maxEntries: MAX_ENTRIES,

  getScope: (scope) => get().scopes[scope] ?? createEmptyScope(),

  canUndo: (scope) => {
    const s = get().scopes[scope];
    return s ? s.pointer >= 0 : false;
  },

  canRedo: (scope) => {
    const s = get().scopes[scope];
    return s ? s.pointer < s.entries.length - 1 : false;
  },

  pushCommand: async (scope, cmd) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const command: HistoryCommand = { ...cmd, id, timestamp };

    try {
      await command.execute();
    } catch (err) {
      logger.error('[History] execute failed', err);
      return;
    }

    set((state) => {
      const current = state.scopes[scope] ?? createEmptyScope();
      // Truncate redo stack (entries after pointer)
      const entries = current.entries.slice(0, current.pointer + 1);
      entries.push(command);

      // Enforce max entries
      const overflow = entries.length - state.maxEntries;
      if (overflow > 0) {
        entries.splice(0, overflow);
      }

      return {
        scopes: {
          ...state.scopes,
          [scope]: { entries, pointer: entries.length - 1 },
        },
      };
    });
  },

  undo: async (scope) => {
    const s = get().scopes[scope];
    if (!s || s.pointer < 0) return;

    const command = s.entries[s.pointer];
    try {
      await command.undo();
    } catch (err) {
      logger.error('[History] undo failed', err);
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
      await command.execute();
    } catch (err) {
      logger.error('[History] redo failed', err);
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

    if (targetIdx < currentPointer) {
      // Undo from pointer down to targetIdx
      for (let i = currentPointer; i > targetIdx; i--) {
        try {
          await s.entries[i].undo();
        } catch (err) {
          logger.error('[History] jumpTo undo failed', err);
          return;
        }
      }
    } else if (targetIdx > currentPointer) {
      // Redo from pointer+1 up to targetIdx
      for (let i = currentPointer + 1; i <= targetIdx; i++) {
        try {
          await s.entries[i].execute();
        } catch (err) {
          logger.error('[History] jumpTo redo failed', err);
          return;
        }
      }
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

  clearScope: (scope) => {
    set((state) => {
      const newScopes = { ...state.scopes };
      delete newScopes[scope];
      return { scopes: newScopes };
    });
  },
}));
