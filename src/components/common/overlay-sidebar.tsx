'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { OverlayDragProvider } from '@/components/common/sidebar/overlay-drag-context';

// ═══════════════════════════════════════════════════════════════════════════
// Overlay Sidebar
//   - overlay : flottant arrondi, arriere visible, clic exterieur = dismiss
//   - pinned  : flottant arrondi, drag libre, resize natif CSS, reste ouvert
// ═══════════════════════════════════════════════════════════════════════════

const OVERLAY_MIN_W = 180;
const OVERLAY_MAX_W = 600;

export interface OverlaySidebarProps {
  side: 'left' | 'right';
  isOpen: boolean;
  /** pinned = flotte mais sans backdrop ni dismiss au clic exterieur */
  pinned?: boolean;
  onDismiss: () => void;
  children: ReactNode;
  defaultWidth?: number;
  zIndex?: number;
  /** Unique identifier for animation keys (avoids conflicts when multiple overlays share same side) */
  overlayId?: string;
}

export function OverlaySidebar({
  side, isOpen, pinned, onDismiss, children,
  defaultWidth, zIndex = 50, overlayId,
}: OverlaySidebarProps) {
  const isLeft = side === 'left';
  const initWidth = defaultWidth ?? (isLeft ? 280 : 320);
  const keyId = overlayId ?? side;
  const dragControls = useDragControls();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Zone de clic invisible pour dismiss (overlay uniquement, pas pinned) */}
          {!pinned && (
            <motion.div
              key={`${keyId}-backdrop`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0"
              style={{ zIndex: zIndex - 1 }}
              onClick={onDismiss}
            />
          )}
          <motion.aside
            key={`${keyId}-overlay`}
            initial={{ x: isLeft ? -initWidth : initWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -initWidth : initWidth, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            // Drag libre en mode pinned
            {...(pinned ? {
              drag: true,
              dragControls,
              dragListener: false,
              dragMomentum: false,
              dragElastic: 0,
              dragConstraints: {
                top: 0,
                left: 0,
                right: Math.max(0, window.innerWidth - OVERLAY_MIN_W),
                bottom: Math.max(0, window.innerHeight - 200),
              },
            } : {})}
            className="absolute glass-overlay shadow-2xl flex flex-col rounded-lg border border-border/40 overflow-hidden"
            style={{
              width: initWidth,
              zIndex,
              top: 4,
              bottom: 4,
              [isLeft ? 'left' : 'right']: 4,
              ...(pinned && {
                resize: 'both',
                minWidth: OVERLAY_MIN_W,
                minHeight: 200,
                maxWidth: OVERLAY_MAX_W,
              }),
            }}
          >
            <OverlayDragProvider value={pinned ? dragControls : null}>
              <div className="flex-1 overflow-hidden min-h-0">
                {children}
              </div>
            </OverlayDragProvider>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
