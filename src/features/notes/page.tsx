'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { NoteDetailPanel, NoteEditor } from './components';
import { useMyNotes, useSearchNotes } from './hooks';
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
  renderEditor: ({ item, onSaved, onCancel, moduleKey }) => (
    <NoteEditor note={item} onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'notes.newNote', createTitle: 'notes.createTitle', editTitle: 'notes.editTitle' },
  hasEdit: true,
  showCompare: false,
});
