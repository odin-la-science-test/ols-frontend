'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Share2,
  FileText,
  FileDown,
  Copy,
  Check,
  Clock,
  Eye,
  Download,
  AlertTriangle,
  Loader2,
  File,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { GridsBackground } from '@/components/common';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { clipboard } from '@/lib/clipboard';
import { motion, AnimatePresence } from 'framer-motion';
import type { SharedItem } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC SHARE VIEW PAGE - Accessible without auth via /s/:code
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const ACCENT = HUGIN_PRIMARY;

/** Axios instance sans auth pour les endpoints publics */
const publicApi = axios.create({ baseURL: '/api' });

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SharedViewPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();

  const [item, setItem] = useState<SharedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'expired' | 'limit_reached' | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);

    publicApi
      .get<SharedItem>(`/quickshare/d/${code}`)
      .then((res) => {
        const data = res.data;
        if (data.expired) {
          setError('expired');
        } else if (data.downloadLimitReached) {
          setError('limit_reached');
        } else {
          setItem(data);
          // Enregistrer la consultation une seule fois
          if (!viewRecorded.current) {
            viewRecorded.current = true;
            publicApi.post(`/quickshare/d/${code}/view`).catch((err) => logger.warn('Failed to record view', err));
          }
        }
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.status === 410) {
          setError('not_found');
        } else {
          setError('not_found');
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleCopyText = async () => {
    if (!item?.textContent) return;
    const ok = await clipboard.copy(item.textContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async (fileId: number, filename: string) => {
    if (!code) return;
    setDownloadingFileId(fileId);
    try {
      const res = await publicApi.get(`/quickshare/d/${code}/files/${fileId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      logger.error('Failed to download file', err);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!code || !item) return;
    setDownloadingAll(true);
    try {
      const res = await publicApi.get(`/quickshare/d/${code}/download-all`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = (item.title || `quickshare-${code}`) + '.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      logger.error('Failed to download archive', err);
    } finally {
      setDownloadingAll(false);
    }
  };

  const style = {
    '--module-accent': ACCENT,
    '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
    '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
    '--color-ring': ACCENT,
    '--color-primary': ACCENT,
  } as CSSProperties;

  const isText = item?.type === 'TEXT';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={style}>
      <GridsBackground />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Minimal header */}
        <header className="bg-card border-b border-border/40">
          <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-3xl mx-auto w-full">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Share2 className="w-5 h-5 text-[var(--module-accent)]" strokeWidth={1.5} />
              <span className="text-lg font-semibold">QuickShare</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--module-accent)]" />
                  <p className="mt-4 text-sm text-muted-foreground">{t('quickshare.public.loading')}</p>
                </motion.div>
              )}

              {/* Error states */}
              {!loading && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    {error === 'expired'
                      ? t('quickshare.public.expiredTitle')
                      : error === 'limit_reached'
                      ? t('quickshare.public.limitTitle')
                      : t('quickshare.public.notFoundTitle')}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {error === 'expired'
                      ? t('quickshare.public.expiredDesc')
                      : error === 'limit_reached'
                      ? t('quickshare.public.limitDesc')
                      : t('quickshare.public.notFoundDesc')}
                  </p>
                </motion.div>
              )}

              {/* Share content */}
              {!loading && !error && item && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Card header */}
                  <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                    {/* Title bar */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
                      <div
                        className="p-2 rounded-lg bg-[var(--module-accent-subtle)]"
                      >
                        {isText ? (
                          <FileText className="w-5 h-5 text-[var(--module-accent)]" />
                        ) : (
                          <FileDown className="w-5 h-5 text-[var(--module-accent)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-semibold truncate">
                          {item.title || (isText ? t('quickshare.untitledText') : `${item.files.length} ${t(item.files.length > 1 ? 'quickshare.files' : 'quickshare.file')}`)}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                          {t('quickshare.public.sharedBy', { name: item.ownerName })} · {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 px-5 py-3 bg-muted/30 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {isText ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        {item.downloadCount} {isText ? t('quickshare.views').toLowerCase() : t('quickshare.downloads').toLowerCase()}
                      </span>
                      {item.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {t('quickshare.public.expiresOn')} {formatDate(item.expiresAt)}
                        </span>
                      )}
                      {!isText && item.files.length > 0 && (
                        <span>{item.files.length} {t(item.files.length > 1 ? 'quickshare.files' : 'quickshare.file')}</span>
                      )}
                    </div>

                    {/* Content body */}
                    <div className="p-5">
                      {isText ? (
                        <div className="space-y-3">
                          <pre className={cn(
                            'whitespace-pre-wrap break-words text-sm font-mono',
                            'rounded-lg border border-border/40 bg-muted p-4 max-h-[60vh] overflow-y-auto'
                          )}>
                            {item.textContent}
                          </pre>
                          <Button
                            onClick={handleCopyText}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 mr-1.5 text-green-500" />
                                {t('quickshare.textCopied')}
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1.5" />
                                {t('quickshare.copyText')}
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Files list */}
                          {item.files.map((file) => (
                            <div
                              key={file.id}
                              className="rounded-lg border border-border/40 bg-muted/40 p-3 flex items-center gap-3"
                            >
                              <File className="w-4 h-4 text-[var(--module-accent)] shrink-0" strokeWidth={1.5} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.originalFilename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.fileSize)}
                                  {file.contentType && ` · ${file.contentType}`}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleDownload(file.id, file.originalFilename)}
                                disabled={downloadingFileId === file.id}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                {downloadingFileId === file.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          ))}
                          {item.files.length > 1 && (
                            <Button
                              onClick={handleDownloadAll}
                              disabled={downloadingAll}
                              className="w-full bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
                            >
                              {downloadingAll ? (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              ) : (
                                <Archive className="w-4 h-4 mr-1.5" />
                              )}
                              {t('quickshare.downloadAll')}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Powered by footer */}
                  <p className="text-center text-xs text-muted-foreground/60">
                    {t('quickshare.public.poweredBy')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
