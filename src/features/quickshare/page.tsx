'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { GridsBackground } from '@/components/common';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useMyShares } from './hooks';
import { ShareList, CreateShareForm, ShareDetailPanel } from './components';
import type { SharedItem } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE PAGE - Hugin Lab instant sharing module
// ═══════════════════════════════════════════════════════════════════════════

import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const ACCENT = HUGIN_PRIMARY;

export function QuickSharePage() {
  const { t } = useTranslation();
  const { data: shares = [], isLoading } = useMyShares();

  const [isCreating, setIsCreating] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<SharedItem | null>(null);

  const handleCreated = (item: SharedItem) => {
    setIsCreating(false);
    setSelectedItem(item);
  };

  const style = {
    '--module-accent': ACCENT,
    '--module-accent-subtle': `color-mix(in srgb, var(--module-accent) 15%, transparent)`,
    '--module-accent-muted': `color-mix(in srgb, var(--module-accent) 30%, transparent)`,
    '--color-ring': ACCENT,
    '--color-primary': ACCENT,
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
                <Share2 className="w-5 h-5 text-[var(--module-accent)]" strokeWidth={1.5} />
                <h1 className="text-lg font-semibold">{t('quickshare.title')}</h1>
              </div>
            </div>
            {!isCreating && (
              <Button
                onClick={() => { setIsCreating(true); setSelectedItem(null); }}
                size="sm"
                className="bg-[var(--module-accent)] hover:bg-[var(--module-accent)]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('quickshare.newShare')}
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main column */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              {isCreating ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="text-base font-semibold mb-4">{t('quickshare.createTitle')}</h2>
                  <CreateShareForm
                    onCreated={handleCreated}
                    onCancel={() => setIsCreating(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-3xl mx-auto"
                >
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {t('quickshare.totalShares', { count: shares.length })}
                    </p>
                  </div>

                  <ShareList
                    shares={shares}
                    isLoading={isLoading}
                    onViewItem={(item) => setSelectedItem(item)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detail panel (desktop) */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'hidden lg:block border-l border-border/40 bg-card overflow-hidden'
                )}
              >
                <ShareDetailPanel
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile detail overlay */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background lg:hidden"
            >
              <ShareDetailPanel
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
