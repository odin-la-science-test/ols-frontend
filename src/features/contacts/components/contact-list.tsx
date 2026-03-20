'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trash2, Building2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Contact } from '../types';
import { useDeleteContact, useToggleFavorite } from '../hooks';
import { toast } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT LIST - Grid of user's contacts
// ═══════════════════════════════════════════════════════════════════════════

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: number | null;
}

export function ContactList({ contacts, isLoading, onSelectContact, selectedContactId }: ContactListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{t('contacts.emptyTitle')}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{t('contacts.emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {contacts.map((contact, index) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          index={index}
          isSelected={selectedContactId === contact.id}
          onSelect={() => onSelectContact(contact)}
        />
      ))}
    </div>
  );
}

// ─── Individual contact card ───

interface ContactCardProps {
  contact: Contact;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function ContactCard({ contact, index, isSelected, onSelect }: ContactCardProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteContact();
  const toggleFavMutation = useToggleFavorite();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(contact.id, {
      onSuccess: () => toast({ title: t('contacts.deleted') }),
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavMutation.mutate(contact.id);
  };

  const initials = `${(contact.firstName || '').charAt(0)}${(contact.lastName || '').charAt(0)}`.toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onSelect}
      className={cn(
        'group flex flex-col p-3 rounded-lg cursor-pointer',
        'border border-border/40 bg-card',
        'hover:bg-card hover:border-border/60 transition-all duration-200',
        isSelected && 'ring-1 ring-[var(--module-accent)] border-border/60'
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-2">
        {/* Avatar */}
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold',
          contact.isAppUser
            ? 'bg-[var(--module-accent-muted)] text-[var(--module-accent)]'
            : 'bg-muted/60 text-muted-foreground'
        )}>
          {initials}
        </div>

        {/* Name + title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold line-clamp-1">
            {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || '—'}
          </h3>
          {contact.jobTitle && (
            <p className="text-xs text-muted-foreground line-clamp-1">{contact.jobTitle}</p>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'p-1 rounded-md transition-colors',
              contact.favorite
                ? 'text-amber-500'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={contact.favorite ? t('contacts.unfavorite') : t('contacts.favorite')}
          >
            <Star className="w-3.5 h-3.5" strokeWidth={1.5} fill={contact.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
            title={t('contacts.delete')}
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-1 mt-auto">
        {contact.organization && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{contact.organization}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
      </div>

      {/* Footer badges */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {contact.favorite && (
            <Star className="w-3 h-3 text-amber-500" strokeWidth={1.5} fill="currentColor" />
          )}
          {contact.isAppUser && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--module-accent-subtle)] text-[var(--module-accent)] font-medium">
              OLS
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
