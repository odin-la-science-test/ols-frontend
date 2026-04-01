'use client';

import { useState, type MouseEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { Copy, Check, Trash2, FileText, File, Clock, Download, Eye } from 'lucide-react';
import { EmptyState, ListSkeleton } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { clipboard } from '@/lib/clipboard';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { motion } from 'framer-motion';
import type { SharedItem } from '../types';
import { useDeleteShare } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// SHARE LIST - Table of user's shared items
// ═══════════════════════════════════════════════════════════════════════════

interface ShareListProps {
  shares: SharedItem[];
  isLoading: boolean;
  onViewItem: (item: SharedItem) => void;
}

export function ShareList({ shares, isLoading, onViewItem }: ShareListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <ListSkeleton layout="list" count={3} itemHeight="h-20" />;
  }

  if (shares.length === 0) {
    return <EmptyState icon={FileText} title={t('quickshare.emptyTitle')} description={t('quickshare.emptyDesc')} />;
  }

  return (
    <div className="space-y-2">
      {shares.map((item, index) => (
        <ShareItem
          key={item.id}
          item={item}
          index={index}
          onView={() => onViewItem(item)}
        />
      ))}
    </div>
  );
}

// ─── Individual share item card ───

interface ShareItemProps {
  item: SharedItem;
  index: number;
  onView: () => void;
}

function ShareItem({ item, index, onView }: ShareItemProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const deleteMutation = useDeleteShare();
  const { log } = useActivityLog();

  const isText = item.type === 'TEXT';
  const isExpiredOrLimited = item.expired || item.downloadLimitReached;

  const copyShareLink = async (e: MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/s/${item.shareCode}`;
    const ok = await clipboard.copy(url);
    if (ok) {
      setCopied(true);
      toast({ title: t('quickshare.linkCopied') });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        log({ type: 'action', message: t('activity.quickshare.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
      },
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onView}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer',
        'border border-border/40 bg-card',
        'hover:bg-card hover:border-border/60 transition-all duration-200',
        isExpiredOrLimited && 'opacity-50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
          isText
            ? 'bg-[var(--module-accent-subtle)] text-[var(--module-accent)]'
            : 'bg-blue-500/10 text-blue-500'
        )}
      >
        {isText ? (
          <FileText className="w-4 h-4" strokeWidth={1.5} />
        ) : (
          <File className="w-4 h-4" strokeWidth={1.5} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.title || (isText ? t('quickshare.untitledText') : `${item.files.length} ${t(item.files.length > 1 ? 'quickshare.files' : 'quickshare.file')}`)}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{formatDate(item.createdAt)}</span>
          {!isText && item.files.length > 0 && (
            <span>
              {item.files.length} {t(item.files.length > 1 ? 'quickshare.files' : 'quickshare.file')}
            </span>
          )}
          <span className="flex items-center gap-1">
            {isText ? <Eye className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            {item.downloadCount}
            {item.maxDownloads != null && `/${item.maxDownloads}`}
          </span>
          {item.expiresAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.expired ? t('quickshare.expired') : formatDate(item.expiresAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={copyShareLink}
              className="p-1.5 rounded-md hover:bg-muted/80 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--module-accent)]" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('quickshare.copyLink')}</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('quickshare.delete')}</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}
