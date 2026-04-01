import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistoryStore } from '@/stores/history-store';
import { registry } from '@/lib/module-registry';
import type { HistoryCommand } from '@/lib/history/types';

// ═══════════════════════════════════════════════════════════════════════════
// USE HISTORY — Convenience hook for modules (persistent)
//
// Auto-resolves the scope from the active route via the module registry.
// Loads history from backend on mount. No more pushCommand — the backend
// records history automatically via CrudActionEvent.
// ═══════════════════════════════════════════════════════════════════════════

const GLOBAL_SCOPE = '__global__';
const EMPTY_ENTRIES: HistoryCommand[] = [];

interface UseHistoryOptions {
  scope?: string;
}

export function useHistory(options?: UseHistoryOptions) {
  const { pathname } = useLocation();
  const resolvedScope = options?.scope ?? registry.getByRoute(pathname)?.id ?? GLOBAL_SCOPE;

  const scopeState = useHistoryStore((s) => s.scopes[resolvedScope]);
  const entries = scopeState?.entries ?? EMPTY_ENTRIES;
  const pointer = scopeState?.pointer ?? -1;
  const isLoading = scopeState?.isLoading ?? false;
  const canUndo = pointer >= 0;
  const canRedo = scopeState ? pointer < scopeState.entries.length - 1 : false;

  // Load history from backend on mount
  useEffect(() => {
    useHistoryStore.getState().loadScope(resolvedScope);
  }, [resolvedScope]);

  const refreshScope = useCallback(
    () => useHistoryStore.getState().refreshScope(resolvedScope),
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
    (entryId: number) => useHistoryStore.getState().jumpTo(resolvedScope, entryId),
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
    isLoading,
    canUndo,
    canRedo,
    refreshScope,
    undo,
    redo,
    jumpTo,
    clear,
  }), [resolvedScope, entries, pointer, isLoading, canUndo, canRedo, refreshScope, undo, redo, jumpTo, clear]);
}
