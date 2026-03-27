'use client';

import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Button, Input, Textarea } from '@/components/ui';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useCreateTicket } from '../hooks';
import { toast } from '@/hooks';
import { useDraftForm } from '@/hooks/use-draft-form';
import { ticketFormSchema, type TicketFormData } from '../schema';
import type { SupportTicket, TicketCategory } from '../types';
import { ticketCategoryLabel } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TICKET FORM - Editor for creating support tickets
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'ACCOUNT', 'OTHER'];

interface TicketFormProps {
  onSaved: (item: SupportTicket) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function TicketForm({ onSaved, onCancel, moduleKey }: TicketFormProps) {
  const { t } = useTranslation();
  const createTicket = useCreateTicket();

  const { form, clearDraft } = useDraftForm<TicketFormData>({
    moduleKey,
    schema: ticketFormSchema,
    defaults: { subject: '', description: '', category: 'QUESTION' },
  });

  const { register, control, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: TicketFormData) => {
    try {
      const result = await createTicket.mutateAsync(data);
      clearDraft();
      toast({ title: t('support.created') });
      onSaved(result);
    } catch {
      toast({ title: t('support.saveError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <>
      <SidebarFormBody>
        <SidebarFormField label={t('support.subject')} error={errors.subject?.message ? t(errors.subject.message) : undefined}>
          <Input
            {...register('subject')}
            placeholder={t('support.subjectPlaceholder')}
            className="bg-card border-border/40"
            autoFocus
          />
        </SidebarFormField>

        <SidebarFormField label={t('support.category')}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => field.onChange(cat)}
                    className={cn(
                      'chip-base px-3 py-1.5 text-xs',
                      field.value === cat ? 'chip-active' : 'chip-inactive'
                    )}
                  >
                    {ticketCategoryLabel(cat, t)}
                  </button>
                ))}
              </div>
            )}
          />
        </SidebarFormField>

        <SidebarFormField label={t('support.description')} error={errors.description?.message ? t(errors.description.message) : undefined}>
          <Textarea
            {...register('description')}
            placeholder={t('support.descriptionPlaceholder')}
            rows={8}
            className="border-border/40 bg-card"
          />
        </SidebarFormField>
      </SidebarFormBody>

      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={createTicket.isPending}>
          {t('support.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={createTicket.isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {createTicket.isPending ? t('common.loading') : t('support.submit')}
        </Button>
      </SidebarFormActions>
    </>
  );
}
