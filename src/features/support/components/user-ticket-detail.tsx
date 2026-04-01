'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { useTranslation } from 'react-i18next';
import {
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
import { Button, Textarea } from '@/components/ui';
import { DetailPanelContent } from '@/components/modules/shared/detail-panel';
import { useDeleteTicket, useSendMessage } from '../hooks';
import { getStatusVariant } from '../config';
import { Badge } from '@/components/modules/shared';
import type { SupportTicket } from '../types';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// USER TICKET DETAIL - Detail panel for user support tickets
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface UserTicketDetailProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export function UserTicketDetail({ ticket, onClose }: UserTicketDetailProps) {
  return (
    <DetailPanelContent
      title={ticket.subject}
      subtitle={`#${ticket.id}`}
      actions={ticket.status !== 'CLOSED' ? (
        <UserMessageInput ticketId={ticket.id} />
      ) : undefined}
    >
      <UserTicketDetailContent ticket={ticket} onClose={onClose} />
    </DetailPanelContent>
  );
}

// ─── Message Input (rendered in DetailPanelContent actions slot) ───
function UserMessageInput({ ticketId }: { ticketId: number }) {
  const { t } = useTranslation();
  const sendMessageMutation = useSendMessage();
  const [newMessage, setNewMessage] = useState('');

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
  );
}

// ─── Content ───
function UserTicketDetailContent({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();
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
    deleteMutation.mutate(ticket.id, {
      onSuccess: () => {
        toast({ title: t('support.deleted') });
        onClose();
      },
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages?.length]);

  return (
    <div className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getStatusVariant(ticket.status)} size="sm">
          {ticketStatusLabel(ticket.status, t)}
        </Badge>
        <Badge variant="secondary" size="sm">
          {ticketCategoryLabel(ticket.category, t)}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Tag className="w-3 h-3" />
          {t('support.description')}
        </label>
        <div className="rounded-lg border border-border/40 bg-card p-3">
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

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
