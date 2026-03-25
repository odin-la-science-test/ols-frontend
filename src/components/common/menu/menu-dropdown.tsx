'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MenuDropdownProps } from './types';

export function MenuDropdown({ anchorId, children }: MenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const trigger = document.querySelector(`[data-menu-trigger="${anchorId}"]`);
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setPos({ top: rect.bottom, left: rect.left });
    }
  }, [anchorId]);

  // Portal to <body> so backdrop-filter is not blocked by a parent's
  // own backdrop-filter (which creates an isolated stacking context).
  return createPortal(
    <motion.div
      ref={ref}
      data-menu-dropdown
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'fixed z-[100] mt-0',
        'min-w-[220px] max-w-[320px]',
        'rounded-lg border border-border/50',
        'bg-card/80 backdrop-blur-xl shadow-2xl',
        'py-1'
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </motion.div>,
    document.body
  );
}
