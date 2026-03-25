'use client';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent } from '@/components/modules/shared';
import type { Notification } from '../types';
import { notificationTypeLabel } from '../types';
import { NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_COLORS } from '../notification-rendering';
import { useMarkAsRead, useDeleteNotification } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION DETAIL - View details of a notification
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationDetail({ notification, onClose }: NotificationDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const Icon = NOTIFICATION_TYPE_ICONS[notification.type];
  const iconColor = NOTIFICATION_TYPE_COLORS[notification.type];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkRead = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = () => {
    deleteNotification.mutate(notification.id, {
      onSuccess: () => {
        toast({ title: t('notifications.deleted') });
        onClose();
      },
    });
  };

  const handleNavigate = () => {
    if (notification.actionUrl) {
      if (!notification.read) markAsRead.mutate(notification.id);
      navigate(notification.actionUrl);
    }
  };

  return (
    <DetailPanelContent
      title={notification.title}
      subtitle={formatDate(notification.createdAt)}
      badge={
        <div className="flex items-center gap-1.5">
          <Icon className={cn('w-3.5 h-3.5', iconColor)} />
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-[var(--module-accent)]" />
          )}
        </div>
      }
      actions={
        <div className="flex items-center gap-1.5">
          {notification.actionUrl && (
            <Button variant="outline" size="sm" onClick={handleNavigate} className="gap-1.5 h-7 text-xs">
              <ExternalLink className="w-3 h-3" />
              {t('notifications.open')}
            </Button>
          )}
          {!notification.read && (
            <Button variant="outline" size="sm" onClick={handleMarkRead} className="gap-1.5 h-7 text-xs">
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteNotification.isPending}
            className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('notifications.type')}
          </span>
          <span className="text-sm">{notificationTypeLabel(notification.type, t)}</span>
        </div>

        {/* Message */}
        {notification.message && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('notifications.message')}
            </span>
            <div className={cn(
              'rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-4',
              'text-sm whitespace-pre-wrap leading-relaxed'
            )}>
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </DetailPanelContent>
  );
}
