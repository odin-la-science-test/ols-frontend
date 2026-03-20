'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Rows2, PanelTop, X, Layers, Pin, Plus } from 'lucide-react'; // X used in SidebarTabBar close per-tab
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';
import {
  usePanelRegistryStore,
  type PanelZone,
  type PanelRegistration,
} from '@/stores/panel-registry-store';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useDndZoneHandler, useDndOverlay, useShellDnd, type DragMeta } from './shell-dnd-context';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED SIDEBAR — Single component for both primary and secondary sidebars
//
// These are MODULE-LEVEL sidebars (filters, detail, etc.).
// NO "+" button — panels are added/removed programmatically by modules.
// Activity bar panels live in their own zone (activity-bar-flyout).
//
// Supports:
//   - Tabs mode (switchable tabs at top)
//   - Stacked mode (resizable vertical split)
//   - Drag & drop panels between sidebars
//   - Consistent look & behavior on both sides
// ═══════════════════════════════════════════════════════════════════════════

/** Context for child panels to detect they're inside a multi-panel sidebar */
export interface UnifiedSidebarContextValue {
  /** Which zone this sidebar represents */
  zone: PanelZone;
  /** true when multiple panels are shown simultaneously */
  isMultiPanel: boolean;
  /** Current view mode */
  viewMode: 'tabs' | 'stacked';
}

const UnifiedSidebarContext = React.createContext<UnifiedSidebarContextValue | null>(null);

export function useUnifiedSidebarContext() {
  return React.useContext(UnifiedSidebarContext);
}

// ─── Panel Renderers Registry ───────────────────────────────────────────

/**
 * Map of panel id → React component.
 * App-level panels register here statically.
 * Module panels use portal zones and are handled differently.
 */
type PanelRenderer = React.ComponentType<{ panelId: string; zone: PanelZone }>;

const panelRenderers = new Map<string, PanelRenderer>();

/** Register a renderer for a panel id (called once at module load) */
export function registerPanelRenderer(panelId: string, renderer: PanelRenderer) {
  panelRenderers.set(panelId, renderer);
}

/** Get the renderer for a panel id */
export function getPanelRenderer(panelId: string): PanelRenderer | undefined {
  return panelRenderers.get(panelId);
}

// ─── Droppable zone for receiving panels ────────────────────────────────

function SidebarDropZone({
  zone,
  children,
  className,
}: {
  zone: PanelZone;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-drop-${zone}`,
    data: { type: 'sidebar-zone', zone } as const,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full overflow-hidden transition-colors duration-150',
        isOver && 'ring-2 ring-primary/30 ring-inset bg-primary/5',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Eject zone — drop target shown on sidebar edge during drag ──────────

/**
 * Invisible drop target shown on a sidebar edge while a sidebar-panel drag
 * is active. Dropping here moves the panel to `targetZone` and opens it.
 *
 * Rendered by AppShell outside the sidebar content so it's always present
 * even when the target sidebar is closed.
 */
export function SidebarEjectZone({
  targetZone,
  side,
  stackPosition = 'full',
}: {
  /** Which zone to drop into */
  targetZone: 'primary' | 'secondary';
  /** Which screen edge this zone hugs */
  side: 'left' | 'right';
  /** When both zones share the same side: 'top' | 'bottom' | 'full' */
  stackPosition?: 'top' | 'bottom' | 'full';
}) {
  const { activeDrag } = useShellDnd();
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-eject-${targetZone}`,
    data: { type: 'sidebar-zone', zone: targetZone } as const,
  });

  // Only visible during a sidebar-panel drag
  const isDragging = activeDrag?.type === 'sidebar-panel';
  // Don't show if the panel is already in this zone
  const sourceZone = activeDrag?.source as string | undefined;
  const isSelf = sourceZone === targetZone;

  if (!isDragging || isSelf) return null;

  const topClass = stackPosition === 'top' ? 'top-[10%] bottom-[55%]'
    : stackPosition === 'bottom' ? 'top-[55%] bottom-[10%]'
    : 'top-[20%] bottom-[20%]';

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: side === 'left' ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === 'left' ? -12 : 12 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute w-10 z-[60] flex items-center justify-center',
        'rounded-lg border-2 border-dashed transition-colors duration-150',
        side === 'left' ? 'left-1' : 'right-1',
        topClass,
        isOver
          ? 'border-primary bg-primary/20 text-primary'
          : 'border-border/60 bg-muted/30 text-muted-foreground',
      )}
    >
      <div className="flex flex-col items-center gap-1 text-[9px] font-medium uppercase tracking-wider select-none">
        <span>{side === 'left' ? '←' : '→'}</span>
      </div>
    </motion.div>
  );
}

// ─── Draggable tab button (primary / secondary only) ────────────────────

function DraggableTab({
  panel,
  zone,
  isActive,
  density,
  onClick,
  onClose,
  showClose,
}: {
  panel: PanelRegistration;
  zone: PanelZone;
  isActive: boolean;
  density: string;
  onClick: () => void;
  onClose: () => void;
  showClose: boolean;
}) {
  // Only primary/secondary panels are draggable between zones
  const canDrag = zone === 'primary' || zone === 'secondary';
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-tab-${zone}-${panel.id}`,
    disabled: !canDrag,
    data: { type: 'sidebar-panel', id: panel.id, source: zone } satisfies DragMeta,
  });

  return (
    <button
      ref={setNodeRef}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={cn(
        'relative flex-1 min-w-0 flex items-center gap-1.5 transition-colors cursor-pointer select-none',
        'border-r last:border-r-0 border-border/30',
        density === 'compact' ? 'px-2 py-1' : 'px-2.5 py-1.5',
        isActive ? 'bg-muted/30' : 'bg-muted/10 hover:bg-muted/20',
        isDragging && 'opacity-40',
        canDrag && !isDragging && 'cursor-grab active:cursor-grabbing',
      )}
    >
      <span
        className={cn(
          'flex-1 min-w-0 text-[10px] font-medium uppercase tracking-wider truncate',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {panel.label}
      </span>
      {showClose && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-3 w-3" />
        </span>
      )}
      {/* Active indicator */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-[2px] transition-colors',
          isActive ? '' : 'bg-transparent',
        )}
        style={isActive ? { backgroundColor: panel.accentColor ?? 'hsl(var(--primary))' } : undefined}
      />
    </button>
  );
}

// ─── Tab bar for multi-panel sidebar ────────────────────────────────────

interface SidebarTabBarProps {
  panels: PanelRegistration[];
  activeTab: string | null;
  onTabClick: (panelId: string) => void;
  onTabClose: (panelId: string) => void;
  density: string;
  zone: PanelZone;
}

function SidebarTabBar({
  panels,
  activeTab,
  onTabClick,
  onTabClose,
  density,
  zone,
}: SidebarTabBarProps) {
  return (
    <div className="flex shrink-0 border-b border-border/30">
      {panels.map((panel) => {
        const isActive = panel.id === activeTab;
        return (
          <DraggableTab
            key={panel.id}
            panel={panel}
            zone={zone}
            isActive={isActive}
            density={density}
            onClick={() => onTabClick(panel.id)}
            onClose={() => onTabClose(panel.id)}
            showClose={panels.length > 1}
          />
        );
      })}
    </div>
  );
}

// ─── Stacked mode with mini headers ─────────────────────────────────────

interface SidebarStackedProps {
  zone: PanelZone;
  panels: PanelRegistration[];
  renderPanel: (panelId: string) => React.ReactNode;
  onPanelClose: (panelId: string) => void;
  panelGroupId: string;
}

function SidebarStacked({
  zone,
  panels,
  renderPanel,
  onPanelClose,
  panelGroupId,
}: SidebarStackedProps) {
  const defaultSize = Math.floor(100 / panels.length);

  return (
    <ResizablePanelGroup orientation="vertical" id={panelGroupId}>
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          {index > 0 && <ResizableHandle />}
          <ResizablePanel
            id={`${panelGroupId}-${panel.id}`}
            defaultSize={String(defaultSize) as any}
            minSize="15"
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mini header */}
              <div className="shrink-0 flex items-center justify-between px-3 py-1 border-b border-border/30 bg-muted/20">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider truncate text-muted-foreground"
                  style={panel.accentColor ? { color: panel.accentColor } : undefined}
                >
                  {panel.label}
                </span>
                <button
                  onClick={() => onPanelClose(panel.id)}
                  className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {/* Panel content */}
              <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: true, viewMode: 'stacked' }}>
                <div className="flex-1 overflow-hidden">
                  {renderPanel(panel.id)}
                </div>
              </UnifiedSidebarContext.Provider>
            </div>
          </ResizablePanel>
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
}

// ─── Unified Sidebar Content ────────────────────────────────────────────

interface UnifiedSidebarContentProps {
  /** Which zone this sidebar renders */
  zone: PanelZone;
  /** Custom renderer map: panelId → ReactNode. Used by app-shell to inject panel content. */
  renderPanel: (panelId: string) => React.ReactNode;
  /**
   * 'sidebar' (default) — module-level side panel, bg-card, chevron close button.
   * 'activity' — app-level flyout next to activity bar, bg-card/80, X close button.
   */
  variant?: 'sidebar' | 'activity';
  className?: string;
}

/**
 * Content-only sidebar component — no outer wrapping container.
 * Used inside a ResizablePanel by AppShell.
 *
 * Renders module-level panels from the panel-registry-store for the given zone.
 * Supports tabs mode and stacked mode.
 * NO "+" button — panels are managed by modules programmatically.
 */
export function UnifiedSidebarContent({
  zone,
  renderPanel,
  variant = 'sidebar',
  className,
}: UnifiedSidebarContentProps) {
  const { t } = useTranslation();
  const d = useDensity();

  // Read zone state
  const zoneState = usePanelRegistryStore((s) => s.zones[zone] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const allPanels = usePanelRegistryStore((s) => s.panels);
  const removeFromZone = usePanelRegistryStore((s) => s.removeFromZone);
  const setActiveTab = usePanelRegistryStore((s) => s.setActiveTab);
  const toggleViewMode = usePanelRegistryStore((s) => s.toggleViewMode);
  const closeZone = usePanelRegistryStore((s) => s.closeZone);
  const addToZone = usePanelRegistryStore((s) => s.addToZone);

  // Overlay/dock mode — for all 3 zones
  const activityMode = useSidebarModeStore((s) => s.activityMode);
  const primaryMode = useSidebarModeStore((s) => s.primaryMode);
  const secondaryMode = useSidebarModeStore((s) => s.secondaryMode);
  const toggleActivityMode = useSidebarModeStore((s) => s.toggleActivityMode);
  const togglePrimaryMode = useSidebarModeStore((s) => s.togglePrimaryMode);
  const toggleSecondaryMode = useSidebarModeStore((s) => s.toggleSecondaryMode);
  const currentMode = zone === 'activity-panel' ? activityMode : zone === 'primary' ? primaryMode : zone === 'secondary' ? secondaryMode : 'dock';
  const isOverlay = currentMode === 'overlay';
  const isPinned = currentMode === 'pinned';
  const toggleMode = zone === 'activity-panel' ? toggleActivityMode : zone === 'primary' ? togglePrimaryMode : zone === 'secondary' ? toggleSecondaryMode : null;

  const { stack, activeTab, viewMode, isOpen } = zoneState;

  const isActivity = variant === 'activity';
  const isLeft = zone === 'primary' || zone === 'activity-panel';

  // Resolve panel registrations for the stack (filter out unregistered)
  const stackPanels = React.useMemo(
    () => stack
      .map((id) => allPanels[id])
      .filter(Boolean) as PanelRegistration[],
    [stack, allPanels],
  );

  // Available panels to add (activity-panel only: app panels not yet in stack)
  const availablePanels = React.useMemo(() => {
    if (!isActivity) return [];
    return Object.values(allPanels).filter(
      (p) => p.zone === 'activity-panel' && !stack.includes(p.id)
    ) as PanelRegistration[];
  }, [isActivity, allPanels, stack]);

  const isMultiPanel = stackPanels.length > 1;
  const resolvedActiveTab = stackPanels.find((p) => p.id === activeTab)?.id ?? stackPanels[0]?.id ?? null;

  // Single-panel drag handle (primary/secondary only, when there's exactly 1 panel)
  const singlePanelId = !isMultiPanel && stackPanels[0]?.id;
  const canDragSingle = !isMultiPanel && (zone === 'primary' || zone === 'secondary') && !!singlePanelId;
  const {
    attributes: singleDragAttrs,
    listeners: singleDragListeners,
    setNodeRef: singleDragRef,
    isDragging: singleIsDragging,
  } = useDraggable({
    id: `sidebar-tab-${zone}-${singlePanelId ?? '_'}`,
    disabled: !canDragSingle,
    data: { type: 'sidebar-panel', id: singlePanelId ?? '', source: zone } satisfies DragMeta,
  });

  // Header title
  const headerTitle = isMultiPanel
    ? t('workspace.panels', 'Panneaux')
    : stackPanels[0]?.label ?? '';

  const handleTabClick = React.useCallback((panelId: string) => {
    setActiveTab(zone, panelId);
  }, [zone, setActiveTab]);

  const handleTabClose = React.useCallback((panelId: string) => {
    removeFromZone(zone, panelId);
  }, [zone, removeFromZone]);

  // DnD overlay ghost for sidebar-panel drags
  useDndOverlay('sidebar-panel', React.useCallback((drag: DragMeta) => {
    const panel = usePanelRegistryStore.getState().panels[drag.id];
    return (
      <div className="px-3 py-1 rounded-md bg-card border border-primary/50 shadow-lg text-xs font-medium text-foreground opacity-90">
        {panel?.label ?? drag.id}
      </div>
    );
  }, []));

  // Register drag & drop handler for this sidebar zone
  // Panels can be dragged between primary ↔ secondary only.
  // activity-panel accepts only 'app' category panels (managed via + button, not DnD).
  useDndZoneHandler(
    `sidebar-${zone}`,
    React.useCallback((event: DragEndEvent) => {
      const meta = event.active.data.current as DragMeta | undefined;
      if (!meta || meta.type !== 'sidebar-panel') return;

      const over = event.over;
      if (!over) return;

      const overData = over.data.current as { type?: string; zone?: PanelZone } | undefined;
      if (overData?.type !== 'sidebar-zone') return;

      const targetZone = overData.zone;
      if (!targetZone || targetZone === meta.source) return;

      // Activity panel is NOT a DnD target — it's managed via the + button only
      if (targetZone === 'activity-panel') return;

      // Only allow moves between primary ↔ secondary
      const validSource = meta.source === 'primary' || meta.source === 'secondary';
      const validTarget = targetZone === 'primary' || targetZone === 'secondary';
      if (!validSource || !validTarget) return;

      // Prevent module panels from having 'app' category constraint violations
      // (app panels like explorer/notes can live in primary/secondary if user drags them)
      if (targetZone === zone) {
        usePanelRegistryStore.getState().movePanel(meta.id, targetZone);
      }
    }, [zone]),
  );

  // + button menu state (activity only)
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const [addMenuPos, setAddMenuPos] = React.useState<{ top: number; left: number } | null>(null);
  const addBtnRef = React.useRef<HTMLButtonElement>(null);
  const addMenuRef = React.useRef<HTMLDivElement>(null);

  const openAddMenu = React.useCallback(() => {
    if (addBtnRef.current) {
      const r = addBtnRef.current.getBoundingClientRect();
      setAddMenuPos({ top: r.bottom + 4, left: r.left });
    }
    setAddMenuOpen((v) => !v);
  }, []);

  // Close add menu on outside click — exclude both the button and the portal menu
  React.useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        addBtnRef.current?.contains(target) ||
        addMenuRef.current?.contains(target)
      ) return;
      setAddMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addMenuOpen]);

  // Don't render if not open or no panels
  if (!isOpen || stackPanels.length === 0) return null;

  return (
    <SidebarDropZone zone={zone} className={className}>
      <div
        className={cn(
          'flex flex-col h-full',
          isActivity ? 'bg-card/80' : 'bg-card',
          isActivity
            ? 'border-r border-border/50'
            : isLeft ? 'border-r border-border' : 'border-l border-border',
        )}
      >
        {/* Header — overflow visible so dropdowns can escape */}
        <div
          className={cn(
            'flex items-center px-3 border-b border-border/50 justify-between shrink-0 relative',
            d.density === 'compact' ? 'h-8' : 'h-10',
          )}
        >
          <span
            ref={canDragSingle ? singleDragRef : undefined}
            {...(canDragSingle ? { ...singleDragAttrs, ...singleDragListeners } : {})}
            className={cn(
              'text-xs font-medium text-muted-foreground uppercase tracking-wider select-none',
              canDragSingle && !singleIsDragging && 'cursor-grab active:cursor-grabbing',
              singleIsDragging && 'opacity-40',
            )}
          >
            {headerTitle}
          </span>
          <div className="flex items-center gap-0.5">
            {/* + button with dropdown: add available panel (activity only, max 2) */}
            {isActivity && availablePanels.length > 0 && stack.length < 2 && (
              <div data-add-menu>
                <button
                  ref={addBtnRef}
                  onClick={openAddMenu}
                  className={cn(
                    'p-1 rounded-lg transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    addMenuOpen && 'bg-muted/50 text-foreground',
                  )}
                  title={t('workspace.addPanel', 'Ajouter un panneau')}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                {addMenuOpen && addMenuPos && createPortal(
                  <div
                    ref={addMenuRef}
                    className="fixed z-[9999] min-w-[140px] bg-popover border border-border rounded-lg shadow-lg py-1"
                    style={{ top: addMenuPos.top, left: addMenuPos.left }}
                  >
                    {availablePanels.map((p) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => { e.stopPropagation(); addToZone('activity-panel', p.id); setAddMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 text-foreground transition-colors whitespace-nowrap"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
              </div>
            )}
            {/* Mode toggle: dock → overlay → pinned → dock */}
            {toggleMode && (
              <button
                onClick={toggleMode}
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
                title={currentMode === 'dock'
                  ? t('settingsPage.sidebarModeOverlay', 'Superposer')
                  : currentMode === 'overlay'
                  ? t('settingsPage.sidebarModePinned', 'Épingler (sans fond)')
                  : t('settingsPage.sidebarModeDock', 'Ancrer')
                }
              >
                {currentMode === 'dock' && <Layers className="h-3.5 w-3.5" />}
                {currentMode === 'overlay' && <Pin className="h-3.5 w-3.5" />}
                {isPinned && <Pin className="h-3.5 w-3.5 text-primary" />}
              </button>
            )}
            {/* View mode toggle (when multi-panel) */}
            {isMultiPanel && (
              <button
                onClick={() => toggleViewMode(zone)}
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
                title={viewMode === 'tabs'
                  ? t('workspace.sidebarLayoutStacked', 'Vue empilée')
                  : t('workspace.sidebarLayoutTabs', 'Vue onglets')
                }
              >
                {viewMode === 'tabs'
                  ? <Rows2 className="h-3.5 w-3.5" />
                  : <PanelTop className="h-3.5 w-3.5" />
                }
              </button>
            )}
            {/* Close button */}
            <button
              onClick={() => closeZone(zone)}
              className={cn(
                'p-1 rounded-lg',
                'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                'transition-colors',
              )}
              title={t('workspace.collapse')}
            >
              {isLeft
                ? <ChevronLeft className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>

        {/* Panel content — overflow-hidden here, not on root, so header dropdowns escape */}
        <div className="flex-1 overflow-hidden min-h-0">
        {isMultiPanel ? (
          viewMode === 'tabs' ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarTabBar
                panels={stackPanels}
                activeTab={resolvedActiveTab}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
                density={d.density}
                zone={zone}
              />
              <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: true, viewMode: 'tabs' }}>
                <div className="flex-1 overflow-hidden">
                  {resolvedActiveTab && renderPanel(resolvedActiveTab)}
                </div>
              </UnifiedSidebarContext.Provider>
            </div>
          ) : (
            <SidebarStacked
              zone={zone}
              panels={stackPanels}
              renderPanel={renderPanel}
              onPanelClose={handleTabClose}
              panelGroupId={`unified-sidebar-${zone}`}
            />
          )
        ) : (
          // Single panel — direct render with animation
          <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: false, viewMode: 'tabs' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stackPanels[0]?.id}
                initial={{ opacity: 0, x: isLeft ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLeft ? 10 : -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {stackPanels[0] && renderPanel(stackPanels[0].id)}
              </motion.div>
            </AnimatePresence>
          </UnifiedSidebarContext.Provider>
        )}
        </div>{/* end panel content wrapper */}
      </div>
    </SidebarDropZone>
  );
}
