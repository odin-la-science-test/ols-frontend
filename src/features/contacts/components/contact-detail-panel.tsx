'use client';

import { useTranslation } from 'react-i18next';
import { Star, Pencil, Trash2, Clock, Mail, Phone, Building2, Briefcase, StickyNote, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import type { Contact } from '../types';
import { useDeleteContact, useToggleFavorite } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT DETAIL PANEL - View details of a contact
// ═══════════════════════════════════════════════════════════════════════════

interface ContactDetailPanelProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
}

export function ContactDetailPanel({ contact, onClose, onEdit }: ContactDetailPanelProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteContact();
  const toggleFavMutation = useToggleFavorite();

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
    deleteMutation.mutate(contact.id, {
      onSuccess: () => {
        toast({ title: t('contacts.deleted') });
        onClose();
      },
    });
  };

  const handleToggleFavorite = () => {
    toggleFavMutation.mutate(contact.id);
  };

  const initials = `${(contact.firstName || '').charAt(0)}${(contact.lastName || '').charAt(0)}`.toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold',
          contact.isAppUser
            ? 'bg-[var(--module-accent-muted)] text-[var(--module-accent)]'
            : 'bg-muted/60 text-muted-foreground'
        )}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">
            {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || '—'}
          </h3>
          {contact.jobTitle && (
            <p className="text-xs text-muted-foreground truncate">{contact.jobTitle}</p>
          )}
        </div>

        {contact.isAppUser && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--module-accent-subtle)] text-[var(--module-accent)] font-medium shrink-0">
            OLS
          </span>
        )}

        <button onClick={onClose} className="p-1 rounded hover:bg-muted/80 transition-colors hidden lg:block">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t('contacts.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn('gap-1.5', contact.favorite && 'text-amber-500')}
          >
            <Star className="w-3.5 h-3.5" fill={contact.favorite ? 'currentColor' : 'none'} />
            {contact.favorite ? t('contacts.unfavorite') : t('contacts.favorite')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('contacts.delete')}
          </Button>
        </div>

        {/* Contact info fields */}
        <div className="space-y-3">
          {contact.email && (
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('contacts.email')}</p>
                <a href={`mailto:${contact.email}`} className="text-sm font-medium hover:text-[var(--module-accent)] transition-colors">
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('contacts.phone')}</p>
                <a href={`tel:${contact.phone}`} className="text-sm font-medium hover:text-[var(--module-accent)] transition-colors">
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {contact.organization && (
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('contacts.organization')}</p>
                <p className="text-sm font-medium">{contact.organization}</p>
              </div>
            </div>
          )}

          {contact.jobTitle && (
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('contacts.jobTitle')}</p>
                <p className="text-sm font-medium">{contact.jobTitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('contacts.createdAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(contact.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              {t('contacts.updatedAt')}
            </div>
            <p className="text-sm font-medium">{formatDate(contact.updatedAt)}</p>
          </div>
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <StickyNote className="w-3 h-3" />
              {t('contacts.notes')}
            </label>
            <div className={cn(
              'rounded-lg border border-border/40 bg-card p-4',
              'text-sm whitespace-pre-wrap leading-relaxed'
            )}>
              {contact.notes}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
