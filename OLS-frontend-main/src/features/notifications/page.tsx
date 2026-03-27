'use client';

import { createCollectionPage } from '@/lib/create-collection-page';
import { NotificationDetail } from './components';
import { useMyNotifications } from './hooks';
import {
  getNotificationColumns,
  computeNotificationStats,
  getNotificationCardConfig,
} from './config';
import type { Notification } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE - Full page for notification history
// Uses createCollectionPage for consistent UI with other modules
// ═══════════════════════════════════════════════════════════════════════════

export const NotificationsPage = createCollectionPage<Notification>({
  moduleKey: 'notifications',
  iconName: 'bell',
  backTo: '/lab',
  search: false,
  translations: (t) => ({
    title: t('notifications.title'),
    searchPlaceholder: '',
    loading: t('common.loading'),
    error: t('modules.loadError'),
    errorDesc: t('modules.loadErrorDesc'),
    emptyTitle: t('notifications.emptyTitle'),
    emptyDatabase: t('notifications.emptyDesc'),
    searchNoResults: (query) => t('modules.searchNoResults', { query }),
    filterNoMatch: t('modules.filterNoMatch'),
  }),
  useData: useMyNotifications,
  defaultSort: { key: 'createdAt', direction: 'desc' },
  columns: getNotificationColumns,
  computeStats: computeNotificationStats,
  cardConfig: getNotificationCardConfig,
  renderDetail: ({ item, onClose }) => (
    <NotificationDetail notification={item} onClose={onClose} />
  ),
  showCompare: false,
  showExport: false,
});
