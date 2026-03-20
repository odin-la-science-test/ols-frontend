import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePanelRegistryStore } from './panel-registry-store';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY BAR STORE — App-level navigation bar (refactored)
//
// The Activity Bar now focuses on:
//   1. Its own visibility and position
//   2. Managing which app-level panels are shown in its icon list
//   3. Delegating panel open/close to the panel-registry-store
//
// Panel state (which panel is open, stacking, etc.) is now handled by
// panel-registry-store. The Activity Bar simply tells it what to toggle.
//
// Two types of items:
//   "navigate" → direct navigation (Settings)
//   "panel"    → toggle a panel in the primary sidebar via panel-registry
//
// Panel stacking:
//   Normal click  → replaces the sidebar stack with a single panel
//   Ctrl+Click    → adds the panel to the current stack
// ═══════════════════════════════════════════════════════════════════════════

export type ActivityBarItemId =
  | 'explorer'
  | 'notes'
  | 'notifications'
  | 'settings';

/** Position of the activity bar in the layout */
export type ActivityBarPosition = 'left' | 'top' | 'right' | 'bottom';

/** Panel IDs that open a sidebar panel */
export type SidebarPanelId = 'explorer' | 'tools' | 'notes' | 'notifications';

export interface ActivityBarItem {
  id: ActivityBarItemId;
  icon: string;
  /** For "navigate" items: the route path. For "panel" items: unused. */
  path: string;
  /** Whether this item is visible in the bar */
  visible: boolean;
  /** "navigate" = direct navigation, "panel" = toggle sidebar panel */
  type: 'navigate' | 'panel';
}

interface ActivityBarState {
  /** Whether the activity bar is visible */
  activityBarVisible: boolean;
  /** Position of the activity bar: left (default), top, right, bottom */
  position: ActivityBarPosition;
  /** Ordered list of activity bar items with visibility */
  items: ActivityBarItem[];
  /** Badge counts per item id */
  badges: Partial<Record<ActivityBarItemId, number>>;

  // Actions
  setActivityBarVisible: (visible: boolean) => void;
  toggleActivityBar: () => void;
  setPosition: (position: ActivityBarPosition) => void;
  setItemVisible: (id: ActivityBarItemId, visible: boolean) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  setBadge: (id: ActivityBarItemId, count: number) => void;
  clearBadge: (id: ActivityBarItemId) => void;
  resetToDefaults: () => void;
  /** Open a panel or toggle it. Delegates to panel-registry-store. */
  togglePanel: (panelId: SidebarPanelId) => void;
  /** Stack a panel (Ctrl+Click). Delegates to panel-registry-store. */
  stackPanel: (panelId: SidebarPanelId) => void;
  setActivePanel: (panelId: SidebarPanelId | null) => void;
}

const DEFAULT_ITEMS: ActivityBarItem[] = [
  { id: 'explorer', icon: 'file', path: '', visible: true, type: 'panel' },
  { id: 'notes', icon: 'notebook-pen', path: '', visible: true, type: 'panel' },
  { id: 'notifications', icon: 'bell', path: '', visible: true, type: 'panel' },
  { id: 'settings', icon: 'settings', path: '/settings', visible: true, type: 'navigate' },
];

export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (set, _get) => ({
      activityBarVisible: true,
      position: 'left',
      items: DEFAULT_ITEMS,
      badges: {},

      setActivityBarVisible: (visible) => {
        set({ activityBarVisible: visible });
      },

      toggleActivityBar: () => {
        set((state) => ({ activityBarVisible: !state.activityBarVisible }));
      },

      setPosition: (position) => {
        set({ position });
      },

      setItemVisible: (id, visible) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, visible } : item
          ),
        }));
      },

      reorderItems: (fromIndex, toIndex) => {
        set((state) => {
          const newItems = [...state.items];
          const [removed] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, removed);
          return { items: newItems };
        });
      },

      setBadge: (id, count) => {
        set((state) => ({
          badges: { ...state.badges, [id]: count },
        }));
      },

      clearBadge: (id) => {
        set((state) => {
          const newBadges = { ...state.badges };
          delete newBadges[id];
          return { badges: newBadges };
        });
      },

      resetToDefaults: () => {
        set({ items: DEFAULT_ITEMS, badges: {}, position: 'left' });
        usePanelRegistryStore.getState().resetToDefaults();
      },

      togglePanel: (panelId) => {
        usePanelRegistryStore.getState().togglePanel(panelId, 'activity-panel');
      },

      stackPanel: (panelId) => {
        usePanelRegistryStore.getState().stackPanel(panelId, 'activity-panel');
      },

      setActivePanel: (panelId) => {
        const registry = usePanelRegistryStore.getState();
        if (panelId) {
          const zone = registry.zones['activity-panel'];
          if (zone.stack.includes(panelId)) {
            registry.setActiveTab('activity-panel', panelId);
            registry.openZone('activity-panel');
          } else {
            registry.setZoneStack('activity-panel', [panelId]);
          }
        } else {
          registry.closeZone('activity-panel');
        }
      },
    }),
    {
      name: 'ols-activity-bar',
      version: 10,
      partialize: (state) => ({
        activityBarVisible: state.activityBarVisible,
        position: state.position,
        items: state.items,
        badges: state.badges,
      }),
    }
  )
);