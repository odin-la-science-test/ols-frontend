import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, Share2, UserPlus, Info, ArrowRight, CheckCheck } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useMyNotifications, useUnreadCount } from '@/features/notifications';
import { useMarkAllAsRead } from '@/features/notifications/hooks';
import type { NotificationType } from '@/features/notifications/types';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS WIDGET - Shows recent unread notifications
// ═══════════════════════════════════════════════════════════════════════════

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'QUICKSHARE_RECEIVED': return <Share2 className="w-3.5 h-3.5" />;
    case 'CONTACT_ADDED': return <UserPlus className="w-3.5 h-3.5" />;
    case 'SYSTEM': return <Info className="w-3.5 h-3.5" />;
    default: return <Bell className="w-3.5 h-3.5" />;
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationsWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useMyNotifications();
  const { data: unreadData } = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const recentNotifications = (notifications ?? []).slice(0, 4);

  return (
    <DashboardWidgetWrapper id="notifications">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('dashboard.widgets.notifications')}
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-destructive/15 text-destructive">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors mr-1"
                title={t('dashboard.markAllRead')}
              >
                <CheckCheck className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => navigate('/lab/notifications')}
              className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/60">
            <Bell className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">{t('dashboard.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentNotifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (notif.actionUrl) navigate(notif.actionUrl);
                  else navigate('/lab/notifications');
                }}
                className={cn(
                  'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left',
                  'hover:bg-muted/30 transition-all duration-150 group',
                  !notif.read && 'bg-primary/5'
                )}
              >
                <span className={cn(
                  'shrink-0 mt-0.5 transition-opacity',
                  notif.read ? 'opacity-40' : 'opacity-80'
                )}>
                  {getNotificationIcon(notif.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs truncate',
                    notif.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                  )}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-[10px] text-muted-foreground/60 line-clamp-1 mt-0.5">
                      {notif.message}
                    </p>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground/40 shrink-0 mt-0.5">
                  {formatTimeAgo(notif.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardWidgetWrapper>
  );
}
