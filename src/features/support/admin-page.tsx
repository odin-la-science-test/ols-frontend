'use client';

import { createModulePage } from '@/lib/create-module-page';
import { AdminTicketDetail } from './components';
import { useAllTickets, useAdminTicketSearch } from './hooks';
import {
  ADMIN_SUPPORT_ACCENT,
  getAdminTicketFilters,
  computeAdminTicketStats,
  getAdminTicketColumns,
  getAdminTicketExportColumns,
  getAdminTicketCardConfig,
} from './admin-config';
import type { SupportTicket } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SUPPORT PAGE - Dashboard for admins to manage support tickets
// Uses createModulePage factory for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const AdminSupportPage = createModulePage<SupportTicket, void>({
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
  accentColor: ADMIN_SUPPORT_ACCENT,
  iconName: 'shield-check',
  useData: useAllTickets,
  useSearch: useAdminTicketSearch,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  filters: getAdminTicketFilters,
  getColumns: getAdminTicketColumns,
  computeStats: computeAdminTicketStats,
  getExportColumns: getAdminTicketExportColumns,
  getCardConfig: getAdminTicketCardConfig,
  DetailComponent: AdminTicketDetail,
  detailItemKey: 'ticket',
  showCompare: false,
});
