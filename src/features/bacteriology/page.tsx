'use client';

import { createModulePage } from '@/lib/create-module-page';
import { BacteriumDetail, IdentificationTools } from './components';
import { useBacteria, useBacteriaSearch, useBacteriologyPanel } from './hooks';
import { 
  BACTERIOLOGY_ACCENT, 
  getBacteriaFilters,
  computeBacteriaStats,
  getBacteriaColumns,
  getBacteriaExportColumns,
  getBacteriaCardConfig
} from './config';
import type { Bacterium, BacteriumSearchParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY PAGE - Main module page
// ═══════════════════════════════════════════════════════════════════════════

const BacteriologyPageBase = createModulePage<Bacterium, BacteriumSearchParams>({
  translations: (t) => ({
    title: t('bacteriology.title'),
    searchPlaceholder: t('common.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('modules.emptyTitle'),
    emptyDatabase: t('modules.emptyDatabase'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  accentColor: BACTERIOLOGY_ACCENT,
  iconName: 'bug',
  useData: useBacteria,
  useSearch: useBacteriaSearch,
  filters: getBacteriaFilters,
  getColumns: getBacteriaColumns,
  computeStats: computeBacteriaStats,
  getExportColumns: getBacteriaExportColumns,
  getCardConfig: getBacteriaCardConfig,
  IdentificationToolsComponent: IdentificationTools,
  DetailComponent: BacteriumDetail,
  detailItemKey: 'bacterium',
});

/** Bacteriology page with contextual bottom panel tab registration */
export function BacteriologyPage() {
  // Register the "Gram Overview" tab in the bottom panel while this module is active
  useBacteriologyPanel();

  return <BacteriologyPageBase />;
}
