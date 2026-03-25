'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { FungusDetail, IdentificationTools } from './components';
import { useFungi, useFungiSearch } from './hooks';
import {
  getFungiFilters,
  computeFungiStats,
  getFungiColumns,
  getFungiExportColumns,
  getFungiCardConfig
} from './config';
import type { Fungus } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY PAGE - Main module page
// ═══════════════════════════════════════════════════════════════════════════

export const MycologyPage = createCollectionPage<Fungus>({
  moduleKey: 'mycology',
  iconName: 'leaf',
  backTo: '/atlas',
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
  useData: useFungi,
  useSearch: useFungiSearch,
  filters: getFungiFilters,
  columns: getFungiColumns,
  computeStats: computeFungiStats,
  exportConfig: { getColumns: getFungiExportColumns },
  cardConfig: getFungiCardConfig,
  IdentificationToolsComponent: IdentificationTools,
  renderDetail: ({ item, onClose }) => (
    <FungusDetail fungus={item} onClose={onClose} />
  ),
});
