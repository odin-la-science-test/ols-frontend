'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { AnnotationDetailPanel, AnnotationEditor } from './components';
import { useMyAnnotations, useSearchAnnotations } from './hooks';
import {
  getAnnotationColumns,
  getAnnotationFilters,
  getAnnotationExportColumns,
  getAnnotationCardConfig,
} from './config';
import type { Annotation } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ANNOTATIONS PAGE - Hugin Lab annotations module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const AnnotationsPage = createCollectionPage<Annotation>({
  moduleKey: 'annotations',
  iconName: 'sticky-note',
  backTo: '/lab',
  translations: (t) => ({
    title: t('annotations.title'),
    searchPlaceholder: t('annotations.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('annotations.emptyTitle'),
    emptyDatabase: t('annotations.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyAnnotations,
  useSearch: useSearchAnnotations,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  filters: getAnnotationFilters,
  columns: getAnnotationColumns,
  exportConfig: { getColumns: getAnnotationExportColumns },
  cardConfig: getAnnotationCardConfig,
  renderDetail: ({ item, onClose, onEdit }) => (
    <AnnotationDetailPanel annotation={item} onClose={onClose} onEdit={onEdit} />
  ),
  renderEditor: ({ item, onSaved, onCancel, moduleKey }) => (
    <AnnotationEditor annotation={item} onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: {
    labelKey: 'annotations.newAnnotation',
    createTitle: 'annotations.createTitle',
    editTitle: 'annotations.editTitle',
  },
  hasEdit: true,
  showCompare: false,
});
