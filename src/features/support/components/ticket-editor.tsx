'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { useCreateTicket, useUpdateTicket } from '../hooks';
import { toast } from '@/hooks';
import type { SupportTicket, TicketCategory } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET EDITOR - Create or edit a support ticket
// ═══════════════════════════════════════════════════════════════════════════

interface TicketEditorProps {
  /** Existing ticket to edit (null = create) */
  ticket?: SupportTicket | null;
  onSaved: (ticket: SupportTicket) => void;
  onCancel: () => void;
}

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

export function TicketEditor({ ticket, onSaved, onCancel }: TicketEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!ticket;

  const [subject, setSubject] = React.useState(ticket?.subject || '');
  const [description, setDescription] = React.useState(ticket?.description || '');
  const [category, setCategory] = React.useState<TicketCategory>(ticket?.category || 'QUESTION');

  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const isPending = createTicket.isPending || updateTicket.isPending;

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (isEditing && ticket) {
        const result = await updateTicket.mutateAsync({
          id: ticket.id,
          data: { subject, description, category },
        });
        onSaved(result);
        toast({ title: t('support.updated') });
      } else {
        const result = await createTicket.mutateAsync({
          subject,
          description,
          category,
        });
        onSaved(result);
        toast({ title: t('support.created') });
      }
    } catch {
      toast({ title: t('support.saveError'), variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('support.subject')}
        </label>
        <Input
          placeholder={t('support.subjectPlaceholder')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-card border-border/40"
          autoFocus
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('support.category')}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className="w-full rounded-lg border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)] transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`support.categories.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('support.description')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('support.descriptionPlaceholder')}
          rows={6}
          className="w-full rounded-lg border border-border/40 bg-card px-3 py-2 text-sm resize-y placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          {t('support.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isEditing ? t('support.save') : t('support.submit')}
        </Button>
      </div>
    </motion.div>
  );
}
