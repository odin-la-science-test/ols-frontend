'use client';

import { useEffect, useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  CommandPalette, TabBar, TabManager, MobileBottomBar,
  ActivityBar, StatusBar, MenuBar, Breadcrumbs,
} from '@/components/common';
import { ModuleToolbar } from '@/components/common/module-toolbar';
import { BreadcrumbsRow } from '@/components/common/breadcrumbs-row';
import { FocusModeIndicator } from '@/components/common/focus-mode-indicator';
import { SplitEditorPane } from '@/components/common/split-editor-pane';
import { TabDndProvider } from '@/components/common/tab-dnd-context';
import { EditorGroupProvider } from '@/components/common/editor-group-context';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { UnifiedSidebarContent, SidebarEjectZone } from '@/components/common/unified-sidebar';
import { useRegisterAppPanels, useRegisterDetailPanel, usePanelRenderer } from '@/components/common/app-panel-bridge';
import { BottomPanelContent } from '@/components/common/bottom-panel';
import { ShellDndProvider } from '@/components/common/shell-dnd-context';
import { LayoutRenderer, type SlotRenderers, type PanelRefs } from '@/components/common/layout-renderer';
import { buildLayoutTree } from '@/lib/layout-engine';
import { useKeyboardShortcuts } from '@/hooks';
import { useWorkspaceStore, useActivityBarStore } from '@/stores';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { cn } from '@/lib/utils';
import { usePanelRef, type PanelImperativeHandle } from 'react-resizable-panels';
import { AnimatePresence, motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL — VS Code-style workspace with declarative layout engine
//
// Uses layout-engine.ts to build a tree of panels per alignment mode,
// and layout-renderer.tsx to walk that tree into ResizablePanelGroups.
// ShellDndProvider enables cross-zone drag & drop everywhere.
// ═══════════════════════════════════════════════════════════════════════════

const MINIMAL_SHELL_PATHS = ['/', '/atlas', '/lab'];

function getAccentContext(pathname: string): string | null {
  if (pathname === '/lab' || pathname.startsWith('/lab/')) return 'lab';
  return null;
}

// ─── Center Content ─────────────────────────────────────────────────────

function CenterContent({
  showChrome, showBreadcrumbs, tabBarVisible,
  hasModuleToolbar, hasModuleFilters, isModuleRoute,
  splitActive, splitDirection,
}: {
  showChrome: boolean;
  showBreadcrumbs: boolean;
  tabBarVisible: boolean;
  hasModuleToolbar: boolean;
  hasModuleFilters: boolean;
  isModuleRoute: boolean;
  splitActive: boolean;
  splitDirection: 'horizontal' | 'vertical';
}) {
  const showToolRow = showBreadcrumbs || hasModuleToolbar || hasModuleFilters || isModuleRoute;

  if (splitActive) {
    return (
      <TabDndProvider>
        <ResizablePanelGroup orientation={splitDirection} id="ols-split-editor" style={{ height: '100%' }}>
          <ResizablePanel id="editor-main" defaultSize="50" minSize="15">
            <EditorGroupProvider groupId="main">
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {showChrome && tabBarVisible && <TabBar editorGroupId="main" externalDnd />}
                {showChrome && showToolRow && (
                  <BreadcrumbsRow>
                    {showBreadcrumbs && <Breadcrumbs className="min-w-0" />}
                    <ModuleToolbar className={showBreadcrumbs ? 'ml-auto' : ''} forceVisible={isModuleRoute} />
                  </BreadcrumbsRow>
                )}
                <main style={{ position: 'relative', flex: 1, overflow: 'hidden' }}><Outlet /></main>
              </div>
            </EditorGroupProvider>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="editor-split" defaultSize="50" minSize="15">
            <SplitEditorPane externalDnd />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabDndProvider>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showChrome && tabBarVisible && <TabBar />}
      {showChrome && showToolRow && (
        <BreadcrumbsRow>
          {showBreadcrumbs && <Breadcrumbs className="min-w-0" />}
          <ModuleToolbar className={showBreadcrumbs ? 'ml-auto' : ''} forceVisible={isModuleRoute} />
        </BreadcrumbsRow>
      )}
      <main style={{ position: 'relative', flex: 1, overflow: 'hidden' }}><Outlet /></main>
    </div>
  );
}

// ─── Overlay Sidebar (shared component for left/right) ──────────────────

// ─── Overlay Sidebar (shared component for left/right) ──────────────────

const OVERLAY_MIN_W = 180;
const OVERLAY_MAX_W = 600;
const OVERLAY_MAX_H_OFFSET = 400; // max shrink from top or bottom (px)

/** Blocks pointer events on react-resizable-panels handles during overlay drag to avoid stray highlight */
function useBlockResizeHandlesDuringDrag() {
  const startDrag = useCallback((
    e: React.MouseEvent,
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

function OverlaySidebar({
  side, isOpen, pinned, onDismiss, children,
  defaultWidth, zIndex = 50,
}: {
  side: 'left' | 'right';
  isOpen: boolean;
  /** pinned = flotte mais sans backdrop ni dismiss au clic extérieur */
  pinned?: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  defaultWidth?: number;
  zIndex?: number;
}) {
  const isLeft = side === 'left';
  const initWidth = defaultWidth ?? (isLeft ? 280 : 320);

  const [width, setWidth] = useState(initWidth);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);

  const startDrag = useBlockResizeHandlesDuringDrag();

  const onWidthMouseDown = useCallback((e: React.MouseEvent) => {
    const startW = width;
    startDrag(e, (dx) => {
      const delta = isLeft ? dx : -dx;
      setWidth(Math.min(OVERLAY_MAX_W, Math.max(OVERLAY_MIN_W, startW + delta)));
    });
  }, [startDrag, isLeft, width]);

  const onTopMouseDown = useCallback((e: React.MouseEvent) => {
    const startTop = topOffset;
    startDrag(e, (_, dy) => {
      setTopOffset(Math.max(0, Math.min(OVERLAY_MAX_H_OFFSET, startTop + dy)));
    });
  }, [startDrag, topOffset]);

  const onBottomMouseDown = useCallback((e: React.MouseEvent) => {
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
              key={`${side}-backdrop`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/30"
              style={{ zIndex: zIndex - 1 }}
              onClick={onDismiss}
            />
          )}
          <motion.aside
            key={`${side}-overlay`}
            initial={{ x: isLeft ? -width : width, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? -width : width, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'absolute bg-card shadow-xl flex flex-col',
              isLeft ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
            )}
            style={{ width, top: topOffset, bottom: bottomOffset, zIndex }}
          >
            {/* Top resize handle */}
            <div
              className="absolute left-0 right-0 top-0 h-1.5 cursor-ns-resize z-10 hover:bg-primary/40 transition-colors rounded-t"
              onMouseDown={onTopMouseDown}
            />
            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              {children}
            </div>
            {/* Bottom resize handle */}
            <div
              className="absolute left-0 right-0 bottom-0 h-1.5 cursor-ns-resize z-10 hover:bg-primary/40 transition-colors rounded-b"
              onMouseDown={onBottomMouseDown}
            />
            {/* Width resize handle on inner edge */}
            <div
              className={cn(
                'absolute top-0 bottom-0 w-1.5 cursor-ew-resize z-10 hover:bg-primary/40 transition-colors',
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

// ─── Desktop Resizable Layout (declarative via layout-engine) ───────────

function DesktopResizableLayout({
  showChrome, showBreadcrumbs, tabBarVisible,
  hasModuleToolbar, hasModuleFilters, isModuleRoute,
  splitActive, splitDirection,
}: {
  showChrome: boolean;
  showBreadcrumbs: boolean;
  tabBarVisible: boolean;
  hasModuleToolbar: boolean;
  hasModuleFilters: boolean;
  isModuleRoute: boolean;
  splitActive: boolean;
  splitDirection: 'horizontal' | 'vertical';
}) {
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
    (ref: React.RefObject<PanelImperativeHandle | null>, isOpen: boolean) => {
      const p = ref.current;
      if (!p) return;
      if (isOpen && p.isCollapsed()) p.expand();
      else if (!isOpen && !p.isCollapsed()) p.collapse();
    },
    [],
  );

  useEffect(() => { syncPanel(bottomRef, bottomPanelVisible); }, [bottomPanelVisible, bottomRef, syncPanel]);

  // Overlay dismiss
  const dismissActivity = useCallback(() => closeActivityPanel('activity-panel'), [closeActivityPanel]);
  const dismissPrimary = useCallback(() => closePrimary('primary'), [closePrimary]);
  const dismissSecondary = useCallback(() => closeSecondary('secondary'), [closeSecondary]);

  // Build declarative layout tree (replaces 4 hand-coded if/else blocks)
  const activityIsOpen = activityPanelZone.isOpen && activityPanelZone.stack.length > 0;
  const primaryIsOpen = primaryZone.isOpen && primaryZone.stack.length > 0;
  const secondaryIsOpen = secondaryZone.isOpen && secondaryZone.stack.length > 0;
  const tree = buildLayoutTree(panelAlignment, primaryMode, secondaryMode, primaryIsOpen, secondaryIsOpen, primarySide, secondarySide);

  const renderers: SlotRenderers = {
    'primary-sidebar': () => <UnifiedSidebarContent zone="primary" renderPanel={renderPanel} />,
    'secondary-sidebar': () => <UnifiedSidebarContent zone="secondary" renderPanel={renderPanel} />,
    center: () => (
      <CenterContent
        showChrome={showChrome} showBreadcrumbs={showBreadcrumbs}
        tabBarVisible={tabBarVisible} hasModuleToolbar={hasModuleToolbar}
        hasModuleFilters={hasModuleFilters} isModuleRoute={isModuleRoute}
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
    <div className="hidden lg:flex" style={{ flex: 1, minWidth: 0 }}>
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
            <OverlaySidebar side="left" isOpen={activityIsOpen && (activityMode === 'overlay' || activityMode === 'pinned')} pinned={activityMode === 'pinned'} onDismiss={dismissActivity} zIndex={52}>
              <UnifiedSidebarContent zone="activity-panel" variant="activity" renderPanel={renderPanel} />
            </OverlaySidebar>
            <OverlaySidebar side={primarySide} isOpen={(primaryMode === 'overlay' || primaryMode === 'pinned') && primaryZone.isOpen} pinned={primaryMode === 'pinned'} onDismiss={dismissPrimary} zIndex={50}>
              <UnifiedSidebarContent zone="primary" renderPanel={renderPanel} />
            </OverlaySidebar>
            <OverlaySidebar side={secondarySide} isOpen={(secondaryMode === 'overlay' || secondaryMode === 'pinned') && secondaryZone.isOpen} pinned={secondaryMode === 'pinned'} onDismiss={dismissSecondary}>
              <UnifiedSidebarContent zone="secondary" renderPanel={renderPanel} />
            </OverlaySidebar>
            {/* Eject zones: drop targets on each edge to move panels to the other sidebar */}
            <AnimatePresence>
              <SidebarEjectZone
                key="eject-primary"
                targetZone="primary"
                side={primarySide}
                stackPosition={primarySide === secondarySide ? 'top' : 'full'}
              />
              <SidebarEjectZone
                key="eject-secondary"
                targetZone="secondary"
                side={secondarySide}
                stackPosition={primarySide === secondarySide ? 'bottom' : 'full'}
              />
            </AnimatePresence>
            <LayoutRenderer tree={tree} renderers={renderers} panelRefs={panelRefs} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// ─── Mobile Layout ──────────────────────────────────────────────────────

function MobileLayout({ isMinimalShell }: { isMinimalShell: boolean }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
      <main className={cn('relative flex-1', isMinimalShell ? 'overflow-auto h-screen' : 'overflow-hidden')}>
        <Outlet />
      </main>
    </div>
  );
}

// ─── App Shell ──────────────────────────────────────────────────────────

export function AppShell() {
  const location = useLocation();
  const { tabBarVisible, focusMode, statusBarVisible, menuBarVisible, showBreadcrumbs } = useWorkspaceStore();
  const { activityBarVisible, position: activityBarPosition } = useActivityBarStore();
  const hasModuleToolbar = useModuleToolbarStore((s) => !!s.registration);
  const hasModuleFilters = useModuleFiltersStore((s) => s.hasAnyRegistration());
  const splitActive = useEditorGroupsStore((s) => s.splitActive);
  const splitDirection = useEditorGroupsStore((s) => s.splitDirection);
  const isModuleRoute = /^\/(atlas|lab)\/.+/.test(location.pathname);

  useKeyboardShortcuts();
  useRegisterAppPanels();
  useRegisterDetailPanel();

  useEffect(() => {
    const accent = getAccentContext(location.pathname);
    if (accent) document.documentElement.setAttribute('data-accent', accent);
    else document.documentElement.removeAttribute('data-accent');
  }, [location.pathname]);

  const isMinimalShell = MINIMAL_SHELL_PATHS.includes(location.pathname);
  const showChrome = !isMinimalShell && !focusMode;

  return (
    <ShellDndProvider>
      <TabManager />
      <CommandPalette />

      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {showChrome && menuBarVisible && <MenuBar />}

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {showChrome && activityBarVisible && activityBarPosition === 'left' && <ActivityBar />}

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            {showChrome && activityBarVisible && activityBarPosition === 'top' && <ActivityBar />}

            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
              <DesktopResizableLayout
                showChrome={showChrome} showBreadcrumbs={showBreadcrumbs}
                tabBarVisible={tabBarVisible} hasModuleToolbar={hasModuleToolbar}
                hasModuleFilters={hasModuleFilters} isModuleRoute={isModuleRoute}
                splitActive={splitActive} splitDirection={splitDirection}
              />
              <MobileLayout isMinimalShell={isMinimalShell} />
            </div>

            {showChrome && activityBarVisible && activityBarPosition === 'bottom' && <ActivityBar />}
          </div>

          {showChrome && activityBarVisible && activityBarPosition === 'right' && <ActivityBar />}
        </div>

        {showChrome && statusBarVisible && <StatusBar />}
      </div>

      {!focusMode && <MobileBottomBar />}
      {focusMode && <FocusModeIndicator />}
    </ShellDndProvider>
  );
}
