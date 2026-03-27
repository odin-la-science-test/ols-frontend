import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistoryStore } from '@/stores/history-store';
import { registry } from '@/lib/module-registry';
import type { HistoryCommand } from '@/lib/history/types';

// ═══════════════════════════════════════════════════════════════════════════
// USE HISTORY — Convenience hook for modules
//
// Auto-resolves the scope from the active route via the module registry.
// Modules should use this hook, never import the store directly.
// ═══════════════════════════════════════════════════════════════════════════

const GLOBAL_SCOPE = '__global__';
const EMPTY_ENTRIES: never[] = [];

interface UseHistoryOptions {
  scope?: string;
}

export function useHistory(options?: UseHistoryOptions) {
  const { pathname } = useLocation();
  const resolvedScope = options?.scope ?? registry.getByRoute(pathname)?.id ?? GLOBAL_SCOPE;

  const scopeState = useHistoryStore((s) => s.scopes[resolvedScope]);
  const entries = scopeState?.entries ?? EMPTY_ENTRIES;
  const pointer = scopeState?.pointer ?? -1;
  const canUndo = pointer >= 0;
  const canRedo = scopeState ? pointer < scopeState.entries.length - 1 : false;

  const pushCommand = useCallback(
    (cmd: Omit<HistoryCommand, 'id' | 'timestamp'>) =>
      useHistoryStore.getState().pushCommand(resolvedScope, cmd),
    [resolvedScope],
  );

  const undo = useCallback(
    () => useHistoryStore.getState().undo(resolvedScope),
    [resolvedScope],
  );

  const redo = useCallback(
    () => useHistoryStore.getState().redo(resolvedScope),
    [resolvedScope],
  );

  const jumpTo = useCallback(
    (entryId: string) => useHistoryStore.getState().jumpTo(resolvedScope, entryId),
    [resolvedScope],
  );

  const clear = useCallback(
    () => useHistoryStore.getState().clearScope(resolvedScope),
    [resolvedScope],
  );

  return useMemo(() => ({
    scope: resolvedScope,
    entries,
    pointer,
    canUndo,
    canRedo,
    pushCommand,
    undo,
    redo,
    jumpTo,
    clear,
  }), [resolvedScope, entries, pointer, canUndo, canRedo, pushCommand, undo, redo, jumpTo, clear]);
}
