// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TYPES - Domain types for notifications module
// ═══════════════════════════════════════════════════════════════════════════

import type { TFunction } from 'i18next';

export type { NotificationType } from '@/api/generated/enums';
import type { NotificationType } from '@/api/generated/enums';

export function notificationTypeLabel(type: NotificationType, t: TFunction): string {
  switch (type) {
    case 'QUICKSHARE_RECEIVED': return t('notifications.types.QUICKSHARE_RECEIVED');
    case 'CONTACT_ADDED': return t('notifications.types.CONTACT_ADDED');
    case 'SYSTEM': return t('notifications.types.SYSTEM');
    case 'SUPPORT_REPLY': return t('notifications.types.SUPPORT_REPLY');
    case 'SUPPORT_STATUS_CHANGED': return t('notifications.types.SUPPORT_STATUS_CHANGED');
    case 'MODULE_ACCESS_GRANTED': return t('notifications.types.MODULE_ACCESS_GRANTED');
    case 'NEW_LOGIN': return t('notifications.types.NEW_LOGIN');
    case 'ORGANIZATION_INVITED': return t('notifications.types.ORGANIZATION_INVITED');
    case 'ORGANIZATION_ROLE_CHANGED': return t('notifications.types.ORGANIZATION_ROLE_CHANGED');
    case 'ORGANIZATION_REMOVED': return t('notifications.types.ORGANIZATION_REMOVED');
    default: { const _exhaustive: never = type; return String(_exhaustive); }
  }
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string | null;
  read: boolean;
  actionUrl: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}
