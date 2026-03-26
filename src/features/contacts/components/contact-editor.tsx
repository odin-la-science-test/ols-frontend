'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '@/components/ui';
import { motion } from 'framer-motion';
import { SidebarFormBody, SidebarFormField, SidebarFormActions } from '@/components/modules/shared';
import { useCreateContact, useUpdateContact, useDeleteContact } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import { useDraftForm } from '@/hooks/use-draft-form';
import { contactFormSchema, type ContactFormData } from '../schema';
import type { Contact } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT EDITOR - Create or edit a contact
// Uses useDraftForm for RHF + Zod validation + auto-draft persistence
// ═══════════════════════════════════════════════════════════════════════════

interface ContactEditorProps {
  /** Contact existant à éditer (null = création) */
  contact?: Contact | null;
  onSaved: (contact: Contact) => void;
  onCancel: () => void;
  moduleKey: string;
}

export function ContactEditor({ contact, onSaved, onCancel, moduleKey }: ContactEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!contact;

  const { form, clearDraft } = useDraftForm<ContactFormData>({
    moduleKey,
    schema: contactFormSchema,
    defaults: { firstName: '', lastName: '', email: '', phone: '', organization: '', jobTitle: '', notes: '' },
    entityValues: contact ? {
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      organization: contact.organization ?? '',
      jobTitle: contact.jobTitle ?? '',
      notes: contact.notes ?? '',
    } : undefined,
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();
  const isPending = createContact.isPending || updateContact.isPending;

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

      if (isEditing && contact) {
        const previousData = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
          organization: contact.organization ?? undefined,
          jobTitle: contact.jobTitle ?? undefined,
          notes: contact.notes ?? undefined,
        };
        await pushCommand({
          labelKey: 'history.contacts.update',
          icon: 'pencil',
          execute: async () => {
            const result = await updateContact.mutateAsync({ id: contact.id, data: payload });
            log({ type: 'action', message: t('activity.contacts.update'), icon: 'pencil', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('contacts.updated') });
          },
          undo: async () => {
            await updateContact.mutateAsync({ id: contact.id, data: previousData });
            toast({ title: t('history.undo') });
          },
        });
      } else {
        let createdId: number | null = null;
        await pushCommand({
          labelKey: 'history.contacts.create',
          icon: 'plus',
          execute: async () => {
            const result = await createContact.mutateAsync(payload);
            createdId = result.id;
            log({ type: 'action', message: t('activity.contacts.create'), icon: 'plus', accentColor: HUGIN_PRIMARY });
            clearDraft();
            onSaved(result);
            toast({ title: t('contacts.created') });
          },
          undo: async () => {
            if (createdId) {
              await deleteContact.mutateAsync(createdId);
              toast({ title: t('history.undo') });
            }
          },
        });
      }
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
          {isPending ? t('common.loading') : isEditing ? t('contacts.save') : t('contacts.create')}
        </Button>
      </SidebarFormActions>
    </motion.div>
  );
}
