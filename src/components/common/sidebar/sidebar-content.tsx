'use client';

import { useCallback, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useDensity } from '@/hooks';
import {
  usePanelRegistryStore,
  type PanelZone,
  type PanelRegistration,
} from '@/stores/panel-registry-store';
import { useDndZoneHandler, type DragMeta } from '@/components/common/shell-dnd-context';
import type { DragEndEvent } from '@dnd-kit/core';

import { UnifiedSidebarContext } from './sidebar-context';
import { SidebarDropZone } from './sidebar-drop-zone';
import { SidebarHeader } from './sidebar-header';
import { SidebarTabBar } from './sidebar-tab-bar';
import { SidebarStacked } from './sidebar-stacked';
import type { UnifiedSidebarContentProps } from './types';

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
  const reorderInZone = usePanelRegistryStore((s) => s.reorderInZone);

  // Overlay/dock mode
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

  // Side switching
  const primarySide = useSidebarModeStore((s) => s.primarySide);
  const secondarySide = useSidebarModeStore((s) => s.secondarySide);
  const setPrimarySide = useSidebarModeStore((s) => s.setPrimarySide);
  const setSecondarySide = useSidebarModeStore((s) => s.setSecondarySide);

  const { stack, activeTab, viewMode, isOpen } = zoneState;

  const isActivity = variant === 'activity';
  const isLeft = zone === 'activity-panel'
    ? true
    : zone === 'primary'
      ? primarySide === 'left'
      : secondarySide === 'left';

  // Resolve panel registrations
  const stackPanels = useMemo(
    () => stack
      .map((id) => allPanels[id])
      .filter(Boolean) as PanelRegistration[],
    [stack, allPanels],
  );

  // Available panels to add (activity-panel only)
  const availablePanels = useMemo(() => {
    if (!isActivity) return [];
    return Object.values(allPanels).filter(
      (p) => p.zone === 'activity-panel' && !stack.includes(p.id)
    ) as PanelRegistration[];
  }, [isActivity, allPanels, stack]);

  const isMultiPanel = stackPanels.length > 1;
  const resolvedActiveTab = stackPanels.find((p) => p.id === activeTab)?.id ?? stackPanels[0]?.id ?? null;

  const headerTitle = isActivity
    ? (isMultiPanel ? t('workspace.panels', 'Panneaux') : stackPanels[0]?.label ?? '')
    : zone === 'primary'
      ? t('workspace.primarySidebar', 'Primary')
      : zone === 'secondary'
        ? t('workspace.secondarySidebar', 'Secondary')
        : t('workspace.panels', 'Panneaux');

  const handleTabClick = useCallback((panelId: string) => {
    setActiveTab(zone, panelId);
  }, [zone, setActiveTab]);

  const handleTabClose = useCallback((panelId: string) => {
    removeFromZone(zone, panelId);
    // Close the zone if that was the last panel
    const remaining = usePanelRegistryStore.getState().zones[zone]?.stack ?? [];
    if (remaining.length === 0) {
      closeZone(zone);
    }
  }, [zone, removeFromZone, closeZone]);

  // Flip sidebar side
  const handleFlipSide = useCallback(() => {
    if (zone === 'primary') {
      setPrimarySide(primarySide === 'left' ? 'right' : 'left');
    } else if (zone === 'secondary') {
      setSecondarySide(secondarySide === 'left' ? 'right' : 'left');
    }
  }, [zone, primarySide, secondarySide, setPrimarySide, setSecondarySide]);

  // Callback wrappers for header
  const handleToggleViewMode = useCallback(() => toggleViewMode(zone), [zone, toggleViewMode]);
  const handleCloseZone = useCallback(() => closeZone(zone), [zone, closeZone]);
  const handleAddToZone = useCallback((panelId: string) => addToZone('activity-panel', panelId), [addToZone]);

  // DnD handler: cross-zone moves + within-zone reorder
  useDndZoneHandler(
    `sidebar-${zone}`,
    useCallback((event: DragEndEvent) => {
      const meta = event.active.data.current as DragMeta | undefined;
      if (!meta || meta.type !== 'sidebar-panel') return;

      const over = event.over;
      if (!over) return;

      const overData = over.data.current as Record<string, unknown> | undefined;

      // Case 1: Dropped on a sidebar-zone drop zone (cross-zone move)
      if (overData?.type === 'sidebar-zone') {
        const targetZone = overData.zone as PanelZone;
        if (!targetZone || targetZone === meta.source) return;
        if (targetZone === 'activity-panel') return;
        const validSource = meta.source === 'primary' || meta.source === 'secondary';
        const validTarget = targetZone === 'primary' || targetZone === 'secondary';
        if (!validSource || !validTarget) return;
        usePanelRegistryStore.getState().movePanel(meta.id, targetZone);
        return;
      }

      // Case 2: Dropped on another sortable tab (reorder or cross-zone)
      if (overData?.type === 'sidebar-panel') {
        const overSource = overData.source as string;
        const overPanelId = overData.id as string;

        // Same zone -> reorder
        if (meta.source === overSource && meta.source === zone) {
          const currentStack = usePanelRegistryStore.getState().zones[zone]?.stack ?? [];
          const oldIndex = currentStack.indexOf(meta.id);
          const newIndex = currentStack.indexOf(overPanelId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderInZone(zone, oldIndex, newIndex);
          }
          return;
        }

        // Different zone -> cross-zone move
        if (meta.source !== overSource) {
          const targetZone = overSource as PanelZone;
          if (targetZone === 'activity-panel') return;
          const validSource = meta.source === 'primary' || meta.source === 'secondary';
          const validTarget = targetZone === 'primary' || targetZone === 'secondary';
          if (!validSource || !validTarget) return;
          usePanelRegistryStore.getState().movePanel(meta.id, targetZone);
        }
      }
    }, [zone, reorderInZone]),
  );

  // Don't render if not open or no panels
  if (!isOpen || stackPanels.length === 0) return null;

  return (
    <SidebarDropZone zone={zone} className={className}>
      <div
        className={cn(
          'flex flex-col h-full',
          isActivity ? 'surface-low' : 'surface-high',
          isActivity && (isLeft ? 'border-r border-border/30' : 'border-l border-border/30'),
          !isActivity && isOverlay && (isLeft ? 'border-r border-border/30' : 'border-l border-border/30'),
        )}
      >
        <SidebarHeader
          zone={zone}
          isActivity={isActivity}
          isLeft={isLeft}
          isOverlay={isOverlay}
          isPinned={isPinned}
          isMultiPanel={isMultiPanel}
          headerTitle={headerTitle}
          density={d.density}
          viewMode={viewMode}
          currentMode={currentMode}
          availablePanels={availablePanels}
          stackLength={stack.length}
          toggleMode={toggleMode}
          toggleViewMode={handleToggleViewMode}
          closeZone={handleCloseZone}
          addToZone={handleAddToZone}
          flipSide={handleFlipSide}
        />

        {/* Panel content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Primary/Secondary: always show tab bar (even for 1 panel) */}
        {!isActivity ? (
          isMultiPanel && viewMode === 'stacked' ? (
            <SidebarStacked
              zone={zone}
              panels={stackPanels}
              renderPanel={renderPanel}
              onPanelClose={handleTabClose}
              panelGroupId={`unified-sidebar-${zone}`}
            />
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarTabBar
                panels={stackPanels}
                activeTab={resolvedActiveTab}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
                density={d.density}
                zone={zone}
                alwaysShowClose
              />
              <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel, viewMode: 'tabs', suppressModuleHeader: true }}>
                <div className="flex-1 overflow-hidden">
                  {resolvedActiveTab && renderPanel(resolvedActiveTab)}
                </div>
              </UnifiedSidebarContext.Provider>
            </div>
          )
        ) : (
          /* Activity sidebar: original behavior */
          isMultiPanel ? (
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
                <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: true, viewMode: 'tabs', suppressModuleHeader: true }}>
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
            <UnifiedSidebarContext.Provider value={{ zone, isMultiPanel: false, viewMode: 'tabs', suppressModuleHeader: true }}>
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
          )
        )}
        </div>
      </div>
    </SidebarDropZone>
  );
}
