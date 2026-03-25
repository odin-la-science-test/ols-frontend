'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Plus, StickyNote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, Input, Textarea } from '@/components/ui';
import { useDensity } from '@/hooks';
import { registry } from '@/lib/module-registry';
import { useMyNotes, useCreateNote } from '../hooks';

// ─── Notes Panel (quick capture + recent notes, activity bar sidebar) ─

export default function NotesPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const d = useDensity();
  const density = d.density;
  const { data: notes, isLoading } = useMyNotes();
  const createNote = useCreateNote();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sort by updatedAt desc, take 8
  const recentNotes = useMemo(() => {
    return (notes ?? [])
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [notes]);

  const handleQuickCreate = useCallback(() => {
    const title = quickTitle.trim();
    if (!title) return;
    createNote.mutate(
      { title, content: quickContent.trim() || undefined },
      {
        onSuccess: () => {
          setQuickTitle('');
          setQuickContent('');
          setIsExpanded(false);
        },
      }
    );
  }, [quickTitle, quickContent, createNote]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickCreate();
    }
    if (e.key === 'Escape') {
      setQuickTitle('');
      setQuickContent('');
      setIsExpanded(false);
    }
  }, [handleQuickCreate]);

  return (
    <>
      {/* Quick capture */}
      <div className="px-3 py-2.5 border-b border-border/30 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={quickTitle}
            onChange={(e) => {
              setQuickTitle(e.target.value);
              if (e.target.value && !isExpanded) setIsExpanded(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('notes.titlePlaceholder')}
            className="h-7 text-xs bg-muted/30 border-border/40"
          />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleQuickCreate}
                disabled={!quickTitle.trim() || createNote.isPending}
                className={cn(
                  'flex items-center justify-center rounded-md h-7 w-7 shrink-0',
                  'transition-colors',
                  quickTitle.trim()
                    ? 'bg-[hsl(160,84%,39%)] text-white hover:bg-[hsl(160,84%,34%)]'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                )}
              >
                {createNote.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('notes.create')}</TooltipContent>
          </Tooltip>
        </div>

        {/* Expandable content area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <Textarea
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleQuickCreate();
                  }
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setQuickContent('');
                  }
                }}
                placeholder={t('notes.contentPlaceholder')}
                className={cn(
                  'border-border/40 bg-muted/30',
                  'text-xs',
                  'px-2.5 resize-none',
                  'min-h-[60px] max-h-[120px]'
                )}
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                Ctrl+Enter {t('notes.create').toLowerCase()} · Esc {t('notes.cancel').toLowerCase()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent notes list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <StickyNote className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('notes.emptyTitle')}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{t('notes.emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(registry.getRoutePath('notes') ?? '/lab/notes')}
                className={cn(
                  'w-full flex items-start gap-2 rounded-lg text-left',
                  'hover:bg-muted/50 transition-colors',
                  density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    note.color ? '' : 'bg-muted-foreground/30'
                  )}
                  style={note.color ? {
                    backgroundColor: note.color === 'BLUE' ? 'rgb(59 130 246)' :
                      note.color === 'RED' ? 'rgb(239 68 68)' :
                      note.color === 'GREEN' ? 'rgb(16 185 129)' :
                      note.color === 'YELLOW' ? 'rgb(245 158 11)' :
                      note.color === 'PURPLE' ? 'rgb(139 92 246)' :
                      note.color === 'ORANGE' ? 'rgb(249 115 22)' :
                      undefined
                  } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs font-medium truncate',
                    note.pinned ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {note.pinned && '📌 '}{note.title}
                  </p>
                  {note.content && (
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                      {note.content.slice(0, 60)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="p-2 border-t border-border/30">
        <Link
          to={registry.getRoutePath('notes') ?? '/lab/notes'}
          className={cn(
            'flex items-center justify-center gap-2 w-full rounded-lg',
            density === 'compact' ? 'px-2 py-1' : 'px-2 py-1.5',
            'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors',
          )}
        >
          <ExternalLink className="h-3 w-3" />
          {t('notes.title')} — {t('dashboard.viewAll')}
        </Link>
      </div>
    </>
  );
}
