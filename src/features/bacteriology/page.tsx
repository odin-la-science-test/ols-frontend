'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { BacteriumDetail, IdentificationTools } from './components';
import { useBacteria, useBacteriaSearch, useBacteriologyPanel } from './hooks';
import {
  getBacteriaFilters,
  computeBacteriaStats,
  getBacteriaColumns,
  getBacteriaExportColumns,
  getBacteriaCardConfig
} from './config';
import type { Bacterium } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY PAGE - Main module page
// ═══════════════════════════════════════════════════════════════════════════

const BacteriologyPageBase = createCollectionPage<Bacterium>({
  moduleKey: 'bacteriology',
  iconName: 'bug',
  backTo: '/atlas',
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
  useData: useBacteria,
  useSearch: useBacteriaSearch,
  filters: getBacteriaFilters,
  columns: getBacteriaColumns,
  computeStats: computeBacteriaStats,
  exportConfig: { getColumns: getBacteriaExportColumns },
  cardConfig: getBacteriaCardConfig,
  IdentificationToolsComponent: IdentificationTools,
  renderDetail: ({ item, onClose }) => (
    <BacteriumDetail bacterium={item} onClose={onClose} />
  ),
  entityActions: {
    annotations: { entityType: 'bacterium' },
    collections: { moduleId: 'bacteriology' },
    favorite: true,
  },
});

/** Bacteriology page with contextual bottom panel tab registration */
export function BacteriologyPage() {
  useBacteriologyPanel();
  return <BacteriologyPageBase />;
}
