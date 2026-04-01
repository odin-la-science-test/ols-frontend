import type { TFunction } from 'i18next';
import type { ColumnDef, FilterConfig, StatItem, CardConfig } from '@/components/modules/types';
import type { SupportTicket, TicketStatus, TicketCategory } from './types';
import { ticketStatusLabel, ticketCategoryLabel } from './types';
import { Badge } from '@/components/modules/shared';
import { Clock, MessageSquare } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// USER SUPPORT CONFIG - Module configuration for user-facing support page
// Uses createModulePage factory like bacteriology & admin support
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
export const USER_SUPPORT_ACCENT = HUGIN_PRIMARY;

import { getStatusVariant } from './config';

// ─── Table Columns ───

export function getUserTicketColumns(_data: SupportTicket[], t: TFunction): ColumnDef<SupportTicket>[] {
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
      header: t('support.subject'),
      sortable: true,
      render: (value) => (
        <span className="font-medium truncate max-w-[250px] block">{value as string}</span>
      ),
    },
    {
      key: 'category',
      header: t('support.category'),
      sortable: true,
      width: '130px',
      render: (value) => (
        <Badge variant="secondary" size="sm">
          {ticketCategoryLabel(value as TicketCategory, t)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('support.status'),
      sortable: true,
      width: '120px',
      render: (value) => {
        const status = value as TicketStatus;
        return (
          <Badge variant={getStatusVariant(status)} size="sm">
            {ticketStatusLabel(status, t)}
          </Badge>
        );
      },
    },
    {
      key: 'messages',
      header: t('support.conversation'),
      sortable: false,
      width: '80px',
      render: (_value, row) => {
        const count = row.messages?.length ?? 0;
        if (count === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1 text-xs text-[var(--module-accent)]">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('support.createdAt'),
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

export function getUserTicketFilters(t: TFunction): FilterConfig[] {
  return [
    {
      key: 'status',
      label: t('support.status'),
      type: 'select',
      options: [
        { value: 'OPEN', label: t('support.statuses.OPEN') },
        { value: 'IN_PROGRESS', label: t('support.statuses.IN_PROGRESS') },
        { value: 'RESOLVED', label: t('support.statuses.RESOLVED') },
        { value: 'CLOSED', label: t('support.statuses.CLOSED') },
      ],
    },
    {
      key: 'category',
      label: t('support.category'),
      type: 'select',
      options: [
        { value: 'BUG', label: t('support.categories.BUG') },
        { value: 'FEATURE_REQUEST', label: t('support.categories.FEATURE_REQUEST') },
        { value: 'QUESTION', label: t('support.categories.QUESTION') },
        { value: 'ACCOUNT', label: t('support.categories.ACCOUNT') },
        { value: 'OTHER', label: t('support.categories.OTHER') },
      ],
    },
  ];
}

// ─── Stats Computation ───

export function computeUserTicketStats(data: SupportTicket[], t: TFunction): StatItem[] {
  const total = data.length;
  const open = data.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgress = data.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
  const resolved = data.filter((ticket) => ticket.status === 'RESOLVED').length;

  return [
    { label: t('support.stats.total'), value: total },
    { label: t('support.stats.open'), value: open, color: open > 0 ? 'default' : 'default' },
    { label: t('support.stats.inProgress'), value: inProgress, color: inProgress > 0 ? 'warning' : 'default' },
    { label: t('support.stats.resolved'), value: resolved, color: resolved > 0 ? 'success' : 'default' },
  ];
}

// ─── Export Columns ───

export function getUserTicketExportColumns(
  _data: SupportTicket[],
  t: TFunction
): Array<{ key: keyof SupportTicket; header: string }> {
  return [
    { key: 'id', header: '#' },
    { key: 'subject', header: t('support.subject') },
    { key: 'status', header: t('support.status') },
    { key: 'category', header: t('support.category') },
    { key: 'createdAt', header: t('support.createdAt') },
    { key: 'updatedAt', header: t('support.updatedAt') },
  ];
}

// ─── Card Configuration ───

export function getUserTicketCardConfig(t: TFunction): CardConfig<SupportTicket> {
  return {
    titleField: 'subject',
    badges: [
      {
        key: 'status',
        label: t('support.status'),
        render: (value) => {
          const status = value as TicketStatus;
          if (!status) return null;
          return (
            <Badge variant={getStatusVariant(status)} size="sm">
              {ticketStatusLabel(status, t)}
            </Badge>
          );
        },
      },
      {
        key: 'category',
        label: t('support.category'),
        render: (value) => {
          if (!value) return null;
          return (
            <Badge variant="secondary" size="sm">
              {ticketCategoryLabel(value as TicketCategory, t)}
            </Badge>
          );
        },
      },
    ],
    descriptionField: 'description',
    descriptionLabel: t('support.description'),
    infoFields: [
      {
        key: 'messages',
        label: t('support.conversation'),
        render: (_value, row) => {
          const count = row?.messages?.length ?? 0;
          if (count === 0) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-[var(--module-accent)]">
              <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
              <span>{count} {count === 1 ? 'message' : 'messages'}</span>
            </div>
          );
        },
      },
      {
        key: 'createdAt',
        label: t('support.createdAt'),
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
