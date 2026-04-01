'use client';

import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Expandable List Item (panels activity bar) ─────────────────────────
// Composant partagé pour les items expandables dans les panels sidebar.
// Le summary est toujours visible, les children s'affichent au clic.

export interface ExpandableListItemProps {
  expanded: boolean;
  onToggle: () => void;
  onCollapse?: () => void;
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ExpandableListItem({
  expanded,
  onToggle,
  onCollapse,
  summary,
  children,
  className,
}: ExpandableListItemProps) {
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && expanded) {
      e.stopPropagation();
      (onCollapse ?? onToggle)();
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-colors',
        expanded && 'bg-muted/20',
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        {summary}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
