'use client';

import { useEffect, useCallback, type RefObject } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { UnifiedSidebarContent, useSidebarDndOverlay, SidebarEdgeDropZones } from '@/components/common/unified-sidebar';
import { usePanelRenderer } from '@/components/common/app-panel-bridge';
import { BottomPanelContent } from '@/components/common/bottom-panel';
import { LayoutRenderer, type SlotRenderers, type PanelRefs } from '@/components/common/layout-renderer';
import { buildLayoutTree } from '@/lib/layout-engine';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { usePanelRef, type PanelImperativeHandle } from 'react-resizable-panels';
import { OverlaySidebar } from './overlay-sidebar';
import { CenterContent } from './center-content';
import type { SplitDirection } from '@/stores/editor-groups-store';

// ═══════════════════════════════════════════════════════════════════════════
// Desktop Resizable Layout — declarative layout via layout-engine
// ═══════════════════════════════════════════════════════════════════════════

export interface DesktopResizableLayoutProps {
  showChrome: boolean;
  showBreadcrumbs: boolean;
  tabBarVisible: boolean;
  hasModuleToolbar: boolean;
  hasModuleFilters: boolean;
  splitActive: boolean;
  splitDirection: SplitDirection;
}

export function DesktopResizableLayout({
  showChrome, showBreadcrumbs, tabBarVisible,
  hasModuleToolbar, hasModuleFilters,
  splitActive, splitDirection,
}: DesktopResizableLayoutProps) {
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const primaryZone = usePanelRegistryStore((s) => s.zones.primary ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const secondaryZone = usePanelRegistryStore((s) => s.zones.secondary ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const closePrimary = usePanelRegistryStore((s) => s.closeZone);
  const closeSecondary = usePanelRegistryStore((s) => s.closeZone);
  const bottomPanelVisible = useBottomPanelStore((s) => s.visible);
  const panelAlignment = useBottomPanelStore((s) => s.alignment);
  const primaryMode = useSidebarModeStore((s) => s.primaryMode);
  const secondaryMode = useSidebarModeStore((s) => s.secondaryMode);
  const activityMode = useSidebarModeStore((s) => s.activityMode);
  const primarySide = useSidebarModeStore((s) => s.primarySide);
  const secondarySide = useSidebarModeStore((s) => s.secondarySide);
  const closeActivityPanel = usePanelRegistryStore((s) => s.closeZone);
  const renderPanel = usePanelRenderer();

  // Imperative panel refs
  const sidebarRef = usePanelRef();
  const secondaryRef = usePanelRef();
  const bottomRef = usePanelRef();

  const syncPanel = useCallback(
    (ref: RefObject<PanelImperativeHandle | null>, isOpen: boolean) => {
      const p = ref.current;
      if (!p) return;
      if (isOpen && p.isCollapsed()) p.expand();
      else if (!isOpen && !p.isCollapsed()) p.collapse();
    },
    [],
  );

  const effectiveBottomVisible = showChrome && bottomPanelVisible;
  useEffect(() => { syncPanel(bottomRef, effectiveBottomVisible); }, [effectiveBottomVisible, bottomRef, syncPanel]);

  // Register sidebar DnD overlay globally so it's available even when sidebars aren't mounted
  useSidebarDndOverlay();

  // Overlay dismiss
  const dismissActivity = useCallback(() => closeActivityPanel('activity-panel'), [closeActivityPanel]);
  const dismissPrimary = useCallback(() => closePrimary('primary'), [closePrimary]);
  const dismissSecondary = useCallback(() => closeSecondary('secondary'), [closeSecondary]);

  // Build declarative layout tree (replaces 4 hand-coded if/else blocks)
  const activityIsOpen = showChrome && activityPanelZone.isOpen && activityPanelZone.stack.length > 0;
  const primaryIsOpen = showChrome && primaryZone.isOpen && primaryZone.stack.length > 0;
  const secondaryIsOpen = showChrome && secondaryZone.isOpen && secondaryZone.stack.length > 0;
  const tree = buildLayoutTree(panelAlignment, primaryMode, secondaryMode, primaryIsOpen, secondaryIsOpen, primarySide, secondarySide);

  const renderers: SlotRenderers = {
    'primary-sidebar': () => <UnifiedSidebarContent zone="primary" renderPanel={renderPanel} />,
    'secondary-sidebar': () => <UnifiedSidebarContent zone="secondary" renderPanel={renderPanel} />,
    center: () => (
      <CenterContent
        showChrome={showChrome} showBreadcrumbs={showBreadcrumbs}
        tabBarVisible={tabBarVisible} hasModuleToolbar={hasModuleToolbar}
        hasModuleFilters={hasModuleFilters}
        splitActive={splitActive} splitDirection={splitDirection}
      />
    ),
    bottom: () => <BottomPanelContent />,
  };

  const panelRefs: PanelRefs = {
    'primary-sidebar': sidebarRef,
    'secondary-sidebar': secondaryRef,
    bottom: bottomRef,
  };

  return (
    <div className="hidden lg:flex relative" style={{ flex: 1, minWidth: 0 }}>
      {/* Edge drop zones at the outermost level so they cover true screen edges */}
      {showChrome && <SidebarEdgeDropZones />}
      <ResizablePanelGroup orientation="horizontal" id="ols-activity-main" style={{ flex: 1, minWidth: 0 }}>
        {/* Activity panel docked: resizable, outside the overlay zone */}
        {activityIsOpen && activityMode === 'dock' && (
          <>
            <ResizablePanel
              id="activity-panel"
              defaultSize="15"
              minSize="10"
              maxSize="30"
              collapsible
              collapsedSize="0"
            >
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <UnifiedSidebarContent zone="activity-panel" variant="activity" renderPanel={renderPanel} className="h-full" />
              </div>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}
        {/* primary + center + secondary */}
        <ResizablePanel id="ols-main-content" defaultSize="85" minSize="30">
          <div className="relative" style={{ height: '100%' }}>
            {/* Activity panel overlay / pinned */}
            <OverlaySidebar side="left" isOpen={showChrome && activityIsOpen && (activityMode === 'overlay' || activityMode === 'pinned')} pinned={activityMode === 'pinned'} onDismiss={dismissActivity} zIndex={54} overlayId="activity">
              <UnifiedSidebarContent zone="activity-panel" variant="activity" renderPanel={renderPanel} />
            </OverlaySidebar>
            <OverlaySidebar side={primarySide} isOpen={showChrome && (primaryMode === 'overlay' || primaryMode === 'pinned') && primaryZone.isOpen} pinned={primaryMode === 'pinned'} onDismiss={dismissPrimary} zIndex={52} overlayId="primary">
              <UnifiedSidebarContent zone="primary" renderPanel={renderPanel} />
            </OverlaySidebar>
            <OverlaySidebar side={secondarySide} isOpen={showChrome && (secondaryMode === 'overlay' || secondaryMode === 'pinned') && secondaryZone.isOpen} pinned={secondaryMode === 'pinned'} onDismiss={dismissSecondary} zIndex={50} overlayId="secondary">
              <UnifiedSidebarContent zone="secondary" renderPanel={renderPanel} />
            </OverlaySidebar>
            <LayoutRenderer tree={tree} renderers={renderers} panelRefs={panelRefs} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
