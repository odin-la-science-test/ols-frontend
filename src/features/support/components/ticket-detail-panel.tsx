'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  MessageSquare,
  Tag,
  AlertTriangle,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import type { SupportTicket } from '../types';
import { useDeleteTicket, useSendMessage } from '../hooks';
import { toast } from '@/hooks';
import { useDensity } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET DETAIL PANEL - View details + message thread for a support ticket
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

interface TicketDetailPanelProps {
  ticket: SupportTicket;
  onClose: () => void;
  onEdit: () => void;
}

export function TicketDetailPanel({ ticket, onClose, onEdit }: TicketDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();
  const sendMessageMutation = useSendMessage();
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(ticket.id, {
      onSuccess: () => {
        toast({ title: t('support.deleted') });
        onClose();
      },
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({
        id: ticket.id,
        data: { content: newMessage.trim() },
      });
      setNewMessage('');
      toast({ title: t('support.messageSent') });
    } catch {
      toast({ title: t('support.messageError'), variant: 'destructive' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages?.length]);

  const isClosed = ticket.status === 'CLOSED';
  const d = useDensity();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className={cn('flex items-center gap-2 border-b border-border/30', d.detailPadding)}>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--module-accent-muted)]">
          <MessageSquare className="w-4 h-4 text-[var(--module-accent)]" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{ticket.subject}</h3>
          <p className="text-xs text-muted-foreground">#{ticket.id}</p>
        </div>

        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors hidden lg:block">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className={cn('flex-1 overflow-y-auto', d.detailPadding, d.detailSectionGap)}>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {ticket.status === 'OPEN' && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                {t('support.edit')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('support.delete')}
              </Button>
            </>
          )}
        </div>

        {/* Status + Category badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium border',
              STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN
            )}
          >
            {t(`support.statuses.${ticket.status}`)}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted/40 text-muted-foreground">
            {t(`support.categories.${ticket.category}`)}
          </span>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Tag className="w-3 h-3" />
            {t('support.description')}
          </label>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Message thread */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <MessageSquare className="w-3 h-3" />
            {t('support.conversation')}
          </label>

          {ticket.messages && ticket.messages.length > 0 ? (
            <div className="space-y-2">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'rounded-lg border p-3 space-y-1',
                    msg.admin
                      ? 'border-[var(--module-accent)]/20 bg-[var(--module-accent)]/5'
                      : 'border-border/40 bg-card'
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {msg.admin ? (
                      <ShieldCheck className="w-3 h-3 text-[var(--module-accent)]" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className={cn('font-medium', msg.admin && 'text-[var(--module-accent)]')}>
                      {msg.authorName}
                    </span>
                    <span>•</span>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 p-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">{t('support.noMessages')}</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('support.createdAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('support.updatedAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Message input (if not closed) */}
      {!isClosed && (
        <div className={cn('border-t border-border/30', d.density === 'compact' ? 'p-2' : 'p-3')}>
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('support.messagePlaceholder')}
              rows={2}
              className="flex-1 rounded-lg border border-border/40 bg-card px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)] transition-colors"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
