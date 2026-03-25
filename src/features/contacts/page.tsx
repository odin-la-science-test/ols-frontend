'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { ContactDetailPanel, ContactEditor } from './components';
import { useMyContacts, useSearchContacts } from './hooks';
import {
  getContactColumns,
  getContactFilters,
  computeContactStats,
  getContactExportColumns,
  getContactCardConfig,
} from './config';
import type { Contact } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS PAGE - Hugin Lab contacts module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const ContactsPage = createCollectionPage<Contact>({
  moduleKey: 'contacts',
  iconName: 'contact-round',
  backTo: '/lab',
  translations: (t) => ({
    title: t('contacts.title'),
    searchPlaceholder: t('contacts.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('contacts.emptyTitle'),
    emptyDatabase: t('contacts.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyContacts,
  useSearch: useSearchContacts,
  defaultSort: { key: 'firstName', direction: 'asc' },
  filters: getContactFilters,
  columns: getContactColumns,
  computeStats: computeContactStats,
  exportConfig: { getColumns: getContactExportColumns },
  cardConfig: getContactCardConfig,
  renderDetail: ({ item, onClose, onEdit }) => (
    <ContactDetailPanel contact={item} onClose={onClose} onEdit={onEdit} />
  ),
  renderEditor: ({ item, onSaved, onCancel, moduleKey }) => (
    <ContactEditor contact={item} onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'contacts.newContact', createTitle: 'contacts.createTitle', editTitle: 'contacts.editTitle' },
  hasEdit: true,
  showCompare: false,
});
