import type { TFunction } from 'i18next';
import type { ColumnDef, StatItem, CardConfig } from '@/components/modules/types';
import type { Notification, NotificationType } from './types';
import { notificationTypeLabel } from './types';
import { Badge } from '@/components/modules/shared';
import { NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_COLORS } from './notification-rendering';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

// ─── Table Columns ───

export function getNotificationColumns(_data: Notification[], t: TFunction): ColumnDef<Notification>[] {
  return [
    {
      key: 'type',
      header: t('notifications.type'),
      width: '120px',
      render: (value) => {
        const type = value as NotificationType;
        const Icon = NOTIFICATION_TYPE_ICONS[type];
        const colorClass = NOTIFICATION_TYPE_COLORS[type];
        return (
          <div className="flex items-center gap-1.5">
            <Icon className={cn('w-3.5 h-3.5', colorClass)} />
            <Badge variant="secondary" size="sm">
              {notificationTypeLabel(type, t)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'title',
      header: t('notifications.titleLabel'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('font-medium truncate', !row.read && 'text-foreground')}>
            {value as string}
          </span>
          {!row.read && (
            <div className="w-2 h-2 rounded-full bg-[var(--module-accent)] shrink-0" />
          )}
        </div>
      ),
    },
    {
      key: 'message',
      header: t('notifications.message'),
      render: (value) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
            {value as string}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('notifications.date'),
      sortable: true,
      width: '110px',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value as string).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];
}

// ─── Stats Computation ───

export function computeNotificationStats(data: Notification[], t: TFunction): StatItem[] {
  const total = data.length;
  const unread = data.filter((n) => !n.read).length;

  return [
    { label: t('common.total'), value: total },
    { label: t('notifications.unread'), value: unread, color: unread > 0 ? 'warning' : 'default' },
  ];
}

// ─── Card Configuration ───

export function getNotificationCardConfig(t: TFunction): CardConfig<Notification> {
  return {
    titleField: 'title',
    badges: [
      {
        key: 'type',
        render: (value) => {
          const type = value as NotificationType;
          const Icon = NOTIFICATION_TYPE_ICONS[type];
          const colorClass = NOTIFICATION_TYPE_COLORS[type];
          return (
            <div className="flex items-center gap-1">
              <Icon className={cn('w-3 h-3', colorClass)} />
              <Badge variant="secondary" size="sm">
                {notificationTypeLabel(type, t)}
              </Badge>
            </div>
          );
        },
      },
      {
        key: 'read',
        render: (value) => {
          if (value) return null;
          return (
            <div className="w-2 h-2 rounded-full bg-[var(--module-accent)]" />
          );
        },
      },
    ],
    descriptionField: 'message',
    descriptionLabel: t('notifications.message'),
    infoFields: [
      {
        key: 'createdAt',
        label: t('notifications.date'),
        render: (value) => (
          <span className="text-xs text-muted-foreground">
            {new Date(value as string).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </span>
        ),
      },
    ],
  };
}
