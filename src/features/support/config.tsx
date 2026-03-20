import type { TFunction } from 'i18next';
import { ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColumnDef, FilterConfig, StatItem } from '@/components/modules/types';
import type { SupportTicket, TicketStats } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT CONFIG
// Shared styles + admin-specific configuration for the support module,
// following the same pattern as bacteriology/config.tsx
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
export const ADMIN_SUPPORT_ACCENT = HUGIN_PRIMARY;
export const ADMIN_SUPPORT_PRIMARY = HUGIN_PRIMARY;
export const ADMIN_SUPPORT_ICON = ShieldCheck;

// ─── Style maps ───

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
          <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border', STATUS_STYLES[status])}>
            {t(`support.statuses.${status}`)}
          </span>
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
          <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', PRIORITY_STYLES[priority])}>
            {t(`support.priorities.${priority}`)}
          </span>
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

// ─── Card config for ticket cards ───

export interface TicketCardConfig {
  statusStyles: Record<string, string>;
  priorityStyles: Record<string, string>;
}

export const ticketCardConfig: TicketCardConfig = {
  statusStyles: STATUS_STYLES,
  priorityStyles: PRIORITY_STYLES,
};
