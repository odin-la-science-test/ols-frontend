import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWorkspaceStore } from '@/stores';
import type { ActiveFilter, SortConfig } from '@/components/modules/types';

// ═══════════════════════════════════════════════════════════════════════════
// USE MODULE PERSISTENCE - Sauvegarde/restauration automatique d'état module
//
// Hook générique typé : chaque layout/module définit son propre type d'état.
// Le store ne fait que persister du JSON — la type safety est ici.
//
// Usage :
//   const { saved, stateRef } = useModulePersistence<NotesState>('notes');
//   saved?.colorFilter  // ← type-safe, autocomplete
// ═══════════════════════════════════════════════════════════════════════════

// ── Types pré-configurés pour les layouts standard ──

/** État persisté par ModulePageTemplate (bacté, myco, support, etc.) */
export interface ModulePageState extends Record<string, unknown> {
  searchQuery?: string;
  activeFilters?: ActiveFilter[];
  sort?: SortConfig;
  selectedItemId?: number | string;
}

/** État persisté par CrudListLayout (notes, contacts, quickshare, etc.) */
export interface CrudListState extends Record<string, unknown> {
  searchQuery?: string;
  selectedItemId?: number | string;
  viewMode?: 'list' | 'create' | 'edit';
  formDraft?: Record<string, unknown>;
}

// ── Hook générique ──

export function useModulePersistence<T extends Record<string, unknown> = Record<string, unknown>>(moduleKey: string) {
  // Lire le contexte sauvegardé une seule fois au mount
  const saved = useMemo(
    () => useWorkspaceStore.getState().getModuleContext(moduleKey) as T | undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // mount only
  );

  // Ref que le layout met à jour en continu avec son état courant
  const stateRef = useRef<Partial<T>>({});

  // Auto-save au unmount
  useEffect(() => {
    return () => {
      useWorkspaceStore.getState().saveModuleContext(moduleKey, stateRef.current);
    };
  }, [moduleKey]);

  // Helper pour restaurer selectedItem depuis ID + data chargées
  const restoredItemId = (saved as Record<string, unknown> | undefined)?.selectedItemId;
  const hasRestoredRef = useRef(false);

  const restoreItem = useCallback(<I extends { id: number }>(
    items: I[] | undefined,
    setItem: (item: I) => void,
    onNotFound?: () => void,
  ) => {
    if (hasRestoredRef.current || !restoredItemId || !items?.length) return;
    hasRestoredRef.current = true;
    const item = items.find((i) => i.id === restoredItemId);
    if (item) setItem(item);
    else onNotFound?.();
  }, [restoredItemId]);

  return { saved, stateRef, restoreItem };
}
