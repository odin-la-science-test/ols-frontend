'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { AdminTicketDetail } from './components';
import { useAllTickets, useAdminTicketSearch } from './hooks';
import {
  getAdminTicketFilters,
  computeAdminTicketStats,
  getAdminTicketColumns,
  getAdminTicketExportColumns,
  getAdminTicketCardConfig,
} from './admin-config';
import type { SupportTicket } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SUPPORT PAGE - Dashboard for admins to manage support tickets
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const AdminSupportPage = createCollectionPage<SupportTicket>({
  moduleKey: 'admin-support',
  iconName: 'shield-check',
  backTo: '/lab',
  translations: (t) => ({
    title: t('adminSupport.title'),
    searchPlaceholder: t('adminSupport.searchPlaceholder'),
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('adminSupport.emptyTitle'),
    emptyDatabase: t('adminSupport.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useAllTickets,
  useSearch: useAdminTicketSearch,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  filters: getAdminTicketFilters,
  columns: getAdminTicketColumns,
  computeStats: computeAdminTicketStats,
  exportConfig: { getColumns: getAdminTicketExportColumns },
  cardConfig: getAdminTicketCardConfig,
  renderDetail: ({ item, onClose }) => (
    <AdminTicketDetail ticket={item} onClose={onClose} />
  ),
  showCompare: false,
});
