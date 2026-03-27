'use client';

import { useCallback, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Overlay Sidebar — floating sidebar panel with resize handles
// ═══════════════════════════════════════════════════════════════════════════

const OVERLAY_MIN_W = 180;
const OVERLAY_MAX_W = 600;
const OVERLAY_MAX_H_OFFSET = 400; // max shrink from top or bottom (px)

/** Blocks pointer events on react-resizable-panels handles during overlay drag to avoid stray highlight */
function useBlockResizeHandlesDuringDrag() {
  const startDrag = useCallback((
    e: ReactMouseEvent<HTMLElement>,
    onMove: (dx: number, dy: number) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const ox = e.clientX;
    const oy = e.clientY;
    document.body.classList.add('ols-overlay-dragging');
    const handleMove = (ev: MouseEvent) => onMove(ev.clientX - ox, ev.clientY - oy);
    const handleUp = () => {
      document.body.classList.remove('ols-overlay-dragging');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);
  return startDrag;
}

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

  const [width, setWidth] = useState(initWidth);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);

  const startDrag = useBlockResizeHandlesDuringDrag();

  const onWidthMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const startW = width;
    startDrag(e, (dx) => {
      const delta = isLeft ? dx : -dx;
      setWidth(Math.min(OVERLAY_MAX_W, Math.max(OVERLAY_MIN_W, startW + delta)));
    });
  }, [startDrag, isLeft, width]);

  const onTopMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const startTop = topOffset;
    startDrag(e, (_, dy) => {
      setTopOffset(Math.max(0, Math.min(OVERLAY_MAX_H_OFFSET, startTop + dy)));
    });
  }, [startDrag, topOffset]);

  const onBottomMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const startBottom = bottomOffset;
    startDrag(e, (_, dy) => {
      setBottomOffset(Math.max(0, Math.min(OVERLAY_MAX_H_OFFSET, startBottom - dy)));
    });
  }, [startDrag, bottomOffset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — seulement en mode overlay, pas pinned */}
          {!pinned && (
            <motion.div
              key={`${keyId}-backdrop`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 scrim-light"
              style={{ zIndex: zIndex - 1 }}
              onClick={onDismiss}
            />
          )}
          <motion.aside
            key={`${keyId}-overlay`}
            initial={{ x: isLeft ? -width : width, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -width : width, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'absolute glass-overlay shadow-2xl flex flex-col rounded-lg overflow-hidden',
              isLeft ? 'left-0 border border-border/40' : 'right-0 border border-border/40',
            )}
            style={{ width, top: topOffset + 4, bottom: bottomOffset + 4, zIndex, [isLeft ? 'left' : 'right']: 4 }}
          >
            {/* Top resize handle */}
            <div
              className="absolute left-2 right-2 top-0 h-1 cursor-ns-resize z-10 hover:bg-primary/30 active:bg-primary/50 transition-colors rounded-full"
              onMouseDown={onTopMouseDown}
            />
            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              {children}
            </div>
            {/* Bottom resize handle */}
            <div
              className="absolute left-2 right-2 bottom-0 h-1 cursor-ns-resize z-10 hover:bg-primary/30 active:bg-primary/50 transition-colors rounded-full"
              onMouseDown={onBottomMouseDown}
            />
            {/* Width resize handle on inner edge */}
            <div
              className={cn(
                'absolute top-2 bottom-2 w-1 cursor-ew-resize z-10 hover:bg-primary/30 active:bg-primary/50 transition-colors rounded-full',
                isLeft ? 'right-0' : 'left-0',
              )}
              onMouseDown={onWidthMouseDown}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
