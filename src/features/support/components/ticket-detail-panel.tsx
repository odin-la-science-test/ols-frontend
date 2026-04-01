'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Clock,
  Trash2,
  X,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { InlineText, InlineTextarea, InlineSelect } from '@/components/modules/shared/inline-fields';
import { useInlineAutoSave } from '@/hooks/use-inline-auto-save';
import type { SupportTicket, UpdateTicketRequest } from '../types';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import type { TicketCategory } from '../types';
import { useDeleteTicket, useUpdateTicket, useSendMessage, useTicketDetail } from '../hooks';
import { toast, useDensity } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { Badge } from '@/components/modules/shared';
import { getStatusVariant } from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET DETAIL PANEL — Inline editable, auto-save on blur
// ═══════════════════════════════════════════════════════════════════════════

interface TicketFormValues {
  subject: string;
  description: string;
  category: TicketCategory;
}

const TICKET_CATEGORIES = [
  { value: 'BUG', label: 'BUG' },
  { value: 'FEATURE_REQUEST', label: 'FEATURE_REQUEST' },
  { value: 'QUESTION', label: 'QUESTION' },
  { value: 'ACCOUNT', label: 'ACCOUNT' },
  { value: 'OTHER', label: 'OTHER' },
];

interface TicketDetailPanelProps {
  ticket: SupportTicket;
  onClose: () => void;
  onEdit?: () => void;
}

export function TicketDetailPanel({ ticket: initialTicket, onClose }: TicketDetailPanelProps) {
  // Get fresh data from React Query cache (refreshes after undo/redo invalidation)
  const { data: freshTicket } = useTicketDetail(initialTicket.id);
  const ticket = freshTicket ?? initialTicket;

  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();
  const updateMutation = useUpdateTicket();
  const sendMessageMutation = useSendMessage();
  const { log } = useActivityLog();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = ticket.status === 'OPEN';

  const form = useForm<TicketFormValues>({
    defaultValues: {
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
    },
  });

  const { handleFieldBlur, saveField, saveStatus } = useInlineAutoSave<TicketFormValues, UpdateTicketRequest>({
    form,
    updateMutation,
    entityId: ticket.id,
    entityValues: {
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
    },
    enabled: isOpen,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(ticket.id);
      log({ type: 'action', message: t('activity.support.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
      toast({ title: t('support.deleted') });
      onClose();
    } catch {
      toast({ title: t('support.deleteError'), variant: 'destructive' });
    }
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
        {isOpen && (
          <div className="flex items-center gap-2">
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
          </div>
        )}

        {/* Status + Category badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant(ticket.status)} size="sm">
            {ticketStatusLabel(ticket.status, t)}
          </Badge>
          <Badge variant="secondary" size="sm">
            {ticketCategoryLabel(ticket.category, t)}
          </Badge>
        </div>

        {/* Editable fields */}
        <InlineText
          label={t('support.subject')}
          registration={form.register('subject')}
          onFieldBlur={() => handleFieldBlur('subject' as never)}
          placeholder={t('support.subjectPlaceholder')}
          readOnly={!isOpen}
          saveStatus={saveStatus}
        />

        <InlineTextarea
          label={t('support.description')}
          registration={form.register('description')}
          onFieldBlur={() => handleFieldBlur('description' as never)}
          placeholder={t('support.descriptionPlaceholder')}
          readOnly={!isOpen}
          rows={4}
          saveStatus={saveStatus}
        />

        <InlineSelect<TicketFormValues>
          label={t('support.category')}
          name="category"
          control={form.control}
          options={TICKET_CATEGORIES}
          onSave={() => saveField('category' as never)}
          readOnly={!isOpen}
          saveStatus={saveStatus}
        />

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
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('support.messagePlaceholder')}
              rows={2}
              className="flex-1 border-border/40 bg-card resize-none"
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
