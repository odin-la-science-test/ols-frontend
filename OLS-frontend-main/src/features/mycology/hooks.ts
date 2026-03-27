import { useEffect } from 'react';
import { createModuleHooks } from '@/hooks/create-module-hooks';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { mycologyApi } from './api';
import type { Fungus, FungusSearchParams, FungusProfile } from './types';
import { FungusOverviewPanel } from './components/fungus-overview-panel';
import { MYCOLOGY_ACCENT } from './config';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY HOOKS - React Query wrappers
// ═══════════════════════════════════════════════════════════════════════════

// Create all standard hooks using the factory
const hooks = createModuleHooks<Fungus, FungusSearchParams, FungusProfile>(
  mycologyApi,
  'fungi'
);

// Export query keys
export const mycologyKeys = hooks.keys;

// Export hooks with module-specific names
export const useFungi = hooks.useList;
export const useFungus = hooks.useItem;
export const useFungiSearch = hooks.useSearch;
export const useIdentifyByProfile = hooks.useIdentifyByProfile;
export const useIdentifyByApiCode = hooks.useIdentifyByApiCode;

// ─── Bottom Panel Registration ──────────────────────────────────────────

const FUNGUS_OVERVIEW_TAB_ID = 'mycology-fungus-overview';

/**
 * Registers the "Fungus Overview" tab in the bottom panel when the
 * mycology module is active. Unregisters on unmount.
 */
export function useMycologyPanel() {
  const registerTab = useBottomPanelStore((s) => s.registerTab);
  const unregisterModule = useBottomPanelStore((s) => s.unregisterModule);

  useEffect(() => {
    registerTab({
      id: FUNGUS_OVERVIEW_TAB_ID,
      labelKey: 'bottomPanel.fungusOverview.tab',
      icon: 'leaf',
      moduleKey: 'mycology',
      accentColor: MYCOLOGY_ACCENT,
      component: FungusOverviewPanel,
      priority: 5,
    });

    return () => {
      unregisterModule('mycology');
    };
  }, [registerTab, unregisterModule]);
}
