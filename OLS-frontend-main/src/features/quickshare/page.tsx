'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { ShareDetailPanel, CreateShareForm } from './components';
import { useMyShares, useSearchShares } from './hooks';
import {
  getShareColumns,
  computeShareStats,
  getShareExportColumns,
  getShareCardConfig,
} from './config';
import type { SharedItem } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE PAGE - Hugin Lab instant sharing module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const QuickSharePage = createCollectionPage<SharedItem>({
  moduleKey: 'quickshare',
  iconName: 'share-2',
  backTo: '/lab',
  translations: (t) => ({
    title: t('quickshare.title'),
    searchPlaceholder: t('quickshare.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('quickshare.emptyTitle'),
    emptyDatabase: t('quickshare.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyShares,
  useSearch: useSearchShares,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  columns: getShareColumns,
  computeStats: computeShareStats,
  exportConfig: { getColumns: getShareExportColumns },
  cardConfig: getShareCardConfig,
  renderDetail: ({ item, onClose }) => (
    <ShareDetailPanel item={item} onClose={onClose} />
  ),
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <CreateShareForm onCreated={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'quickshare.newShare', createTitle: 'quickshare.createTitle' },
  showCompare: false,
  showExport: false,
});
