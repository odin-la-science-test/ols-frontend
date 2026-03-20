'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { useCreateContact, useUpdateContact } from '../hooks';
import { toast } from '@/hooks';
import type { Contact } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT EDITOR - Create or edit a contact
// ═══════════════════════════════════════════════════════════════════════════

interface ContactEditorProps {
  /** Contact existant à éditer (null = création) */
  contact?: Contact | null;
  onSaved: (contact: Contact) => void;
  onCancel: () => void;
}

export function ContactEditor({ contact, onSaved, onCancel }: ContactEditorProps) {
  const { t } = useTranslation();
  const isEditing = !!contact;

  const [firstName, setFirstName] = React.useState(contact?.firstName || '');
  const [lastName, setLastName] = React.useState(contact?.lastName || '');
  const [email, setEmail] = React.useState(contact?.email || '');
  const [phone, setPhone] = React.useState(contact?.phone || '');
  const [organization, setOrganization] = React.useState(contact?.organization || '');
  const [jobTitle, setJobTitle] = React.useState(contact?.jobTitle || '');
  const [notes, setNotes] = React.useState(contact?.notes || '');

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isPending = createContact.isPending || updateContact.isPending;

  const canSubmit = firstName.trim().length > 0 || lastName.trim().length > 0 || email.trim().length > 0 || phone.trim().length > 0 || organization.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (isEditing && contact) {
        const result = await updateContact.mutateAsync({
          id: contact.id,
          data: {
            firstName,
            lastName,
            email: email || undefined,
            phone: phone || undefined,
            organization: organization || undefined,
            jobTitle: jobTitle || undefined,
            notes: notes || undefined,
          },
        });
        onSaved(result);
        toast({ title: t('contacts.updated') });
      } else {
        const result = await createContact.mutateAsync({
          firstName,
          lastName,
          email: email || undefined,
          phone: phone || undefined,
          organization: organization || undefined,
          jobTitle: jobTitle || undefined,
          notes: notes || undefined,
        });
        onSaved(result);
        toast({ title: t('contacts.created') });
      }
    } catch {
      toast({ title: t('contacts.saveError'), variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t('contacts.firstName')}
          </label>
          <Input
            placeholder={t('contacts.firstNamePlaceholder')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-card border-border/40"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t('contacts.lastName')}
          </label>
          <Input
            placeholder={t('contacts.lastNamePlaceholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-card border-border/40"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('contacts.email')}
        </label>
        <Input
          type="email"
          placeholder={t('contacts.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-card border-border/40"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('contacts.phone')}
        </label>
        <Input
          type="tel"
          placeholder={t('contacts.phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-card border-border/40"
        />
      </div>

      {/* Organization + Job title row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t('contacts.organization')}
          </label>
          <Input
            placeholder={t('contacts.organizationPlaceholder')}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="bg-card border-border/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t('contacts.jobTitle')}
          </label>
          <Input
            placeholder={t('contacts.jobTitlePlaceholder')}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="bg-card border-border/40"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {t('contacts.notes')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('contacts.notesPlaceholder')}
          rows={4}
          className="w-full rounded-lg border border-border/40 bg-card px-3 py-2 text-sm resize-y placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--module-accent)] focus:border-[var(--module-accent)] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          {t('contacts.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
        >
          {isEditing ? t('contacts.save') : t('contacts.create')}
        </Button>
      </div>
    </motion.div>
  );
}
