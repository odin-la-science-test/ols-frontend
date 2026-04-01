'use client';

import type { ReactNode } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

// ─── Collapsible Section (shared by Explorer sections) ──────────────────

interface CollapsibleSectionProps {
  icon: ReactNode;
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({ icon, label, count, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-2 py-1 w-full text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <span className="text-[10px] tabular-nums">{count}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 mt-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
