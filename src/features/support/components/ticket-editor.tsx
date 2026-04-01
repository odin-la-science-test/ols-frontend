'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { useCreateTicket } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import type { SupportTicket, TicketCategory } from '../types';
import { ticketCategoryLabel } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET EDITOR - Create a support ticket
// ═══════════════════════════════════════════════════════════════════════════

interface TicketEditorProps {
  onSaved: (ticket: SupportTicket) => void;
  onCancel: () => void;
}

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

export function TicketEditor({ onSaved, onCancel }: TicketEditorProps) {
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('QUESTION');

  const createTicket = useCreateTicket();
  const { log } = useActivityLog();
  const isPending = createTicket.isPending;

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const result = await createTicket.mutateAsync({
        subject,
        description,
        category,
      });
      log({ type: 'action', message: t('activity.support.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
      onSaved(result);
      toast({ title: t('support.created') });
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
              {ticketCategoryLabel(cat, t)}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('support.description')}
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('support.descriptionPlaceholder')}
          rows={6}
          className="border-border/40 bg-card"
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
          {t('support.submit')}
        </Button>
      </div>
    </motion.div>
  );
}
