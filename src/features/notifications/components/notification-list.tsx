'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { EmptyState } from '@/components/modules/shared';
import {
  useMyNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { formatRelativeTime } from '@/lib/format-time';
import type { Notification } from '../types';
import { NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_COLORS } from '../notification-rendering';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION LIST - Main list component for notifications page
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDelete, onNavigate }: NotificationItemProps) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const Icon = NOTIFICATION_TYPE_ICONS[notification.type] || Bell;
  const iconColor = NOTIFICATION_TYPE_COLORS[notification.type] || 'text-muted-foreground';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
        notification.read
          ? 'bg-card border-border/30 hover:bg-muted/30'
          : 'bg-card border-border/60 hover:bg-muted/40 shadow-sm'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
        if (notification.actionUrl) onNavigate(notification.actionUrl);
      }}
    >
      {/* Icon */}
      <div className={cn(
        'mt-0.5 p-2 rounded-lg bg-muted/50',
        !notification.read && 'bg-muted'
      )}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm truncate',
            notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {formatRelativeTime(notification.createdAt, t)}
        </p>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 flex-shrink-0"
          >
            {notification.actionUrl && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(notification.actionUrl!);
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('notifications.open')}</TooltipContent>
              </Tooltip>
            )}
            {!notification.read && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('notifications.markAsRead')}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{t('notifications.delete')}</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function NotificationList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notifications = [] } = useMyNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const { log } = useActivityLog();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id, {
      onSuccess: () => log({ type: 'action', message: t('activity.notifications.markAsRead'), icon: 'check', accentColor: HUGIN_PRIMARY }),
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => log({ type: 'action', message: t('activity.notifications.markAllAsRead'), icon: 'check-check', accentColor: HUGIN_PRIMARY }),
    });
  };

  const handleDelete = (id: number) => {
    deleteNotification.mutate(id, {
      onSuccess: () => log({ type: 'action', message: t('activity.notifications.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY }),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            {t('notifications.markAllRead')}
          </Button>
        </div>
      )}

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.emptyTitle')} description={t('notifications.emptyDesc')} />
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                onNavigate={(url) => navigate(url)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
