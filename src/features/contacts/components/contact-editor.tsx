'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateContact } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { contactFormSchema, type ContactFormData } from '../schema';
import type { Contact } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT EDITOR - Create a contact
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

interface ContactEditorProps {
  onSaved: (contact: Contact) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function ContactEditor({ onSaved, onCancel, moduleKey }: ContactEditorProps) {
  const { t } = useTranslation();

  const { form, clearDraft } = useDraftForm<ContactFormData>({
    moduleKey,
    schema: contactFormSchema,
    defaults: { firstName: '', lastName: '', email: '', phone: '', organization: '', jobTitle: '', notes: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const createContact = useCreateContact();
  const { log } = useActivityLog();
  const isPending = createContact.isPending;

  const onSubmit = async (data: ContactFormData) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        organization: data.organization || undefined,
        jobTitle: data.jobTitle || undefined,
        notes: data.notes || undefined,
      };

      const result = await createContact.mutateAsync(payload);
      log({ type: 'action', message: t('activity.contacts.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
      clearDraft();
      onSaved(result);
      toast({ title: t('contacts.created') });
    } catch {
      toast({ title: t('contacts.saveError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 min-h-0"
    >
      <SidebarFormBody>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <SidebarFormField label={t('contacts.firstName')} error={errors.firstName?.message ? t(errors.firstName.message) : undefined}>
            <Input
              {...register('firstName')}
              placeholder={t('contacts.firstNamePlaceholder')}
              className="bg-card border-border/40"
              autoFocus
            />
          </SidebarFormField>
          <SidebarFormField label={t('contacts.lastName')}>
            <Input
              {...register('lastName')}
              placeholder={t('contacts.lastNamePlaceholder')}
              className="bg-card border-border/40"
            />
          </SidebarFormField>
        </div>

        {/* Email */}
        <SidebarFormField label={t('contacts.email')} error={errors.email?.message ? t(errors.email.message) : undefined}>
          <Input
            {...register('email')}
            type="email"
            placeholder={t('contacts.emailPlaceholder')}
            className="bg-card border-border/40"
          />
        </SidebarFormField>

        {/* Phone */}
        <SidebarFormField label={t('contacts.phone')}>
          <Input
            {...register('phone')}
            type="tel"
            placeholder={t('contacts.phonePlaceholder')}
            className="bg-card border-border/40"
          />
        </SidebarFormField>

        {/* Organization + Job title row */}
        <div className="grid grid-cols-2 gap-3">
          <SidebarFormField label={t('contacts.organization')}>
            <Input
              {...register('organization')}
              placeholder={t('contacts.organizationPlaceholder')}
              className="bg-card border-border/40"
            />
          </SidebarFormField>
          <SidebarFormField label={t('contacts.jobTitle')}>
            <Input
              {...register('jobTitle')}
              placeholder={t('contacts.jobTitlePlaceholder')}
              className="bg-card border-border/40"
            />
          </SidebarFormField>
        </div>

        {/* Notes */}
        <SidebarFormField label={t('contacts.notes')}>
          <Textarea
            {...register('notes')}
            placeholder={t('contacts.notesPlaceholder')}
            rows={4}
            className="border-border/40 bg-card"
          />
        </SidebarFormField>
      </SidebarFormBody>

      {/* Actions */}
      <SidebarFormActions>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
          {t('contacts.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isPending ? t('common.loading') : t('contacts.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
