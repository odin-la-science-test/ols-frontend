'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE PANEL - Reusable slide-in panel (DRY)
// ═══════════════════════════════════════════════════════════════════════════

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showOverlay?: boolean;
}

export function SlidePanel({
  isOpen,
  onClose,
  side = 'right',
  title,
  icon: Icon,
  children,
  className,
  showHeader = true,
  showOverlay = false,
}: SlidePanelProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const xAnimation = side === 'left' ? '-100%' : '100%';

  return (
    <>
      {/* Overlay (optional) */}
      {showOverlay && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 z-40"
              onClick={onClose}
            />
          )}
        </AnimatePresence>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: xAnimation, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: xAnimation, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50',
              side === 'left' ? 'left-0' : 'right-0',
              'w-full max-w-md',
              'bg-card/80 backdrop-blur-xl',
              side === 'left' ? 'border-r' : 'border-l',
              'border-border/50',
              'shadow-2xl',
              'flex flex-col',
              className
            )}
          >
            {/* Header */}
            {showHeader && (
              <div className="flex items-center justify-between gap-4 p-4 border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {title && (
                    <h2 className="text-lg font-semibold truncate">{title}</h2>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
