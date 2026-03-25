'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// FOCUS MODE INDICATOR - Discreet exit hint
// Shows a subtle indicator in the bottom-left corner to exit focus mode
// Appears on mouse move, fades out after inactivity
// ═══════════════════════════════════════════════════════════════════════════

export function FocusModeIndicator() {
  const { t } = useTranslation();
  const toggleFocusMode = useWorkspaceStore((state) => state.toggleFocusMode);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  // Show indicator on mouse movement near bottom-left, hide after 3s of inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      // Show when mouse is near bottom-left corner (within 200px)
      if (e.clientY > window.innerHeight - 200 && e.clientX < 200) {
        setVisible(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (!hovered) setVisible(false);
        }, 3000);
      }
    };

    // Initially visible for 3s then fade out
    timeout = setTimeout(() => {
      if (!hovered) setVisible(false);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [hovered]);

  const handleExit = useCallback(() => {
    toggleFocusMode();
  }, [toggleFocusMode]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleExit}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            'fixed bottom-4 left-4 z-[60]',
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] backdrop-blur-lg border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]',
            'text-xs text-muted-foreground',
            'hover:text-foreground hover:border-[color-mix(in_srgb,var(--color-border)_60%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]',
            'transition-colors duration-200',
            'cursor-pointer select-none',
            'shadow-lg'
          )}
        >
          <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{t('focusMode.exitHint')}</span>
          <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] rounded font-mono">
            Ctrl+Shift+F
          </kbd>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
