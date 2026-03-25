'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

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
import { Button, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import type { SupportTicket } from '../types';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import { useDeleteTicket, useCreateTicket, useSendMessage } from '../hooks';
import { toast, useDensity } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { Badge } from '@/components/modules/shared';
import { STATUS_STYLES } from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET DETAIL PANEL - View details + message thread for a support ticket
// ═══════════════════════════════════════════════════════════════════════════

interface TicketDetailPanelProps {
  ticket: SupportTicket;
  onClose: () => void;
  onEdit: () => void;
}

export function TicketDetailPanel({ ticket, onClose, onEdit }: TicketDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();
  const createMutation = useCreateTicket();
  const sendMessageMutation = useSendMessage();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const snapshot = { subject: ticket.subject, description: ticket.description, category: ticket.category };
    pushCommand({
      labelKey: 'history.support.delete',
      icon: 'trash-2',
      execute: async () => {
        await deleteMutation.mutateAsync(ticket.id);
        log({ type: 'action', message: t('activity.support.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
        toast({ title: t('support.deleted') });
        onClose();
      },
      undo: async () => {
        await createMutation.mutateAsync(snapshot);
        toast({ title: t('history.undo') });
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
      log({ type: 'action', message: t('activity.support.sendMessage'), icon: 'send', accentColor: HUGIN_PRIMARY });
      setNewMessage('');
      toast({ title: t('support.messageSent') });
    } catch {
      toast({ title: t('support.messageError'), variant: 'destructive' });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
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
      <div className={cn('flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--color-border)_30%,transparent)]', d.detailPadding)}>
        <button onClick={onClose} className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_80%,transparent)] transition-colors lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--module-accent-muted)]">
          <MessageSquare className="w-4 h-4 text-[var(--module-accent)]" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{ticket.subject}</h3>
          <p className="text-xs text-muted-foreground">#{ticket.id}</p>
        </div>

        <button onClick={onClose} className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_80%,transparent)] transition-colors hidden lg:block">
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
          <Badge className={cn('border', STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN)} size="sm">
            {ticketStatusLabel(ticket.status, t)}
          </Badge>
          <Badge variant="secondary" size="sm">
            {ticketCategoryLabel(ticket.category, t)}
          </Badge>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <Tag className="w-3 h-3" />
            {t('support.description')}
          </label>
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-3">
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
                      : 'border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card'
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
            <div className="flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_20%,transparent)] p-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">{t('support.noMessages')}</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('support.createdAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-3">
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
        <div className={cn('border-t border-[color-mix(in_srgb,var(--color-border)_30%,transparent)]', d.density === 'compact' ? 'p-2' : 'p-3')}>
          <div className="flex items-end gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('support.messagePlaceholder')}
              rows={2}
              className="flex-1 border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card resize-none"
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
