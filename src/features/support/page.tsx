'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { UserTicketDetail, TicketForm } from './components';
import { useMyTickets, useMyTicketSearch } from './hooks';
import {
  getUserTicketFilters,
  computeUserTicketStats,
  getUserTicketColumns,
  getUserTicketExportColumns,
  getUserTicketCardConfig,
} from './user-config';
import type { SupportTicket } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT PAGE - User-facing support ticket module
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const SupportPage = createCollectionPage<SupportTicket>({
  moduleKey: 'support',
  iconName: 'life-buoy',
  backTo: '/lab',
  translations: (t) => ({
    title: t('support.title'),
    searchPlaceholder: t('support.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('support.emptyTitle'),
    emptyDatabase: t('support.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyTickets,
  useSearch: useMyTicketSearch,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  filters: getUserTicketFilters,
  columns: getUserTicketColumns,
  computeStats: computeUserTicketStats,
  exportConfig: { getColumns: getUserTicketExportColumns },
  cardConfig: getUserTicketCardConfig,
  renderDetail: ({ item, onClose }) => (
    <UserTicketDetail ticket={item} onClose={onClose} />
  ),
  renderEditor: ({ onSaved, onCancel, moduleKey }) => (
    <TicketForm onSaved={onSaved} onCancel={onCancel} moduleKey={moduleKey} />
  ),
  newItemConfig: { labelKey: 'support.newTicket', createTitle: 'support.createTitle' },
  showCompare: false,
  showExport: false,
});
