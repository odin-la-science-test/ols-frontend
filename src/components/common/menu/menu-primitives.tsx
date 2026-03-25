'use client';

import { useCallback, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItemProps, MenuSubMenuProps } from './types';

// ─── Reusable menu item ──────────────────────────────────────────────────

export function MenuItem({ children, onClick, isActive, disabled, className, accentColor }: MenuItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left',
        'transition-colors duration-75',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-muted/40 cursor-pointer',
        isActive && 'bg-muted/30',
        className
      )}
      style={isActive && accentColor ? { borderLeft: `2px solid ${accentColor}` } : undefined}
    >
      {children}
    </button>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────

export function MenuSeparator() {
  return <div className="h-px bg-border/30 my-1 mx-2" />;
}

// ─── SubMenu for MenuBar dropdowns ───────────────────────────────────────

export function MenuSubMenu({ icon, label, children }: MenuSubMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [openLeft, setOpenLeft] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenLeft(rect.right + 200 > window.innerWidth);
    }
    setOpen(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors duration-75 hover:bg-muted/40 cursor-pointer">
        {icon}
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: openLeft ? 4 : -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: openLeft ? 4 : -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute top-0 min-w-[200px] py-1 rounded-lg',
              'bg-popover border border-border/50 shadow-xl backdrop-blur-xl z-[60]',
              openLeft ? 'right-full mr-1' : 'left-full ml-1',
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
