'use client';

import { useTranslation } from 'react-i18next';
import { Star, Pencil, Trash2, Clock, Mail, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { DetailPanelContent, DetailSection, DetailRow } from '@/components/modules/shared';
import type { Contact } from '../types';
import { useDeleteContact, useCreateContact, useToggleFavorite } from '../hooks';
import { toast } from '@/hooks';
import { useHistory } from '@/hooks/use-history';
import { useActivityLog } from '@/hooks/use-activity-log';
import { HUGIN_PRIMARY } from '@/lib/accent-colors';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT DETAIL PANEL - View details of a contact
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface ContactDetailPanelProps {
  contact: Contact;
  onClose: () => void;
  onEdit?: () => void;
}

export function ContactDetailPanel({ contact, onClose, onEdit }: ContactDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteContact();
  const createMutation = useCreateContact();
  const toggleFavMutation = useToggleFavorite();
  const { pushCommand } = useHistory();
  const { log } = useActivityLog();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    const snapshot = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      organization: contact.organization ?? undefined,
      jobTitle: contact.jobTitle ?? undefined,
      notes: contact.notes ?? undefined,
    };
    pushCommand({
      labelKey: 'history.contacts.delete',
      icon: 'trash-2',
      execute: async () => {
        await deleteMutation.mutateAsync(contact.id);
        log({ type: 'action', message: t('activity.contacts.delete'), icon: 'trash-2', accentColor: HUGIN_PRIMARY });
        toast({ title: t('contacts.deleted') });
        onClose();
      },
      undo: async () => {
        await createMutation.mutateAsync(snapshot);
        toast({ title: t('history.undo') });
      },
    });
  };

  const handleToggleFavorite = () => {
    pushCommand({
      labelKey: 'history.contacts.toggleFavorite',
      icon: 'star',
      execute: async () => {
        await toggleFavMutation.mutateAsync(contact.id);
        log({ type: 'action', message: t('activity.contacts.toggleFavorite'), icon: 'star', accentColor: HUGIN_PRIMARY });
      },
      undo: async () => {
        await toggleFavMutation.mutateAsync(contact.id);
      },
    });
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
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-7 text-xs">
              <Pencil className="w-3 h-3" />
              {t('contacts.edit')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn('gap-1.5 h-7 text-xs', contact.favorite && 'text-amber-500')}
          >
            <Star className="w-3 h-3" fill={contact.favorite ? 'currentColor' : 'none'} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Contact info */}
        <DetailSection title={t('contacts.title')} icon={Mail}>
          {contact.email && (
            <DetailRow label={t('contacts.email')} value={contact.email} copyable />
          )}
          {contact.phone && (
            <DetailRow label={t('contacts.phone')} value={contact.phone} copyable />
          )}
          {contact.organization && (
            <DetailRow label={t('contacts.organization')} value={contact.organization} />
          )}
          {contact.jobTitle && (
            <DetailRow label={t('contacts.jobTitle')} value={contact.jobTitle} />
          )}
        </DetailSection>

        {/* Metadata */}
        <DetailSection title="Informations" icon={Clock}>
          <DetailRow label={t('contacts.createdAt')} value={formatDate(contact.createdAt)} />
          <DetailRow label={t('contacts.updatedAt')} value={formatDate(contact.updatedAt)} />
        </DetailSection>

        {/* Notes */}
        {contact.notes && (
          <DetailSection title={t('contacts.notes')} icon={StickyNote}>
            <div className={cn(
              'rounded-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] bg-card p-4',
              'text-sm whitespace-pre-wrap leading-relaxed'
            )}>
              {contact.notes}
            </div>
          </DetailSection>
        )}
      </div>
    </DetailPanelContent>
  );
}
