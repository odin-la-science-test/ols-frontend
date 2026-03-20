'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NotebookPen, Plus, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { GridsBackground } from '@/components/common';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useMyNotes, useSearchNotes } from './hooks';
import { NoteList, NoteEditor, NoteDetailPanel } from './components';
import type { Note } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NOTES PAGE - Hugin Lab notebook module
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const PRIMARY = HUGIN_PRIMARY;
const ACCENT = HUGIN_PRIMARY;

type ViewMode = 'list' | 'create' | 'edit';

export function NotesPage() {
  const { t } = useTranslation();
  const { data: notes = [], isLoading } = useMyNotes();

  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: searchResults } = useSearchNotes(searchQuery);

  const displayedNotes = searchQuery.length >= 2 ? (searchResults || []) : notes;

  const handleCreated = (note: Note) => {
    setViewMode('list');
    setSelectedNote(note);
  };

  const handleUpdated = (note: Note) => {
    setViewMode('list');
    setSelectedNote(note);
  };

  const handleEditNote = () => {
    if (selectedNote) {
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
                <NotebookPen className="w-5 h-5 text-[var(--module-accent)]" strokeWidth={1.5} />
                <h1 className="text-lg font-semibold">{t('notes.title')}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              {viewMode === 'list' && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t('notes.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 w-48 bg-card border-border/40 text-xs"
                  />
                </div>
              )}

              {viewMode === 'list' && (
                <Button
                  onClick={() => { setViewMode('create'); setSelectedNote(null); }}
                  size="sm"
                  className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('notes.newNote')}
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
                  <h2 className="text-base font-semibold mb-4">{t('notes.createTitle')}</h2>
                  <NoteEditor
                    onSaved={handleCreated}
                    onCancel={() => setViewMode('list')}
                  />
                </motion.div>
              )}

              {viewMode === 'edit' && selectedNote && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="text-base font-semibold mb-4">{t('notes.editTitle')}</h2>
                  <NoteEditor
                    note={selectedNote}
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
                      {t('notes.totalNotes', { count: displayedNotes.length })}
                    </p>
                    {searchQuery.length >= 2 && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[var(--module-accent)] hover:underline"
                      >
                        {t('notes.clearSearch')}
                      </button>
                    )}
                  </div>

                  <NoteList
                    notes={displayedNotes}
                    isLoading={isLoading}
                    onSelectNote={(note) => setSelectedNote(note)}
                    selectedNoteId={selectedNote?.id}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detail panel (desktop) */}
          <AnimatePresence>
            {selectedNote && viewMode === 'list' && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'hidden lg:block border-l border-border/40 bg-card overflow-hidden'
                )}
              >
                <NoteDetailPanel
                  note={selectedNote}
                  onClose={() => setSelectedNote(null)}
                  onEdit={handleEditNote}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile detail overlay */}
        <AnimatePresence>
          {selectedNote && viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background lg:hidden"
            >
              <NoteDetailPanel
                note={selectedNote}
                onClose={() => setSelectedNote(null)}
                onEdit={handleEditNote}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
