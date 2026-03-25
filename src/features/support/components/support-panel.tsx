'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Plus, LifeBuoy, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, Input, Textarea } from '@/components/ui';
import { useDensity } from '@/hooks';
import { registry } from '@/lib/module-registry';
import { useMyTickets, useCreateTicket } from '../hooks';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import type { SupportTicket, TicketCategory } from '../types';

// ─── Support Panel (quick ticket + recent list, activity bar sidebar) ─

const STATUS_DOT: Record<string, string> = {
  OPEN: 'bg-blue-400',
  IN_PROGRESS: 'bg-amber-400',
  RESOLVED: 'bg-emerald-400',
  CLOSED: 'bg-zinc-400',
};

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '1m';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default function SupportPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const { data: tickets, isLoading } = useMyTickets();
  const createTicket = useCreateTicket();

  const [quickSubject, setQuickSubject] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickCategory, setQuickCategory] = useState<TicketCategory>('QUESTION');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openTickets = useMemo(() => {
    return (tickets ?? [])
      .filter((tk) => tk.status !== 'CLOSED')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [tickets]);

  const handleQuickCreate = useCallback(() => {
    const subject = quickSubject.trim();
    const description = quickDescription.trim();
    if (!subject || !description) return;
    createTicket.mutate(
      { subject, description, category: quickCategory },
      {
        onSuccess: () => {
          setQuickSubject('');
          setQuickDescription('');
          setQuickCategory('QUESTION');
          setIsExpanded(false);
        },
      }
    );
  }, [quickSubject, quickDescription, quickCategory, createTicket]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isExpanded && quickSubject.trim()) {
        setIsExpanded(true);
      }
    }
    if (e.key === 'Escape') {
      setQuickSubject('');
      setQuickDescription('');
      setIsExpanded(false);
    }
  }, [isExpanded, quickSubject]);

  const supportRoute = registry.getRoutePath('support') ?? '/lab/support';

  return (
    <>
      {/* Quick capture */}
      <div className="px-3 py-2.5 border-b border-border/30 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={quickSubject}
            onChange={(e) => {
              setQuickSubject(e.target.value);
              if (e.target.value && !isExpanded) setIsExpanded(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('support.subjectPlaceholder')}
            className="h-7 text-xs bg-muted/30 border-border/40"
          />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleQuickCreate}
                disabled={!quickSubject.trim() || !quickDescription.trim() || createTicket.isPending}
                className={cn(
                  'flex items-center justify-center rounded-md h-7 w-7 shrink-0',
                  'transition-colors',
                  quickSubject.trim() && quickDescription.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                )}
              >
                {createTicket.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('support.newTicket')}</TooltipContent>
          </Tooltip>
        </div>

        {/* Expandable: category + description */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden space-y-2"
            >
              {/* Category chips */}
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setQuickCategory(cat)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-md font-medium border transition-all',
                      quickCategory === cat
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/40 bg-card text-muted-foreground hover:border-border/60',
                    )}
                  >
                    {ticketCategoryLabel(cat, t)}
                  </button>
                ))}
              </div>

              {/* Description */}
              <Textarea
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleQuickCreate();
                  }
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setQuickDescription('');
                  }
                }}
                placeholder={t('support.descriptionPlaceholder')}
                className={cn(
                  'border-border/40 bg-muted/30',
                  'text-xs',
                  'px-2.5 resize-none',
                  'min-h-[60px] max-h-[120px]'
                )}
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground/50">
                Ctrl+Enter {t('support.submit').toLowerCase()} · Esc {t('support.cancel').toLowerCase()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent tickets list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : openTickets.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <LifeBuoy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('support.emptyTitle')}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{t('support.emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {openTickets.map((ticket: SupportTicket) => (
              <button
                key={ticket.id}
                onClick={() => navigate(supportRoute)}
                className={cn(
                  'w-full flex items-start gap-2 rounded-lg text-left',
                  'hover:bg-muted/50 transition-colors',
                  density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
                )}
              >
                <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[ticket.status] ?? 'bg-zinc-400')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ticket.subject}</p>
                  <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 flex items-center gap-1">
                    {ticketStatusLabel(ticket.status, t)}
                    <span className="text-muted-foreground/20">&middot;</span>
                    <Clock className="h-2.5 w-2.5 inline" />
                    {formatRelativeTime(ticket.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="p-2 border-t border-border/30">
        <Link
          to={supportRoute}
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
        >
          <ExternalLink className="h-3 w-3" />
          {t('support.title')} — {t('dashboard.viewAll')}
        </Link>
      </div>
    </>
  );
}
