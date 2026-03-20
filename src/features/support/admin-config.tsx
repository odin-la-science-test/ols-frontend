import type { TFunction } from 'i18next';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { SupportTicket, TicketStatus } from './types';
import { Badge } from '@/components/modules/shared';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SUPPORT CONFIG - Module configuration for createModulePage
// ═══════════════════════════════════════════════════════════════════════════

// Module accent color — from centralized accent map
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
export const ADMIN_SUPPORT_ACCENT = HUGIN_PRIMARY;

// ─── Status & Priority Styles ───

export const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-zinc-500/10 text-zinc-400',
  MEDIUM: 'bg-blue-500/10 text-blue-400',
  HIGH: 'bg-orange-500/10 text-orange-400',
  CRITICAL: 'bg-red-500/10 text-red-400',
};

// ─── Table Columns ───

export function getAdminTicketColumns(_data: SupportTicket[], t: TFunction): ColumnDef<SupportTicket>[] {
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
        const status = value as TicketStatus;
        return (
          <Badge
            className={cn('text-[11px] border', STATUS_STYLES[status])}
            size="sm"
          >
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
          <Badge
            className={cn('text-[11px]', PRIORITY_STYLES[priority])}
            size="sm"
          >
            {t(`support.priorities.${priority}`)}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('adminSupport.date'),
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

// ─── Filter Configuration ───

export function getAdminTicketFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'status',
      label: t('adminSupport.status'),
      type: 'select',
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
      options: [
        { value: 'LOW', label: t('support.priorities.LOW') },
        { value: 'MEDIUM', label: t('support.priorities.MEDIUM') },
        { value: 'HIGH', label: t('support.priorities.HIGH') },
        { value: 'CRITICAL', label: t('support.priorities.CRITICAL') },
      ],
    },
  ];
}

// ─── Stats Computation ───

export function computeAdminTicketStats(data: SupportTicket[], t: TFunction): StatItem[] {
  const total = data.length;
  const open = data.filter((t) => t.status === 'OPEN').length;
  const inProgress = data.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolved = data.filter((t) => t.status === 'RESOLVED').length;
  const closed = data.filter((t) => t.status === 'CLOSED').length;

  return [
    { label: t('adminSupport.stats.total'), value: total },
    { label: t('adminSupport.stats.open'), value: open, color: open > 0 ? 'default' : 'default' },
    { label: t('adminSupport.stats.inProgress'), value: inProgress, color: inProgress > 0 ? 'warning' : 'default' },
    { label: t('adminSupport.stats.resolved'), value: resolved, color: resolved > 0 ? 'success' : 'default' },
    { label: t('adminSupport.stats.closed'), value: closed },
  ];
}

// ─── Export Columns ───

export function getAdminTicketExportColumns(
  _data: SupportTicket[],
  t: TFunction
): Array<{ key: keyof SupportTicket; header: string }> {
  return [
    { key: 'id', header: '#' },
    { key: 'subject', header: t('adminSupport.subject') },
    { key: 'ownerName', header: t('adminSupport.user') },
    { key: 'ownerEmail', header: 'Email' },
    { key: 'status', header: t('adminSupport.status') },
    { key: 'priority', header: t('adminSupport.priority') },
    { key: 'category', header: t('support.category') },
    { key: 'createdAt', header: t('adminSupport.date') },
    { key: 'updatedAt', header: t('support.updatedAt') },
  ];
}

// ─── Card Configuration ───

export function getAdminTicketCardConfig(t: TFunction): CardConfig<SupportTicket> {
  return {
    titleField: 'subject',
    subtitleField: 'ownerName',
    badges: [
      {
        key: 'status',
        label: t('adminSupport.status'),
        render: (value) => {
          const status = value as TicketStatus;
          if (!status) return null;
          return (
            <Badge
              className={cn('text-[10px] border', STATUS_STYLES[status])}
              size="sm"
            >
              {t(`support.statuses.${status}`)}
            </Badge>
          );
        },
      },
      {
        key: 'priority',
        label: t('adminSupport.priority'),
        render: (value) => {
          const priority = value as string;
          if (!priority) return null;
          return (
            <Badge
              className={cn('text-[10px]', PRIORITY_STYLES[priority])}
              size="sm"
            >
              {t(`support.priorities.${priority}`)}
            </Badge>
          );
        },
      },
    ],
    descriptionField: 'description',
    descriptionLabel: t('support.description'),
    infoFields: [
      {
        key: 'ownerEmail',
        label: 'Email',
        render: (value) => (
          <span className="text-xs text-muted-foreground truncate">{value as string}</span>
        ),
      },
      {
        key: 'category',
        label: t('support.category'),
        render: (value) => (
          <Badge variant="secondary" size="sm">
            {t(`support.categories.${value}`)}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        label: t('adminSupport.date'),
        render: (value) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(value as string).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </div>
        ),
      },
    ],
  };
}
