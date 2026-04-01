import { useEffect } from 'react';
import { createModuleHooks } from '@/hooks/create-module-hooks';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { bacteriologyApi } from './api';
import type { Bacterium, BacteriumSearchParams, BiochemicalProfile } from './types';
import { GramOverviewPanel } from './components/gram-overview-panel';
import { BACTERIOLOGY_ACCENT } from './config';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY HOOKS - React Query wrappers + panel registration
// ═══════════════════════════════════════════════════════════════════════════

// Create all standard hooks using the factory
const hooks = createModuleHooks<Bacterium, BacteriumSearchParams, BiochemicalProfile>(
  bacteriologyApi,
  'bacteria'
);

// Export query keys
export const bacteriologyKeys = hooks.keys;

// Export hooks with module-specific names
export const useBacteria = hooks.useList;
export const useBacterium = hooks.useItem;
export const useBacteriaSearch = hooks.useSearch;
export const useIdentifyByProfile = hooks.useIdentifyByProfile;
export const useIdentifyByApiCode = hooks.useIdentifyByApiCode;

// ─── Bottom Panel Registration ──────────────────────────────────────────

const GRAM_OVERVIEW_TAB_ID = 'bacteriology-gram-overview';

/**
 * Registers the "Gram Overview" tab in the bottom panel when the
 * bacteriology module is active. Unregisters on unmount.
 */
export function useBacteriologyPanel() {
  const registerTab = useBottomPanelStore((s) => s.registerTab);
  const unregisterModule = useBottomPanelStore((s) => s.unregisterModule);

  useEffect(() => {
    registerTab({
      id: GRAM_OVERVIEW_TAB_ID,
      labelKey: 'bottomPanel.gramOverview.tab',
      icon: 'bug',
      moduleKey: 'bacteriology',
      accentColor: BACTERIOLOGY_ACCENT,
      component: GramOverviewPanel,
      priority: 5,
    });

    return () => {
      unregisterModule('bacteriology');
    };
  }, [registerTab, unregisterModule]);
}
