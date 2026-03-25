'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// BAR CONTEXT MENU - Shared primitives for right-click context menus
// Used by Activity Bar, Tab Bar, Status Bar, Bottom Panel, Menu Bar
// Follows the same visual language as TabContextMenu but DRY.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Primitives ─────────────────────────────────────────────────────────

export interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
}

export function MenuItem({ icon, label, onClick, disabled, danger, checked }: MenuItemProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-md transition-colors text-left',
        disabled
          ? 'text-muted-foreground/50 cursor-not-allowed'
          : danger
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_60%,transparent)]',
      )}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {checked !== undefined && (
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {checked && <Check className="h-3 w-3 text-primary" />}
        </span>
      )}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-[color-mix(in_srgb,var(--color-border)_40%,transparent)]" />;
}

export interface SubMenuProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}

export function SubMenu({ icon, label, children }: SubMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [openLeft, setOpenLeft] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If opening right would overflow, open left instead
      setOpenLeft(rect.right + 190 > window.innerWidth);
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
      <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-md transition-colors text-left text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_60%,transparent)]">
        {icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{label}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: openLeft ? 4 : -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: openLeft ? 4 : -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute top-0 min-w-[180px] py-1 px-1 rounded-lg',
              'bg-popover border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] shadow-xl backdrop-blur-xl z-[101]',
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

// ─── Generic Bar Context Menu container ─────────────────────────────────

export interface BarContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  children: ReactNode;
  /** Estimated height for viewport adjustment (default 300) */
  estimatedHeight?: number;
}

export function BarContextMenu({ position, onClose, children, estimatedHeight = 300 }: BarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = useMemo(() => {
    const menuWidth = 220;
    return {
      x: Math.min(position.x, window.innerWidth - menuWidth - 8),
      y: Math.min(position.y, window.innerHeight - estimatedHeight - 8),
    };
  }, [position, estimatedHeight]);

  return createPortal(
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'fixed z-[100] min-w-[200px] py-1.5 px-1 rounded-lg',
        'bg-popover border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] shadow-xl backdrop-blur-xl',
      )}
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {children}
    </motion.div>,
    document.body,
  );
}

// ─── Hook: shared context menu position state ───────────────────────────

export function useBarContextMenuState() {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  return { menuPosition, handleContextMenu, closeMenu };
}
