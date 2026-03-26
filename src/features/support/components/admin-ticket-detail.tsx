'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  MessageSquare,
  Clock,
  AlertCircle,
  Send,
  User,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Textarea } from '@/components/ui';
import { DetailPanelContent } from '@/components/modules/shared/detail-panel';
import { useSendAdminMessage, useUpdateTicketStatus, useUpdateTicketPriority } from '../hooks';
import { STATUS_STYLES, PRIORITY_STYLES } from '../config';
import { Badge } from '@/components/modules/shared';
import type { SupportTicket, TicketStatus, TicketPriority } from '../types';
import { ticketStatusLabel, ticketPriorityLabel, ticketCategoryLabel } from '../types';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN TICKET DETAIL - Detail panel for admin support ticket management
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface AdminTicketDetailProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export function AdminTicketDetail({ ticket }: AdminTicketDetailProps) {
  return (
    <DetailPanelContent
      title={ticket.subject}
      subtitle={`#${ticket.id}`}
      actions={ticket.status !== 'CLOSED' ? (
        <AdminMessageInput ticketId={ticket.id} />
      ) : undefined}
    >
      <AdminTicketDetailContent ticket={ticket} />
    </DetailPanelContent>
  );
}

// ─── Message Input ───
function AdminMessageInput({ ticketId }: { ticketId: number }) {
  const { t } = useTranslation();
  const sendMessageMutation = useSendAdminMessage();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({
        id: ticketId,
        data: { content: newMessage.trim() },
      });
      setNewMessage('');
      toast({ title: t('adminSupport.responseSent') });
    } catch {
      toast({ title: t('adminSupport.responseError'), variant: 'destructive' });
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
        placeholder={t('adminSupport.responsePlaceholder')}
        rows={2}
        className="flex-1 border-border/40 bg-card resize-none"
      />
      <Button
        size="sm"
        onClick={handleSendMessage}
        disabled={!newMessage.trim() || sendMessageMutation.isPending}
        className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white gap-1.5 shrink-0"
      >
        <Send className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ─── Content ───
function AdminTicketDetailContent({ ticket }: { ticket: SupportTicket }) {
  const { t } = useTranslation();
  const statusMutation = useUpdateTicketStatus();
  const priorityMutation = useUpdateTicketPriority();
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

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await statusMutation.mutateAsync({ id: ticket.id, status });
      toast({ title: t('adminSupport.statusUpdated') });
    } catch {
      toast({ title: t('adminSupport.statusError'), variant: 'destructive' });
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    try {
      await priorityMutation.mutateAsync({ id: ticket.id, priority });
      toast({ title: t('adminSupport.priorityUpdated') });
    } catch {
      toast({ title: t('adminSupport.priorityError'), variant: 'destructive' });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages?.length]);

  const statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/40 bg-card p-3 space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{ticket.ownerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{ticket.ownerEmail}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn('border', STATUS_STYLES[ticket.status])} size="sm">
          {ticketStatusLabel(ticket.status, t)}
        </Badge>
        <Badge className={cn(PRIORITY_STYLES[ticket.priority])} size="sm">
          {ticketPriorityLabel(ticket.priority, t)}
        </Badge>
        <Badge variant="secondary" size="sm">
          {ticketCategoryLabel(ticket.category, t)}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('adminSupport.changeStatus')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={statusMutation.isPending || ticket.status === status}
              className={cn(
                'chip-base px-3 py-1.5 text-xs',
                ticket.status === status ? 'chip-active' : 'chip-inactive'
              )}
            >
              {ticketStatusLabel(status, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('adminSupport.changePriority')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              disabled={priorityMutation.isPending || ticket.priority === priority}
              className={cn(
                'chip-base px-3 py-1.5 text-xs',
                ticket.priority === priority ? 'chip-active' : 'chip-inactive'
              )}
            >
              {ticketPriorityLabel(priority, t)}
            </button>
          ))}
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
