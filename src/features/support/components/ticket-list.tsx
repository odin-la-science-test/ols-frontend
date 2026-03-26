'use client';

import { type MouseEvent } from 'react';

import { useTranslation } from 'react-i18next';
import { Trash2, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { EmptyState, ListSkeleton, Badge } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { motion } from 'framer-motion';
import type { SupportTicket } from '../types';
import { ticketStatusLabel, ticketCategoryLabel } from '../types';
import { useDeleteTicket } from '../hooks';
import { toast } from '@/hooks';
import { STATUS_STYLES } from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET LIST - Grid of user's support tickets
// ═══════════════════════════════════════════════════════════════════════════

interface TicketListProps {
  tickets: SupportTicket[];
  isLoading: boolean;
  onSelectTicket: (ticket: SupportTicket) => void;
  selectedTicketId?: number | null;
}

export function TicketList({ tickets, isLoading, onSelectTicket, selectedTicketId }: TicketListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <ListSkeleton layout="list" count={4} itemHeight="h-24" />;
  }

  if (tickets.length === 0) {
    return <EmptyState icon={MessageSquare} title={t('support.emptyTitle')} description={t('support.emptyDesc')} />;
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket, index) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          index={index}
          isSelected={selectedTicketId === ticket.id}
          onSelect={() => onSelectTicket(ticket)}
        />
      ))}
    </div>
  );
}

// ─── Individual ticket card ───

interface TicketCardProps {
  ticket: SupportTicket;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function TicketCard({ ticket, index, isSelected, onSelect }: TicketCardProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteTicket();

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(ticket.id, {
      onSuccess: () => toast({ title: t('support.deleted') }),
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onSelect}
      className={cn(
        'group flex flex-col p-4 rounded-lg cursor-pointer',
        'border border-border/40 bg-card',
        'hover:bg-card hover:border-border/60 transition-all duration-200',
        isSelected && 'ring-1 ring-[var(--module-accent)] border-border/60'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold line-clamp-1">{ticket.subject}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {ticket.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {ticket.status === 'OPEN' && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="p-1 rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{t('support.delete')}</TooltipContent>
            </Tooltip>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center gap-2 mt-auto">
        <Badge className={cn('text-[10px] border', STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN)} size="sm">
          {ticketStatusLabel(ticket.status, t)}
        </Badge>
        <Badge variant="secondary" size="sm" className="text-[10px]">
          {ticketCategoryLabel(ticket.category, t)}
        </Badge>

        <div className="flex-1" />

        {ticket.messages && ticket.messages.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--module-accent)]">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            <span>{ticket.messages.length}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
