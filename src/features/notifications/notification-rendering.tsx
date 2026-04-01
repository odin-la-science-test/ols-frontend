import { Bell, Building2, LogIn, MessageSquare, RefreshCw, Share2, Unlock, UserPlus, UserMinus, Info } from 'lucide-react';
import type { NotificationType } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION RENDERING — Centralized icon/color maps for notification types
//
// Single source of truth — used by:
// - NotificationBell (features/notifications/components/)
// - NotificationList (features/notifications/components/)
// - NotificationsWidget (components/common/widgets/)
// - NotificationsPanel in GlobalSidebar (components/common/)
// ═══════════════════════════════════════════════════════════════════════════

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  QUICKSHARE_RECEIVED: Share2,
  CONTACT_ADDED: UserPlus,
  SYSTEM: Info,
  SUPPORT_REPLY: MessageSquare,
  SUPPORT_STATUS_CHANGED: RefreshCw,
  MODULE_ACCESS_GRANTED: Unlock,
  NEW_LOGIN: LogIn,
  ORGANIZATION_INVITED: Building2,
  ORGANIZATION_ROLE_CHANGED: RefreshCw,
  ORGANIZATION_REMOVED: UserMinus,
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  QUICKSHARE_RECEIVED: 'text-blue-500',
  CONTACT_ADDED: 'text-emerald-500',
  SYSTEM: 'text-amber-500',
  SUPPORT_REPLY: 'text-purple-500',
  SUPPORT_STATUS_CHANGED: 'text-orange-500',
  MODULE_ACCESS_GRANTED: 'text-teal-500',
  NEW_LOGIN: 'text-rose-500',
  ORGANIZATION_INVITED: 'text-emerald-500',
  ORGANIZATION_ROLE_CHANGED: 'text-blue-500',
  ORGANIZATION_REMOVED: 'text-red-500',
};
