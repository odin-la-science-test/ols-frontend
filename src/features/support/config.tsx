import type { TFunction } from 'i18next';
import { ShieldCheck, Clock } from 'lucide-react';
import type { ColumnDef, FilterConfig, StatItem } from '@/components/modules/types';
import type { SupportTicket, TicketStats } from './types';
import { Badge, type BadgeProps } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT CONFIG
// Shared styles + admin-specific configuration for the support module,
// following the same pattern as bacteriology/config.tsx
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
export const ADMIN_SUPPORT_ACCENT = HUGIN_PRIMARY;
export const ADMIN_SUPPORT_PRIMARY = HUGIN_PRIMARY;
export const ADMIN_SUPPORT_ICON = ShieldCheck;

// ─── Semantic variant maps ───

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'RESOLVED': return 'success';
    case 'IN_PROGRESS': return 'warning';
    case 'CLOSED': return 'secondary';
    case 'OPEN': default: return 'outline';
  }
}

export function getPriorityVariant(priority: string): BadgeVariant {
  switch (priority) {
    case 'CRITICAL': return 'destructive';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'outline';
    case 'LOW': default: return 'secondary';
  }
}

// ─── Filters ───

export function getAdminSupportFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'status',
      label: t('support.status'),
      type: 'select',
      icon: Clock,
      options: [
        { value: 'OPEN', label: t('adminSupport.stats.open') },
        { value: 'IN_PROGRESS', label: t('adminSupport.stats.inProgress') },
        { value: 'RESOLVED', label: t('adminSupport.stats.resolved') },
        { value: 'CLOSED', label: t('adminSupport.stats.closed') },
      ],
    },
    {
      key: 'priority',
      label: t('adminSupport.priority'),
      type: 'select',
      icon: ShieldCheck,
      options: [
        { value: 'LOW', label: t('support.priorities.LOW') },
        { value: 'MEDIUM', label: t('support.priorities.MEDIUM') },
        { value: 'HIGH', label: t('support.priorities.HIGH') },
        { value: 'CRITICAL', label: t('support.priorities.CRITICAL') },
      ],
    },
  ];
}

// ─── Table columns ───

export function getAdminSupportColumns(t: TFunction): ColumnDef<SupportTicket>[] {
  return [
    {
      key: 'id',
      header: '#',
      sortable: true,
      width: '60px',
      render: (value) => (
        <span className="text-muted-foreground">#{value as number}</span>
      ),
    },
    {
      key: 'subject',
      header: t('adminSupport.subject'),
      sortable: true,
      render: (value) => (
        <span className="font-medium truncate max-w-[200px] block">{value as string}</span>
      ),
    },
    {
      key: 'ownerName',
      header: t('adminSupport.user'),
      sortable: true,
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="text-sm truncate">{row.ownerName}</span>
          <span className="text-xs text-muted-foreground truncate">{row.ownerEmail}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('adminSupport.status'),
      sortable: true,
      width: '120px',
      render: (value) => {
        const status = value as string;
        return (
          <Badge variant={getStatusVariant(status)} size="sm">
            {t(`support.statuses.${status}`)}
          </Badge>
        );
      },
    },
    {
      key: 'priority',
      header: t('adminSupport.priority'),
      sortable: true,
      width: '100px',
      render: (value) => {
        const priority = value as string;
        return (
          <Badge variant={getPriorityVariant(priority)} size="sm">
            {t(`support.priorities.${priority}`)}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('adminSupport.date'),
      sortable: true,
      width: '120px',
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

// ─── Stats ───

export function computeAdminSupportStats(stats: TicketStats, t: TFunction): StatItem[] {
  return [
    { label: t('adminSupport.stats.total'), value: stats.total },
    { label: t('adminSupport.stats.open'), value: stats.open, color: 'default' as const },
    { label: t('adminSupport.stats.inProgress'), value: stats.inProgress, color: 'warning' as const },
    { label: t('adminSupport.stats.resolved'), value: stats.resolved, color: 'success' as const },
    { label: t('adminSupport.stats.closed'), value: stats.closed, color: 'default' as const },
  ];
}

