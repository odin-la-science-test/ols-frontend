import type { SidebarZoneState, PanelZone, SidebarViewMode } from '@/stores/panel-registry-store';
import type { SidebarMode } from '@/stores/sidebar-mode-store';
import type { BottomPanelTab } from '@/stores/bottom-panel-store';
import type { SplitDirection } from '@/stores/editor-groups-store';
import type { ViewMode } from '@/components/modules/types';

import { useLayoutStore } from '@/stores/layout-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useViewStore } from '@/stores/view-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE SNAPSHOT — Per-module layout capture / restore
//
// Captures layout state from 6 stores on module unmount, restores on re-entry.
// Follows the same guard pattern as profiles-store captureSnapshot/applySnapshot.
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkspaceSnapshot {
  // Layout sizes
  horizontalSizes: number[] | null;
  verticalSizes: number[] | null;
  // Panel zones (primary + secondary only)
  primaryZone: SidebarZoneState;
  secondaryZone: SidebarZoneState;
  // Panel placements (primary/secondary only, NOT activity-panel)
  panelPlacements: Record<string, PanelZone>;
  // Sidebar modes + sides (primary + secondary)
  primaryMode: SidebarMode;
  secondaryMode: SidebarMode;
  primarySide: 'left' | 'right';
  secondarySide: 'left' | 'right';
  // Bottom panel
  bottomPanelVisible: boolean;
  bottomPanelActiveTab: BottomPanelTab;
  bottomPanelHeight: number;
  // View mode
  viewMode: ViewMode;
  // Split extras (only for __split__ key)
  splitDirection?: SplitDirection;
  splitPanelSizes?: number[];
}

/** Guard flag — prevents profiles auto-save from reacting to intermediate states during restore */
let _applyingWorkspaceSnapshot = false;

/** Check if a workspace snapshot is currently being applied */
export function isApplyingWorkspaceSnapshot(): boolean {
  return _applyingWorkspaceSnapshot;
}

/** Capture the current workspace layout into a WorkspaceSnapshot */
export function captureWorkspaceSnapshot(isSplitMode: boolean): WorkspaceSnapshot {
  const layout = useLayoutStore.getState();
  const panelRegistry = usePanelRegistryStore.getState();
  const sidebarMode = useSidebarModeStore.getState();
  const bottomPanel = useBottomPanelStore.getState();
  const view = useViewStore.getState();
  const editorGroups = useEditorGroupsStore.getState();

  // Deep-copy zone stacks to avoid reference sharing
  const primaryZone = panelRegistry.zones.primary;
  const secondaryZone = panelRegistry.zones.secondary;

  // Filter panelPlacements to exclude activity-panel entries
  const filteredPlacements: Record<string, PanelZone> = {};
  for (const [id, zone] of Object.entries(panelRegistry.panelPlacements)) {
    if (zone !== 'activity-panel') {
      filteredPlacements[id] = zone;
    }
  }

  const snapshot: WorkspaceSnapshot = {
    horizontalSizes: layout.horizontalSizes ? [...layout.horizontalSizes] : null,
    verticalSizes: layout.verticalSizes ? [...layout.verticalSizes] : null,
    primaryZone: {
      stack: [...primaryZone.stack],
      activeTab: primaryZone.activeTab,
      viewMode: primaryZone.viewMode,
      isOpen: primaryZone.isOpen,
    },
    secondaryZone: {
      stack: [...secondaryZone.stack],
      activeTab: secondaryZone.activeTab,
      viewMode: secondaryZone.viewMode,
      isOpen: secondaryZone.isOpen,
    },
    panelPlacements: filteredPlacements,
    primaryMode: sidebarMode.primaryMode,
    secondaryMode: sidebarMode.secondaryMode,
    primarySide: sidebarMode.primarySide,
    secondarySide: sidebarMode.secondarySide,
    bottomPanelVisible: bottomPanel.visible,
    bottomPanelActiveTab: bottomPanel.activeTab,
    bottomPanelHeight: bottomPanel.panelHeight,
    viewMode: view.viewMode,
  };

  // Include split extras only when in split mode
  if (isSplitMode) {
    snapshot.splitDirection = editorGroups.splitDirection;
    snapshot.splitPanelSizes = [...editorGroups.panelSizes];
  }

  return snapshot;
}

/** Apply a WorkspaceSnapshot to all relevant stores */
export function applyWorkspaceSnapshot(snapshot: WorkspaceSnapshot): void {
  _applyingWorkspaceSnapshot = true;
  try {
    // Layout sizes
    const layout = useLayoutStore.getState();
    if (snapshot.horizontalSizes) layout.setHorizontalSizes(snapshot.horizontalSizes);
    if (snapshot.verticalSizes) layout.setVerticalSizes(snapshot.verticalSizes);

    // Panel zones — preserve activity-panel zone, override primary/secondary
    const panelRegistry = usePanelRegistryStore.getState();
    usePanelRegistryStore.setState({
      zones: {
        ...panelRegistry.zones,
        primary: {
          stack: [...snapshot.primaryZone.stack],
          activeTab: snapshot.primaryZone.activeTab,
          viewMode: snapshot.primaryZone.viewMode as SidebarViewMode,
          isOpen: snapshot.primaryZone.isOpen,
        },
        secondary: {
          stack: [...snapshot.secondaryZone.stack],
          activeTab: snapshot.secondaryZone.activeTab,
          viewMode: snapshot.secondaryZone.viewMode as SidebarViewMode,
          isOpen: snapshot.secondaryZone.isOpen,
        },
      },
    });

    // Merge panelPlacements — keep existing activity-panel entries, override primary/secondary
    const existingPlacements = usePanelRegistryStore.getState().panelPlacements;
    const mergedPlacements: Record<string, PanelZone> = {};
    // Keep activity-panel entries from existing
    for (const [id, zone] of Object.entries(existingPlacements)) {
      if (zone === 'activity-panel') {
        mergedPlacements[id] = zone;
      }
    }
    // Override with snapshot placements
    for (const [id, zone] of Object.entries(snapshot.panelPlacements)) {
      mergedPlacements[id] = zone;
    }
    usePanelRegistryStore.setState({ panelPlacements: mergedPlacements });

    // Sidebar modes + sides
    const sidebarMode = useSidebarModeStore.getState();
    sidebarMode.setPrimaryMode(snapshot.primaryMode);
    sidebarMode.setSecondaryMode(snapshot.secondaryMode);
    if (snapshot.primarySide) sidebarMode.setPrimarySide(snapshot.primarySide);
    if (snapshot.secondarySide) sidebarMode.setSecondarySide(snapshot.secondarySide);

    // Bottom panel
    const bottomPanel = useBottomPanelStore.getState();
    bottomPanel.setVisible(snapshot.bottomPanelVisible);
    bottomPanel.setActiveTab(snapshot.bottomPanelActiveTab);
    bottomPanel.setPanelHeight(snapshot.bottomPanelHeight);

    // View mode
    useViewStore.getState().setViewMode(snapshot.viewMode);

    // Split extras
    if (snapshot.splitDirection !== undefined) {
      useEditorGroupsStore.getState().setSplitDirection(snapshot.splitDirection);
    }
    if (snapshot.splitPanelSizes !== undefined) {
      useEditorGroupsStore.getState().setPanelSizes(snapshot.splitPanelSizes);
    }
  } finally {
    setTimeout(() => { _applyingWorkspaceSnapshot = false; }, 50);
  }
}

/** Get the snapshot key for a module path */
export function getSnapshotKey(modulePath: string, isSplitMode: boolean): string {
  return isSplitMode ? '__split__' : modulePath;
}
