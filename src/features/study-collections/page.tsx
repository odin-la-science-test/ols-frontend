'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { CollectionDetailPanel, CollectionEditor } from './components';
import { useMyCollections, useSearchCollections } from './hooks';
import {
  getCollectionColumns,
  getCollectionExportColumns,
  getCollectionCardConfig,
} from './config';
import type { StudyCollection } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STUDY COLLECTIONS PAGE - Hugin Lab study collections module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const StudyCollectionsPage = createCollectionPage<StudyCollection>({
  moduleKey: 'study-collections',
  iconName: 'library-big',
  backTo: '/lab',
  translations: (t) => ({
    title: t('studyCollections.title'),
    searchPlaceholder: t('studyCollections.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('studyCollections.emptyTitle'),
    emptyDatabase: t('studyCollections.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyCollections,
  useSearch: useSearchCollections,
  defaultSort: { key: 'name', direction: 'asc' },
  columns: getCollectionColumns,
  exportConfig: { getColumns: getCollectionExportColumns },
  cardConfig: getCollectionCardConfig,
  renderDetail: ({ item, onClose, onEdit }) => (
    <CollectionDetailPanel collection={item} onClose={onClose} onEdit={onEdit} />
  ),
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <CollectionEditor onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: {
    labelKey: 'studyCollections.newCollection',
    createTitle: 'studyCollections.createTitle',
    editTitle: 'studyCollections.editTitle',
  },
  hasEdit: false,
  showCompare: false,
});
