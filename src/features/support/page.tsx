'use client';

import { createModulePage } from '@/lib/create-module-page';
import { UserTicketDetail, NewTicketButton, TicketFormPanel } from './components';
import { useMyTickets, useMyTicketSearch, useSupportMobileMenuItems } from './hooks';
import {
  USER_SUPPORT_ACCENT,
  getUserTicketFilters,
  computeUserTicketStats,
  getUserTicketColumns,
  getUserTicketExportColumns,
  getUserTicketCardConfig,
} from './user-config';
import type { SupportTicket } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT PAGE - User-facing support ticket module
// Uses createModulePage factory for consistent UI with other modules
// Includes: table/card views, filters, detail panel, ticket creation form
// ═══════════════════════════════════════════════════════════════════════════

export const SupportPage = createModulePage<SupportTicket, void>({
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
  accentColor: USER_SUPPORT_ACCENT,
  iconName: 'life-buoy',
  useData: useMyTickets,
  useSearch: useMyTicketSearch,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  filters: getUserTicketFilters,
  getColumns: getUserTicketColumns,
  computeStats: computeUserTicketStats,
  getExportColumns: getUserTicketExportColumns,
  getCardConfig: getUserTicketCardConfig,
  DetailComponent: UserTicketDetail,
  detailItemKey: 'ticket',
  headerActions: NewTicketButton,
  useMobileMenuItems: useSupportMobileMenuItems,
  FormComponent: TicketFormPanel,
  showCompare: false,
  showExport: false,
});
