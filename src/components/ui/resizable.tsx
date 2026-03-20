'use client';

import * as React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// RESIZABLE — Thin wrappers around react-resizable-panels v4
//
// v4 API:
//   Group (not PanelGroup), Panel, Separator (not PanelResizeHandle)
//   orientation (not direction) — "horizontal" | "vertical"
//   panelRef (not ref) for imperative API (usePanelRef hook)
//   Sizes: numbers = pixels, strings = percentages ("15" → 15%)
//          Strings with units also work: "15%", "200px", "1rem", "50vh"
//
// ⚠️ Group style constraints: display, flex-direction, flex-wrap, overflow
//    cannot be overridden.
// ⚠️ Separator style constraints: flex-grow, flex-shrink cannot be overridden.
// ⚠️ Panel className/style are applied to a nested div (not the flex child).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ResizablePanelGroup — wraps v4 Group.
 * Only adds h-full w-full; display/flex-direction are managed by the library.
 */
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Group>) {
  return (
    <Group
      className={cn('h-full w-full', className)}
      {...props}
    />
  );
}
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

/**
 * ResizablePanel — thin passthrough to v4 Panel.
 */
function ResizablePanel(props: React.ComponentPropsWithoutRef<typeof Panel>) {
  return <Panel {...props} />;
}
ResizablePanel.displayName = 'ResizablePanel';

/**
 * ResizableHandle — wraps v4 Separator with VS Code–style styling.
 *
 * Uses `style` for dimensions (safe per docs) and `className` only for
 * colors/transitions that don't interfere with flex-grow/flex-shrink.
 * Uses `data-separator` attribute for hover/active states as recommended.
 */
interface ResizableHandleProps
  extends React.ComponentPropsWithoutRef<typeof Separator> {
  withHandle?: boolean;
}

function ResizableHandle({ withHandle, className, style, ...props }: ResizableHandleProps) {
  return (
    <Separator
      style={{
        background: 'var(--color-border)',
        transition: 'background 150ms',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
      className={cn(
        // 1px visible line, direction-aware via aria-orientation set by the library
        'aria-[orientation=vertical]:w-px aria-[orientation=vertical]:min-w-px aria-[orientation=vertical]:h-full',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:min-h-px aria-[orientation=horizontal]:w-full',
        // Cursor
        'aria-[orientation=vertical]:cursor-col-resize aria-[orientation=horizontal]:cursor-row-resize',
        // Hover / active: accent color
        'hover:bg-primary/50 active:bg-primary',
        // Focus ring
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            'z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border',
            'opacity-0 hover:opacity-100 transition-opacity duration-150',
          )}
        >
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Separator>
  );
}
ResizableHandle.displayName = 'ResizableHandle';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
