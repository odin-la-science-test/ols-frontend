'use client';

import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { createCollectionPage } from '@/lib/create-collection-page';
import { toast } from '@/hooks';
import { NoteDetailPanel, NoteEditor, NotePinAction } from './components';
import { useMyNotes, useSearchNotes, useBatchDeleteNotes } from './hooks';
import {
  getNoteColumns,
  getNoteFilters,
  computeNoteStats,
  getNoteExportColumns,
  getNoteCardConfig,
} from './config';
import type { Note } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES PAGE - Hugin Lab notebook module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

/** Hook returning a batch-delete handler for notes */
function useNotesBatchDelete() {
  const { t } = useTranslation();
  const mutation = useBatchDeleteNotes();

  return useCallback((ids: Set<string | number>) => {
    const numericIds = [...ids].map(Number);
    mutation.mutate(numericIds, {
      onSuccess: () => {
        toast({ title: t('common.batchDeleteSuccess', { count: numericIds.length }) });
      },
      onError: () => {
        toast({ title: t('common.batchDeleteError'), variant: 'destructive' });
      },
    });
  }, [mutation, t]);
}

export const NotesPage = createCollectionPage<Note>({
  moduleKey: 'notes',
  iconName: 'notebook-pen',
  backTo: '/lab',
  translations: (t) => ({
    title: t('notes.title'),
    searchPlaceholder: t('notes.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('notes.emptyTitle'),
    emptyDatabase: t('notes.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyNotes,
  useSearch: useSearchNotes,
  defaultSort: { key: 'updatedAt', direction: 'desc' },
  filters: getNoteFilters,
  columns: getNoteColumns,
  computeStats: computeNoteStats,
  exportConfig: { getColumns: getNoteExportColumns },
  cardConfig: getNoteCardConfig,
  renderDetail: ({ item, onClose, onEdit }) => (
    <NoteDetailPanel note={item} onClose={onClose} onEdit={onEdit} />
  ),
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <NoteEditor onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'notes.newNote', createTitle: 'notes.createTitle' },
  hasEdit: false,
  showCompare: false,
  useBatchDelete: useNotesBatchDelete,
  entityActions: {
    annotations: { entityType: 'note' },
    collections: { moduleId: 'notes' },
    renderFavoriteAction: ({ entityId }) => <NotePinAction entityId={entityId} />,
  },
});
