'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { NotificationList } from './components';
import { useMyNotifications } from './hooks';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE - Full page for notification history
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const PRIMARY = HUGIN_PRIMARY;
const ACCENT = HUGIN_PRIMARY;

export function NotificationsPage() {
  const { t } = useTranslation();
  const { data: notifications = [] } = useMyNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="h-full overflow-auto"
      style={{
        '--module-primary': PRIMARY,
        '--module-accent': ACCENT,
      } as React.CSSProperties}
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: `${PRIMARY}15` }}
            >
              <Bell
                className="h-6 w-6"
                style={{ color: PRIMARY }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t('notifications.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} ${t('notifications.unread')}`
                  : t('notifications.allRead')
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* List */}
        <NotificationList />
      </div>
    </div>
  );
}
