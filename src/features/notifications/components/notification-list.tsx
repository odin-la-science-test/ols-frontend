'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Share2,
  UserPlus,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  useMyNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks';
import type { Notification, NotificationType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION LIST - Main list component for notifications page
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  QUICKSHARE_RECEIVED: Share2,
  CONTACT_ADDED: UserPlus,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  QUICKSHARE_RECEIVED: 'text-blue-500',
  CONTACT_ADDED: 'text-emerald-500',
  SYSTEM: 'text-amber-500',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString();
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDelete, onNavigate }: NotificationItemProps) {
  const [showActions, setShowActions] = React.useState(false);
  const Icon = TYPE_ICON[notification.type] || Bell;
  const iconColor = TYPE_COLOR[notification.type] || 'text-muted-foreground';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
        notification.read
          ? 'bg-card/50 border-border/30 hover:bg-muted/30'
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
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[hsl(160,84%,39%)]" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {formatRelativeTime(notification.createdAt)}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(notification.actionUrl!);
                }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Ouvrir"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Marquer comme lue"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Header actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="p-4 rounded-2xl bg-muted/30 mb-4">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-1">
            {t('notifications.emptyTitle')}
          </h3>
          <p className="text-sm text-muted-foreground/60">
            {t('notifications.emptyDesc')}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markAsRead.mutate(id)}
                onDelete={(id) => deleteNotification.mutate(id)}
                onNavigate={(url) => navigate(url)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
