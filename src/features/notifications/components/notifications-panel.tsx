'use client';

import { useCallback, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, ExternalLink, Check, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useDensity } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { formatRelativeTime } from '@/lib/format-time';
import { ExpandableListItem } from '@/components/common/expandable-list-item';
import { useUnreadCount, useMyNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks';
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
  const deleteNotification = useDeleteNotification();
  const { log } = useActivityLog();

  const unreadCount = unreadData?.count ?? 0;
  const [expandedNotifId, setExpandedNotifId] = useState<number | null>(null);

  const handleToggleExpand = useCallback((notifId: number, read: boolean) => {
    setExpandedNotifId((prev) => (prev === notifId ? null : notifId));
    if (!read) {
      markAsRead.mutate(notifId, {
        onSuccess: () => log({ type: 'action', message: t('activity.notifications.markAsRead'), icon: 'check', accentColor: HUGIN_PRIMARY }),
      });
    }
  }, [markAsRead, log, t]);

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
              const isExpanded = expandedNotifId === notif.id;

              return (
                <ExpandableListItem
                  key={notif.id}
                  expanded={isExpanded}
                  onToggle={() => handleToggleExpand(notif.id, notif.read)}
                  summary={
                    <div className={cn(
                      'w-full flex items-start text-left',
                      'hover:bg-muted/50 transition-colors',
                      density === 'compact' ? 'gap-2 px-3 py-1.5' : 'gap-2.5 px-3 py-2.5',
                      !notif.read && 'bg-muted/20'
                    )}>
                      <TypeIcon className={cn('h-4 w-4 mt-0.5 shrink-0', typeColor)} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-medium leading-relaxed',
                          notif.read ? 'text-muted-foreground' : 'text-foreground'
                        )}>
                          {notif.title}
                        </p>
                        {notif.message && !isExpanded && (
                          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
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
                    </div>
                  }
                >
                  <NotificationDetail
                    message={notif.message}
                    actionUrl={notif.actionUrl}
                    onDelete={() => {
                      deleteNotification.mutate(notif.id);
                      setExpandedNotifId(null);
                    }}
                    onNavigate={notif.actionUrl ? () => navigate(notif.actionUrl!) : undefined}
                  />
                </ExpandableListItem>
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

// ─── Notification Detail (expanded) ─────────────────────────────────────

interface NotificationDetailProps {
  message: string | null;
  actionUrl: string | null;
  onDelete: () => void;
  onNavigate?: () => void;
}

function NotificationDetail({ message, actionUrl, onDelete, onNavigate }: NotificationDetailProps) {
  const { t } = useTranslation();

  return (
    <div className="px-3 pb-2 space-y-2">
      {message && (
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
      )}
      <div className="flex items-center gap-1">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={onDelete}
              className="p-1 rounded text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('notifications.delete')}</TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        {actionUrl && onNavigate && (
          <button
            onClick={onNavigate}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            {t('notifications.open')}
          </button>
        )}
      </div>
    </div>
  );
}
