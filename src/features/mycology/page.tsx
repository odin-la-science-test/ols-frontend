'use client';

import { createModulePage } from '@/lib/create-module-page';
import { FungusDetail, IdentificationTools } from './components';
import { useFungi, useFungiSearch } from './hooks';
import { 
  MYCOLOGY_ACCENT, 
  getFungiFilters,
  computeFungiStats,
  getFungiColumns,
  getFungiExportColumns,
  getFungiCardConfig
} from './config';
import type { Fungus, FungusSearchParams } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY PAGE - Main module page
// ═══════════════════════════════════════════════════════════════════════════

export const MycologyPage = createModulePage<Fungus, FungusSearchParams>({
  translations: (t) => ({
    title: t('mycology.title'),
    searchPlaceholder: t('common.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('modules.emptyTitle'),
    emptyDatabase: t('modules.emptyDatabase'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  accentColor: MYCOLOGY_ACCENT,
  iconName: 'leaf',
  useData: useFungi,
  useSearch: useFungiSearch,
  filters: getFungiFilters,
  getColumns: getFungiColumns,
  computeStats: computeFungiStats,
  getExportColumns: getFungiExportColumns,
  getCardConfig: getFungiCardConfig,
  IdentificationToolsComponent: IdentificationTools,
  DetailComponent: FungusDetail,
  detailItemKey: 'fungus',
});
