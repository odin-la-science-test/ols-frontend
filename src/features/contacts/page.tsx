'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactRound, Plus, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { GridsBackground } from '@/components/common';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useMyContacts, useSearchContacts } from './hooks';
import { ContactList, ContactEditor, ContactDetailPanel } from './components';
import type { Contact } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS PAGE - Hugin Lab contacts module
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const PRIMARY = HUGIN_PRIMARY;
const ACCENT = HUGIN_PRIMARY;

type ViewMode = 'list' | 'create' | 'edit';

export function ContactsPage() {
  const { t } = useTranslation();
  const { data: contacts = [], isLoading } = useMyContacts();

  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: searchResults } = useSearchContacts(searchQuery);

  const displayedContacts = searchQuery.length >= 2 ? (searchResults || []) : contacts;

  const handleCreated = (contact: Contact) => {
    setViewMode('list');
    setSelectedContact(contact);
  };

  const handleUpdated = (contact: Contact) => {
    setViewMode('list');
    setSelectedContact(contact);
  };

  const handleEditContact = () => {
    if (selectedContact) {
      setViewMode('edit');
    }
  };

  const style = {
    '--module-accent': ACCENT,
    '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
    '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
    '--color-ring': PRIMARY,
    '--color-primary': PRIMARY,
  } as React.CSSProperties;

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={style}>
      <GridsBackground />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card border-b border-border/40">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Link to="/lab" className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors lg:hidden">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <div className="flex items-center gap-2">
                <ContactRound className="w-5 h-5 text-[var(--module-accent)]" strokeWidth={1.5} />
                <h1 className="text-lg font-semibold">{t('contacts.title')}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              {viewMode === 'list' && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t('contacts.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 w-48 bg-card border-border/40 text-xs"
                  />
                </div>
              )}

              {viewMode === 'list' && (
                <Button
                  onClick={() => { setViewMode('create'); setSelectedContact(null); }}
                  size="sm"
                  className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('contacts.newContact')}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Main column */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              {viewMode === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="text-base font-semibold mb-4">{t('contacts.createTitle')}</h2>
                  <ContactEditor
                    onSaved={handleCreated}
                    onCancel={() => setViewMode('list')}
                  />
                </motion.div>
              )}

              {viewMode === 'edit' && selectedContact && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="text-base font-semibold mb-4">{t('contacts.editTitle')}</h2>
                  <ContactEditor
                    contact={selectedContact}
                    onSaved={handleUpdated}
                    onCancel={() => setViewMode('list')}
                  />
                </motion.div>
              )}

              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {t('contacts.totalContacts', { count: displayedContacts.length })}
                    </p>
                    {searchQuery.length >= 2 && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[var(--module-accent)] hover:underline"
                      >
                        {t('contacts.clearSearch')}
                      </button>
                    )}
                  </div>

                  <ContactList
                    contacts={displayedContacts}
                    isLoading={isLoading}
                    onSelectContact={(contact) => setSelectedContact(contact)}
                    selectedContactId={selectedContact?.id}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detail panel (desktop) */}
          <AnimatePresence>
            {selectedContact && viewMode === 'list' && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'hidden lg:block border-l border-border/40 bg-card overflow-hidden'
                )}
              >
                <ContactDetailPanel
                  contact={selectedContact}
                  onClose={() => setSelectedContact(null)}
                  onEdit={handleEditContact}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile detail overlay */}
        <AnimatePresence>
          {selectedContact && viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background lg:hidden"
            >
              <ContactDetailPanel
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
                onEdit={handleEditContact}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
