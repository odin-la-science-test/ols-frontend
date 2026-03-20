// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TYPES - Domain types for notifications module
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType = 'QUICKSHARE_RECEIVED' | 'CONTACT_ADDED' | 'SYSTEM';

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
