import type { TFunction } from 'i18next';
import { FileText, File, Download, Clock, Link2 } from 'lucide-react';
import type { ColumnDef, StatItem, CardConfig } from '@/components/modules/types';
import type { SharedItem } from './types';
import { Badge } from '@/components/modules/shared';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE CONFIG - Module configuration for collection layout
// ═══════════════════════════════════════════════════════════════════════════

// ─── Table Columns ───

export function getShareColumns(_data: SharedItem[], t: TFunction): ColumnDef<SharedItem>[] {
  return [
    {
      key: 'title',
      header: t('quickshare.titleLabel'),
      sortable: true,
      render: (value, row) => {
        const Icon = row.type === 'TEXT' ? FileText : File;
        const title = (value as string) || t('quickshare.untitled');
        return (
          <div className={cn(
            'flex items-center gap-2 min-w-0',
            (row.expired || row.downloadLimitReached) && 'opacity-50',
          )}>
            <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span className="font-medium truncate">{title}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: t('quickshare.type'),
      width: '100px',
      render: (value) => (
        <Badge variant="secondary" size="sm">
          {(value as string) === 'TEXT' ? t('quickshare.typeText') : t('quickshare.typeFile')}
        </Badge>
      ),
    },
    {
      key: 'downloadCount',
      header: t('quickshare.downloads'),
      sortable: true,
      width: '100px',
      align: 'center',
      render: (value, row) => {
        const count = value as number;
        const max = row.maxDownloads;
        return (
          <div className="flex items-center justify-center gap-1 text-sm">
            <Download className="w-3 h-3 text-muted-foreground" />
            <span className={cn(row.downloadLimitReached && 'text-destructive')}>
              {count}{max ? `/${max}` : ''}
            </span>
          </div>
        );
      },
    },
    {
      key: 'expiresAt',
      header: t('quickshare.expiration'),
      sortable: true,
      width: '120px',
      render: (value, row) => {
        if (!value) return <span className="text-muted-foreground">—</span>;
        return (
          <span className={cn(
            'text-sm',
            row.expired ? 'text-destructive' : 'text-muted-foreground',
          )}>
            {new Date(value as string).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('quickshare.createdAt'),
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

export function computeShareStats(data: SharedItem[], t: TFunction): StatItem[] {
  const total = data.length;
  const active = data.filter((s) => !s.expired && !s.downloadLimitReached).length;
  const totalDownloads = data.reduce((sum, s) => sum + s.downloadCount, 0);

  return [
    { label: t('common.total'), value: total },
    { label: t('quickshare.active'), value: active, color: 'success' },
    { label: t('quickshare.totalDownloads'), value: totalDownloads },
  ];
}

// ─── Export Columns ───

export function getShareExportColumns(
  _data: SharedItem[],
  t: TFunction
): Array<{ key: keyof SharedItem; header: string }> {
  return [
    { key: 'id', header: t('common.id') },
    { key: 'title', header: t('quickshare.titleLabel') },
    { key: 'type', header: t('quickshare.type') },
    { key: 'shareCode', header: t('quickshare.shareCode') },
    { key: 'downloadCount', header: t('quickshare.downloads') },
    { key: 'maxDownloads', header: t('quickshare.maxDownloads') },
    { key: 'expiresAt', header: t('quickshare.expiration') },
    { key: 'createdAt', header: t('quickshare.createdAt') },
  ];
}

// ─── Card Configuration ───

export function getShareCardConfig(t: TFunction): CardConfig<SharedItem> {
  return {
    titleField: 'title',
    badges: [
      {
        key: 'type',
        render: (value) => (
          <Badge variant="secondary" size="sm">
            {(value as string) === 'TEXT' ? t('quickshare.typeText') : t('quickshare.typeFile')}
          </Badge>
        ),
      },
      {
        key: 'expired',
        render: (value) => {
          if (!value) return null;
          return <Badge variant="destructive" size="sm">{t('quickshare.expired')}</Badge>;
        },
      },
    ],
    infoFields: [
      {
        key: 'downloadCount',
        label: t('quickshare.downloads'),
        render: (value, row) => {
          const count = value as number;
          const max = row?.maxDownloads;
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>{count}{max ? `/${max}` : ''}</span>
            </div>
          );
        },
      },
      {
        key: 'expiresAt',
        label: t('quickshare.expiration'),
        render: (value) => {
          if (!value) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {new Date(value as string).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
          );
        },
      },
      {
        key: 'shareUrl',
        label: t('quickshare.link'),
        render: () => (
          <div className="flex items-center gap-1 text-xs text-[var(--module-accent)]">
            <Link2 className="w-3 h-3" />
          </div>
        ),
      },
    ],
  };
}
