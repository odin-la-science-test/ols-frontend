'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Plus, LifeBuoy, Loader2, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, Input, Textarea } from '@/components/ui';
import { useDensity } from '@/hooks';
import { registry } from '@/lib/module-registry';
import { formatRelativeTime } from '@/lib/format-time';
import { ExpandableListItem } from '@/components/common/expandable-list-item';
import { useMyTickets, useCreateTicket, useTicketDetail, useSendMessage } from '../hooks';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import type { SupportTicket, TicketCategory } from '../types';

// ─── Support Panel (quick ticket + recent list, activity bar sidebar) ─

const STATUS_DOT: Record<string, string> = {
  OPEN: 'bg-border',
  IN_PROGRESS: 'bg-warning',
  RESOLVED: 'bg-success',
  CLOSED: 'bg-muted-foreground/40',
};

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

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
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supportRoute = registry.getRoutePath('support') ?? '/lab/support';

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

  const handleToggleExpand = useCallback((ticketId: number) => {
    setExpandedTicketId((prev) => (prev === ticketId ? null : ticketId));
  }, []);

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
              <ExpandableListItem
                key={ticket.id}
                expanded={expandedTicketId === ticket.id}
                onToggle={() => handleToggleExpand(ticket.id)}
                summary={
                  <div className={cn(
                    'w-full flex items-start gap-2 rounded-lg text-left',
                    'hover:bg-muted/50 transition-colors',
                    density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
                  )}>
                    <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[ticket.status] ?? 'bg-zinc-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{ticket.subject}</p>
                      {expandedTicketId !== ticket.id && (
                        <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 flex items-center gap-1">
                          {ticketStatusLabel(ticket.status, t)}
                          <span className="text-muted-foreground/20">&middot;</span>
                          <Clock className="h-2.5 w-2.5 inline" />
                          {formatRelativeTime(ticket.updatedAt, t)}
                        </p>
                      )}
                    </div>
                  </div>
                }
              >
                <TicketInlineDetail
                  ticketId={ticket.id}
                  status={ticket.status}
                  onOpen={() => navigate(supportRoute)}
                />
              </ExpandableListItem>
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

// ─── Ticket Inline Detail (expanded) ────────────────────────────────────

interface TicketInlineDetailProps {
  ticketId: number;
  status: string;
  onOpen: () => void;
}

function TicketInlineDetail({ ticketId, status, onOpen }: TicketInlineDetailProps) {
  const { t } = useTranslation();
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const sendMessage = useSendMessage();
  const [replyContent, setReplyContent] = useState('');
  const isClosed = status === 'CLOSED';

  const handleSendReply = useCallback(() => {
    const content = replyContent.trim();
    if (!content) return;
    sendMessage.mutate(
      { id: ticketId, data: { content } },
      { onSuccess: () => setReplyContent('') },
    );
  }, [replyContent, ticketId, sendMessage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="px-2 pb-2 space-y-2">
      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {ticket.description}
      </p>

      {/* Messages thread */}
      {ticket.messages.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-1.5 border-t border-border/20 pt-2">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-md px-2 py-1.5 text-[11px] leading-relaxed',
                msg.admin
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/30',
              )}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="font-medium text-foreground/80">{msg.authorName}</span>
                <span className="text-muted-foreground/40">&middot;</span>
                <span className="text-muted-foreground/50">{formatRelativeTime(msg.createdAt, t)}</span>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {ticket.messages.length === 0 && (
        <p className="text-[11px] text-muted-foreground/50 italic">
          {t('support.noMessages')}
        </p>
      )}

      {/* Reply input */}
      {!isClosed && (
        <div className="flex items-end gap-1.5">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            placeholder={t('support.messagePlaceholder')}
            className="border-border/40 bg-muted/30 text-xs px-2.5 resize-none min-h-[40px] max-h-[80px]"
            rows={2}
          />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSendReply}
                disabled={!replyContent.trim() || sendMessage.isPending}
                className={cn(
                  'flex items-center justify-center rounded-md h-7 w-7 shrink-0 mb-0.5',
                  'transition-colors',
                  replyContent.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                )}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('support.submit')}</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Open full page */}
      <div className="flex justify-end">
        <button
          onClick={onOpen}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          {t('support.conversation')}
        </button>
      </div>
    </div>
  );
}
