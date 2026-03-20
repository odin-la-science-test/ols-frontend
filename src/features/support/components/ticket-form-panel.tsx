'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PenLine } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DetailPanel } from '@/components/modules/shared/detail-panel';
import { useCreateTicket } from '../hooks';
import { useTicketFormStore } from '../ticket-form-store';
import { toast } from '@/hooks';
import type { TicketCategory } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET FORM PANEL - Slide-in panel for creating a new support ticket
// Uses shared DetailPanel + store for consistent behavior
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

export function TicketFormPanel() {
  const { t } = useTranslation();
  const { isOpen, close } = useTicketFormStore();
  const createTicket = useCreateTicket();

  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<TicketCategory>('QUESTION');

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0;

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCategory('QUESTION');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createTicket.mutateAsync({ subject, description, category });
      toast({ title: t('support.created') });
      resetForm();
      close();
    } catch {
      toast({ title: t('support.saveError'), variant: 'destructive' });
    }
  };

  // Reset form when panel opens
  React.useEffect(() => {
    if (isOpen) resetForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <DetailPanel
      isOpen={isOpen}
      onClose={close}
      title={t('support.createTitle')}
      icon={PenLine}
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={close} disabled={createTicket.isPending}>
            {t('support.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit || createTicket.isPending}
            className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
          >
            {t('support.submit')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('support.category')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                  category === cat
                    ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent)]/10 text-[var(--module-accent)]'
                    : 'border-border/40 bg-card text-muted-foreground hover:border-border/60 hover:text-foreground'
                }`}
              >
                {t(`support.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('support.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('support.descriptionPlaceholder')}
            rows={8}
            className="w-full rounded-lg border border-border/40 bg-card px-3 py-2 text-sm resize-y placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)] transition-colors"
          />
        </div>
      </div>
    </DetailPanel>
  );
}
