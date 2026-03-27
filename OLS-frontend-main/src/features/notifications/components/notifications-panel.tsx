'use client';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, ExternalLink, Check, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { formatRelativeTime } from '@/lib/format-time';
import { useUnreadCount, useMyNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks';
import { NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_COLORS } from '../notification-rendering';

// ─── Notifications Panel (compact, activity bar sidebar) ─────────────

export default function NotificationsPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const { data: unreadData } = useUnreadCount();
  const { data: notifications = [] } = useMyNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const { log } = useActivityLog();

  const unreadCount = unreadData?.count ?? 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Header actions */}
        {unreadCount > 0 && (
          <div className={cn(density === 'compact' ? 'px-3 py-1' : 'px-3 py-2', 'border-b border-border/30')}>
            <button
              onClick={() => markAllAsRead.mutate(undefined, {
                onSuccess: () => log({ type: 'action', message: t('activity.notifications.markAllAsRead'), icon: 'check-check', accentColor: HUGIN_PRIMARY }),
              })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Check className="h-3 w-3" />
                {t('notifications.markAllRead')}
              </div>
            </button>
          </div>
        )}

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('notifications.emptyTitle')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.slice(0, 20).map((notif) => {
              const TypeIcon = NOTIFICATION_TYPE_ICONS[notif.type] || Info;
              const typeColor = NOTIFICATION_TYPE_COLORS[notif.type] || 'text-muted-foreground';
              return (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead.mutate(notif.id, {
                      onSuccess: () => log({ type: 'action', message: t('activity.notifications.markAsRead'), icon: 'check', accentColor: HUGIN_PRIMARY }),
                    });
                    if (notif.actionUrl) navigate(notif.actionUrl);
                  }}
                  className={cn(
                    'w-full flex items-start text-left',
                    'hover:bg-muted/50 transition-colors',
                    density === 'compact' ? 'gap-2 px-3 py-1.5' : 'gap-2.5 px-3 py-2.5',
                    !notif.read && 'bg-muted/20'
                  )}
                >
                  <TypeIcon className={cn('h-4 w-4 mt-0.5 shrink-0', typeColor)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium leading-relaxed',
                      notif.read ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className={cn(
                        'text-[11px] leading-relaxed mt-0.5',
                        notif.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                      )}>
                        {notif.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatRelativeTime(notif.createdAt, t)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="p-2 border-t border-border/30">
        <Link
          to="/notifications"
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
        >
          <ExternalLink className="h-3 w-3" />
          {t('notifications.viewAll')}
        </Link>
      </div>
    </>
  );
}
