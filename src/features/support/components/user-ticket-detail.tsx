'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  AlertCircle,
  Send,
  Trash2,
  ShieldCheck,
  User,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanel } from '@/components/modules/shared/detail-panel';
import { useDeleteTicket, useSendMessage } from '../hooks';
import { STATUS_STYLES } from '../user-config';
import type { SupportTicket } from '../types';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// USER TICKET DETAIL - Detail panel for user support tickets
// Uses shared DetailPanel for consistent overlay/slide-in behavior
// ═══════════════════════════════════════════════════════════════════════════

interface UserTicketDetailProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserTicketDetail({ ticket, isOpen, onClose }: UserTicketDetailProps) {
  return (
    <DetailPanel
      isOpen={isOpen && !!ticket}
      onClose={onClose}
      title={ticket?.subject ?? ''}
      subtitle={ticket ? `#${ticket.id}` : undefined}
      icon={LifeBuoy}
      actions={ticket && ticket.status !== 'CLOSED' ? (
        <UserMessageInput ticketId={ticket.id} />
      ) : undefined}
    >
      {ticket && <UserTicketDetailContent ticket={ticket} onClose={onClose} />}
    </DetailPanel>
  );
}

// ─── Message Input (rendered in DetailPanel actions slot) ───
function UserMessageInput({ ticketId }: { ticketId: number }) {
  const { t } = useTranslation();
  const sendMessageMutation = useSendMessage();
  const [newMessage, setNewMessage] = React.useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({
        id: ticketId,
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

  return (
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
  );
}

// ─── Content (rendered inside DetailPanel children slot) ───
function UserTicketDetailContent({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();
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

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages?.length]);

  return (
    <div className="space-y-4">
      {/* Actions (edit/delete for OPEN tickets) */}
      {ticket.status === 'OPEN' && (
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

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium border',
            STATUS_STYLES[ticket.status]
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

      {/* Dates */}
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

      {/* Conversation thread */}
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
            <AlertCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">{t('support.noMessages')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
