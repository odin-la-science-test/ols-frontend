'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import { InlineText, InlineTextarea } from '@/components/modules/shared/inline-fields';
import { useInlineAutoSave } from '@/hooks/use-inline-auto-save';
import { useDeleteContact, useUpdateContact, useContactDetail } from '../hooks';
import { toast } from '@/hooks';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
import type { Contact, UpdateContactRequest } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT DETAIL PANEL — Inline editable, auto-save on blur
// ═══════════════════════════════════════════════════════════════════════════

interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  jobTitle: string;
  notes: string;
}

interface ContactDetailPanelProps {
  contact: Contact;
  onClose: () => void;
  onEdit?: () => void;
}

export function ContactDetailPanel({ contact: initialContact, onClose }: ContactDetailPanelProps) {
  // Get fresh data from React Query cache (refreshes after undo/redo invalidation)
  const { data: freshContact } = useContactDetail(initialContact.id);
  const contact = freshContact ?? initialContact;

  const { t } = useTranslation();
  const deleteMutation = useDeleteContact();
  const updateMutation = useUpdateContact();
  const { log } = useActivityLog();

  const form = useForm<ContactFormValues>({
    defaultValues: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      organization: contact.organization ?? '',
      jobTitle: contact.jobTitle ?? '',
      notes: contact.notes ?? '',
    },
  });

  const { handleFieldBlur, saveStatus } = useInlineAutoSave<ContactFormValues, UpdateContactRequest>({
    form,
    updateMutation,
    entityId: contact.id,
    entityValues: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      organization: contact.organization ?? '',
      jobTitle: contact.jobTitle ?? '',
      notes: contact.notes ?? '',
    },
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(contact.id);
    log({ type: 'action', message: t('activity.contacts.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
    toast({ title: t('contacts.deleted') });
    onClose();
  };

  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || '—';
  const subtitle = contact.jobTitle || contact.organization || undefined;

  return (
    <DetailPanelContent
      title={name}
      subtitle={subtitle}
      badge={
        contact.isAppUser ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--module-accent-subtle)] text-[var(--module-accent)] font-medium">
            OLS
          </span>
        ) : undefined
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Editable fields */}
        <InlineText
          label={t('contacts.firstName')}
          registration={form.register('firstName')}
          onFieldBlur={() => handleFieldBlur('firstName' as never)}
          placeholder={t('contacts.firstNamePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineText
          label={t('contacts.lastName')}
          registration={form.register('lastName')}
          onFieldBlur={() => handleFieldBlur('lastName' as never)}
          placeholder={t('contacts.lastNamePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineText
          label={t('contacts.email')}
          registration={form.register('email')}
          onFieldBlur={() => handleFieldBlur('email' as never)}
          placeholder={t('contacts.emailPlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineText
          label={t('contacts.phone')}
          registration={form.register('phone')}
          onFieldBlur={() => handleFieldBlur('phone' as never)}
          placeholder={t('contacts.phonePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineText
          label={t('contacts.organization')}
          registration={form.register('organization')}
          onFieldBlur={() => handleFieldBlur('organization' as never)}
          placeholder={t('contacts.organizationPlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineText
          label={t('contacts.jobTitle')}
          registration={form.register('jobTitle')}
          onFieldBlur={() => handleFieldBlur('jobTitle' as never)}
          placeholder={t('contacts.jobTitlePlaceholder')}
          saveStatus={saveStatus}
        />

        <InlineTextarea
          label={t('contacts.notes')}
          registration={form.register('notes')}
          onFieldBlur={() => handleFieldBlur('notes' as never)}
          placeholder={t('contacts.notesPlaceholder')}
          rows={4}
        />

        {/* Read-only metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('contacts.createdAt')} value={formatDate(contact.createdAt)} />
          <DetailRow label={t('contacts.updatedAt')} value={formatDate(contact.updatedAt)} />
        </DetailSection>
      </div>
    </DetailPanelContent>
  );
}
