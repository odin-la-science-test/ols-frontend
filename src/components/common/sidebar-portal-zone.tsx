'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR PORTAL ZONE — composant générique réutilisé par les deux sidebars
//
// • SidebarPortalZone  – une zone de portal pour un editor group donné
// • SplitPortalPanel   – layout split (resize vertical) quand splitActive
//
// GlobalSidebar et SecondarySidebar utilisent tous deux ces briques.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────

export interface PortalZoneRegistration {
  moduleKey: string;
  moduleTitle: string;
  accentColor: string;
}

export interface SidebarPortalZoneProps {
  /** Editor group id ('main' | 'split') */
  groupId: string;
  /** Registration for this group — null if nothing registered */
  registration: PortalZoneRegistration | null;
  /** Callback to set the DOM element used as portal target */
  setPortalTarget: (el: HTMLDivElement | null, groupId: string) => void;
  /** If provided, shows an X button in the header to close/dismiss the panel */
  onClose?: () => void;
  /** Additional className for the portal div (scroll, padding, etc.) */
  portalClassName?: string;
  className?: string;
  /** Hide the colored module title header (e.g. when shown in a tab that already has the name) */
  hideModuleHeader?: boolean;
}

/**
 * Single portal zone for one editor group.
 * Renders:
 *  - a colored module header (when registered)
 *  - a portal target div where modules render content via createPortal
 */
export function SidebarPortalZone({
  groupId,
  registration,
  setPortalTarget,
  onClose,
  portalClassName,
  className,
  hideModuleHeader = false,
}: SidebarPortalZoneProps) {
  // Callback ref: called with the DOM node on mount, and with null on unmount.
  // This is sufficient — no separate useEffect cleanup needed (which would race).
  const portalRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setPortalTarget(node, groupId);
    },
    [setPortalTarget, groupId],
  );

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Module header — title + optional close button */}
      {registration && !hideModuleHeader && (
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/30">
          <span className="text-[10px] font-medium uppercase tracking-wider truncate text-muted-foreground">
            {registration.moduleTitle}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      {/* When header is hidden but close button still needed */}
      {registration && hideModuleHeader && onClose && (
        <div className="shrink-0 flex justify-end px-2 py-1">
          <button
            onClick={onClose}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {/* Portal target — modules render their content here via createPortal */}
      <div
        ref={portalRef}
        className={cn('flex-1 overflow-hidden', portalClassName)}
      />
    </div>
  );
}

// ─── Split Portal Panel ─────────────────────────────────────────────────

export interface SplitPortalPanelProps {
  /** Unique id prefix for the resizable panel group (e.g. 'filters', 'detail') */
  panelId: string;
  /** Default group id (e.g. 'main') */
  mainGroupId: string;
  /** Split group id (e.g. 'split') */
  splitGroupId: string;
  /** Whether the split group has a registration */
  hasSplitRegistration: boolean;
  /** Render a single portal zone for the given groupId */
  renderZone: (groupId: string) => React.ReactNode;
}

/**
 * When split is active AND the split group has a registration,
 * renders two resizable panels (vertical) with a handle between them.
 * Otherwise renders a single zone for the main group.
 */
export function SplitPortalPanel({
  panelId,
  mainGroupId,
  splitGroupId,
  hasSplitRegistration,
  renderZone,
}: SplitPortalPanelProps) {
  const splitActive = useEditorGroupsStore((s) => s.splitActive);

  if (splitActive && hasSplitRegistration) {
    return (
      <ResizablePanelGroup orientation="vertical" id={`${panelId}-split`}>
        <ResizablePanel id={`${panelId}-main`} defaultSize="50" minSize="20">
          {renderZone(mainGroupId)}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id={`${panelId}-split-panel`} defaultSize="50" minSize="20">
          {renderZone(splitGroupId)}
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  return <>{renderZone(mainGroupId)}</>;
}
