import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, CheckCheck } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useMyNotifications, useUnreadCount } from '@/features/notifications';
import { useMarkAllAsRead } from '@/features/notifications/hooks';
import { getNotificationIcon } from '@/features/notifications/notification-rendering';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS WIDGET - Shows recent unread notifications
//
// Container-query responsive:
//   < @xs  → compact: icon + title only
//   >= @xs → full: icon + title + message + timestamp
// ═══════════════════════════════════════════════════════════════════════════

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
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden @3xs:inline">{t('dashboard.widgets.notifications')}</span>
            {unreadCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-destructive/15 text-destructive">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors mr-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('dashboard.markAllRead')}</TooltipContent>
              </Tooltip>
            )}
            <button
              onClick={() => navigate(registry.getRoutePath('notifications') ?? '/lab/notifications')}
              className="hidden @xs:flex text-[10px] text-muted-foreground/60 hover:text-foreground items-center gap-0.5 transition-colors"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 @xs:h-10 rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60">
              <Bell className="w-6 h-6 mb-2 opacity-40" />
              <p className="text-xs">{t('dashboard.noNotifications')}</p>
            </div>
          ) : (
            <div className="grid auto-rows-fr gap-0.5 h-full">
              {recentNotifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (notif.actionUrl) navigate(notif.actionUrl);
                    else navigate(registry.getRoutePath('notifications') ?? '/lab/notifications');
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 @xs:gap-2.5 px-2 @xs:px-2.5 rounded-lg text-left',
                    'hover:bg-muted/30 transition-all duration-150 group',
                    !notif.read && 'bg-primary/5'
                  )}
                >
                  <span className={cn(
                    'shrink-0 transition-opacity',
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
                      <p className="hidden @xs:block text-[10px] text-muted-foreground/60 line-clamp-1 mt-0.5">
                        {notif.message}
                      </p>
                    )}
                  </div>
                  <span className="hidden @xs:inline text-[9px] text-muted-foreground/40 shrink-0">
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardWidgetWrapper>
  );
}
