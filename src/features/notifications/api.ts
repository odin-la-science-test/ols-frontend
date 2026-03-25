import api from '@/api/axios';
import type { Notification, UnreadCount } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS API - Endpoints for notifications module
// ═══════════════════════════════════════════════════════════════════════════

const BASE = '/notifications';

export const notificationsApi = {
  /** Lister mes notifications */
  getMyNotifications: () =>
    api.get<Notification[]>(BASE),

  /** Nombre de non lues */
  getUnreadCount: () =>
    api.get<UnreadCount>(`${BASE}/unread-count`),

  /** Marquer une notification comme lue */
  markAsRead: (id: number) =>
    api.patch<Notification>(`${BASE}/${id}/read`),

  /** Marquer toutes comme lues */
  markAllAsRead: () =>
    api.patch(`${BASE}/read-all`),

  /** Supprimer une notification */
  delete: (id: number) =>
    api.delete(`${BASE}/${id}`),
};
