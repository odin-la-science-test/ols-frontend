'use client';

import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { createCollectionPage } from '@/lib/create-collection-page';
import { toast } from '@/hooks';
import { ContactDetailPanel, ContactEditor, ContactFavoriteAction } from './components';
import { useMyContacts, useSearchContacts, useBatchDeleteContacts } from './hooks';
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

/** Hook returning a batch-delete handler for contacts */
function useContactsBatchDelete() {
  const { t } = useTranslation();
  const mutation = useBatchDeleteContacts();

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
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <ContactEditor onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'contacts.newContact', createTitle: 'contacts.createTitle' },
  hasEdit: false,
  showCompare: false,
  useBatchDelete: useContactsBatchDelete,
  entityActions: {
    annotations: { entityType: 'contact' },
    collections: { moduleId: 'contacts' },
    renderFavoriteAction: ({ entityId }) => <ContactFavoriteAction entityId={entityId} />,
  },
});
