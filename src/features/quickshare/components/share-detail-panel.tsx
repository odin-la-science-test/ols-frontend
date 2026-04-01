'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Copy, Check, Download, FileText, File, Clock, Eye, Archive, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanelContent } from '@/components/modules/shared';
import { clipboard } from '@/lib/clipboard';
import type { SharedItem } from '../types';
import { downloadFile, downloadAll } from '../api';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// SHARE DETAIL PANEL - View details of a shared item
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface ShareDetailPanelProps {
  item: SharedItem;
  onClose: () => void;
}

export function ShareDetailPanel({ item }: ShareDetailPanelProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isText = item.type === 'TEXT';

  const shareLink = `${window.location.origin}/s/${item.shareCode}`;

  const copyLink = async () => {
    const ok = await clipboard.copy(shareLink);
    if (ok) {
      setCopied(true);
      toast({ title: t('quickshare.linkCopied') });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyTextContent = async () => {
    if (item.textContent) {
      const ok = await clipboard.copy(item.textContent);
      if (ok) toast({ title: t('quickshare.textCopied') });
    }
  };

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await downloadFile(item.shareCode, fileId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: t('quickshare.downloadError'), variant: 'destructive' });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await downloadAll(item.shareCode);
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (item.title || `quickshare-${item.shareCode}`) + '.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: t('quickshare.downloadError'), variant: 'destructive' });
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const title = item.title || (isText ? t('quickshare.untitledText') : `${item.files.length} ${t(item.files.length > 1 ? 'quickshare.files' : 'quickshare.file')}`);

  return (
    <DetailPanelContent
      title={title}
      subtitle={formatDate(item.createdAt)}
      icon={isText ? FileText : File}
    >
      <div className="space-y-4">
        {/* Share link */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('quickshare.shareLink')}
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted/60 rounded px-2 py-1.5 truncate font-mono">
              {shareLink}
            </code>
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {isText ? <Eye className="w-3 h-3" /> : <Download className="w-3 h-3" />}
              {isText ? t('quickshare.views') : t('quickshare.downloads')}
            </div>
            <p className="text-lg font-semibold">
              {item.downloadCount}
              {item.maxDownloads != null && (
                <span className="text-xs text-muted-foreground font-normal"> / {item.maxDownloads}</span>
              )}
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('quickshare.expiresLabel')}
            </div>
            <p className="text-sm font-medium">
              {item.expiresAt
                ? item.expired
                  ? t('quickshare.expired')
                  : formatDate(item.expiresAt)
                : t('quickshare.never')}
            </p>
          </div>
        </div>

        {/* Direct recipient */}
        {item.recipientEmail && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card">
            <UserCheck className="w-4 h-4 text-[var(--module-accent)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('quickshare.sharedTo')}</p>
              <p className="text-sm font-medium truncate">{item.recipientEmail}</p>
            </div>
          </div>
        )}

        {/* File info or Text content */}
        {isText ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('quickshare.content')}
              </label>
              <Button variant="ghost" size="sm" onClick={copyTextContent} className="h-6 text-xs">
                <Copy className="w-3 h-3 mr-1" />
                {t('quickshare.copyText')}
              </Button>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted p-3 max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words font-mono">{item.textContent}</pre>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('quickshare.fileInfo')} ({item.files.length})
            </label>
            <div className="space-y-2">
              {item.files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-lg border border-border/40 bg-card p-3 flex items-center gap-3"
                >
                  <File className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalFilename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.fileSize)}
                      {file.contentType && ` · ${file.contentType}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.id, file.originalFilename)}
                    disabled={item.expired || item.downloadLimitReached}
                    className="shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            {item.files.length > 1 && (
              <Button
                onClick={handleDownloadAll}
                className="w-full bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
                disabled={item.expired || item.downloadLimitReached}
              >
                <Archive className="w-4 h-4 mr-2" />
                {t('quickshare.downloadAll')}
              </Button>
            )}
          </div>
        )}
      </div>
    </DetailPanelContent>
  );
}
